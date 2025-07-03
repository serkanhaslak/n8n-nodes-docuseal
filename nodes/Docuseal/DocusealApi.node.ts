import { NodeOperationError } from 'n8n-workflow';

import type {
	INodeTypeDescription,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	IDataObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';

import {
	docusealApiRequest,
	getTemplates,
	parseJsonInput,
	prepareBinaryData,
	buildSubmittersArray,
	buildFieldValues,
	formatDate,
	validateUrl,
} from './GenericFunctions';

import { templateOperations, templateFields } from './TemplateDescription';

import { submissionOperations, submissionFields } from './SubmissionDescription';

import { submitterOperations, submitterFields } from './SubmitterDescription';

import { formOperations, formFields } from './FormDescription';

import { aiToolOperations, aiToolFields } from './AiToolDescription';

/**
 * DocuSeal API Node for n8n
 * Provides integration with DocuSeal document management platform
 * Supports operations for templates, submissions, submitters, and forms
 * @implements {INodeType}
 */
export class DocusealApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DocuSeal',
		name: 'docusealApi',
		icon: 'file:docuseal.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Create documents, manage templates, and handle submissions with DocuSeal',
		defaults: {
			name: 'DocuSeal',
		},
		inputs: [{ type: 'main' as any }],
		outputs: [{ type: 'main' as any }],
		usableAsTool: true,
		credentials: [
			{
				name: 'docusealApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'AI Tool',
						value: 'aiTool',
						description: 'Generate documents using AI',
					},
					{
						name: 'Form',
						value: 'form',
						description: 'Work with form events',
					},
					{
						name: 'Submission',
						value: 'submission',
						description: 'Create and manage document submissions',
					},
					{
						name: 'Submitter',
						value: 'submitter',
						description: 'Manage submitters and their data',
					},
					{
						name: 'Template',
						value: 'template',
						description: 'Create and manage document templates',
					},
				],
				default: 'submission',
			},
			// AI Tool operations and fields
			...aiToolOperations,
			...aiToolFields,
			// Template operations and fields
			...templateOperations,
			...templateFields,
			// Submission operations and fields
			...submissionOperations,
			...submissionFields,
			// Submitter operations and fields
			...submitterOperations,
			...submitterFields,
			// Form operations and fields
			...formOperations,
			...formFields,
		],
	};

	/**
	 * Load options methods for dynamic dropdown population
	 * Provides data for n8n UI dropdowns and selection fields
	 */
	methods = {
		loadOptions: {
			/**
			 * Get all templates for selection dropdown
			 * Fetches available templates from DocuSeal API for UI selection
			 * @param this - The n8n load options context
			 * @returns Promise resolving to array of template options
			 */
			async getTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					return await getTemplates.call(this);
				} catch (error) {
					// Return empty array on error
					return [];
				}
			},
		},
	};

	/**
	 * Execute method - main entry point for node execution
	 * Processes workflow items and executes DocuSeal API operations
	 * @param this - The n8n execution context
	 * @returns Promise resolving to array of execution data arrays
	 * @throws {NodeOperationError} When operation fails or parameters are invalid
	 */
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		let responseData: unknown;

		// Process each item
		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i);
				const operation = this.getNodeParameter('operation', i);

				// AI Tool operations
				if (resource === 'aiTool') {
					// Generate document using AI
					if (operation === 'generateDocument') {
						const documentType = this.getNodeParameter('documentType', i) as string;
						const description = this.getNodeParameter('description', i) as string;
						const additionalOptions = this.getNodeParameter(
							'additionalOptions',
							i,
							{},
						) as IDataObject;

						const body: IDataObject = {
							type: documentType,
							description,
						};

						// Add optional parameters
						if (additionalOptions.language) {
							body.language = additionalOptions.language;
						}
						if (additionalOptions.style) {
							body.style = additionalOptions.style;
						}
						if (additionalOptions.fields) {
							// Convert comma-separated fields to array
							const fieldsString = additionalOptions.fields as string;
							if (fieldsString.trim()) {
								body.fields = fieldsString
									.split(',')
									.map((field) => field.trim())
									.filter((field) => field.length > 0);
							}
						}

						try {
							responseData = await docusealApiRequest.call(this, 'POST', '/ai/documents', body);
						} catch (error) {
							throw new NodeOperationError(
								this.getNode(),
								`Failed to generate document with AI: ${(error as Error).message}`,
								{ itemIndex: i },
							);
						}
					}
				}

				// Template operations
				if (resource === 'template') {
					// Get template by ID
					if (operation === 'get') {
						const templateId = this.getNodeParameter('templateId', i) as number;

						responseData = await docusealApiRequest.call(this, 'GET', `/templates/${templateId}`);
					}

					// Get list of templates
					else if (operation === 'getMany') {
						const filters = this.getNodeParameter('filters', i, {});
						const limit = this.getNodeParameter('limit', i);
						filters.limit = limit;

						try {
							responseData = await docusealApiRequest.call(this, 'GET', '/templates', {}, filters);

							// Handle DocuSeal API response structure
							if (
								responseData &&
								typeof responseData === 'object' &&
								'data' in responseData &&
								Array.isArray((responseData as any).data)
							) {
								// DocuSeal returns { data: [...], pagination: {...} }
								responseData = (responseData as any).data;
							} else if (!Array.isArray(responseData)) {
								// If response is not an array and doesn't have data property, set empty array
								responseData = [];
							}

							// Ensure we always return an array
							if (!Array.isArray(responseData)) {
								responseData = [];
							}
						} catch (error) {
							throw new NodeOperationError(
								this.getNode(),
								`Failed to retrieve templates: ${(error as Error).message}`,
								{ itemIndex: i },
							);
						}
					}

					// Create template from PDF
					else if (operation === 'createFromPdf') {
						const name = this.getNodeParameter('name', i) as string;
						const pdfSource = this.getNodeParameter('pdfSource', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {});

						const formData: IDataObject = {
							name,
						};

						if (pdfSource === 'binary') {
							const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i);
							const binaryData = await prepareBinaryData.call(this, binaryPropertyName, i);
							formData.document = binaryData;
						} else {
							const fileUrl = this.getNodeParameter('fileUrl', i) as string;
							// Validate URL for security
							const urlValidation = validateUrl(fileUrl);
							if (!urlValidation.isValid) {
								throw new NodeOperationError(
									this.getNode(),
									`Invalid file URL: ${urlValidation.message}`,
									{
										itemIndex: i,
									},
								);
							}
							formData.document_url = fileUrl;
						}

						// Add additional fields
						if (additionalFields.external_id) {
							formData.external_id = additionalFields.external_id;
						}
						if (additionalFields.folder_name) {
							formData.folder_name = additionalFields.folder_name;
						}
						if (additionalFields.fields) {
							const fieldsData = additionalFields.fields as IDataObject;
							if (fieldsData.field) {
								formData.fields = fieldsData.field;
							}
						}

						responseData = await docusealApiRequest.call(
							this,
							'POST',
							'/templates/pdf',
							{},
							{},
							{ formData },
						);
					}

					// Create template from DOCX
					else if (operation === 'createFromDocx') {
						const name = this.getNodeParameter('name', i) as string;
						const docxSource = this.getNodeParameter('docxSource', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {});

						const formData: IDataObject = {
							name,
						};

						if (docxSource === 'binary') {
							const binaryPropertyName = this.getNodeParameter(
								'binaryPropertyNameDocx',
								i,
							) as string;
							const binaryData = await prepareBinaryData.call(this, binaryPropertyName, i);
							formData.document = binaryData;
						} else {
							const fileUrl = this.getNodeParameter('fileUrlDocx', i) as string;
							// Validate URL for security
							const urlValidation = validateUrl(fileUrl);
							if (!urlValidation.isValid) {
								throw new NodeOperationError(
									this.getNode(),
									`Invalid file URL: ${urlValidation.message}`,
									{
										itemIndex: i,
									},
								);
							}
							formData.document_url = fileUrl;
						}

						// Add additional fields
						if (additionalFields.external_id) {
							formData.external_id = additionalFields.external_id;
						}
						if (additionalFields.folder_name) {
							formData.folder_name = additionalFields.folder_name;
						}
						if (additionalFields.fields) {
							const fieldsData = additionalFields.fields as IDataObject;
							if (fieldsData.field) {
								formData.fields = fieldsData.field;
							}
						}

						responseData = await docusealApiRequest.call(
							this,
							'POST',
							'/templates/docx',
							{},
							{},
							{ formData },
						);
					}

					// Create template from HTML
					else if (operation === 'createFromHtml') {
						const name = this.getNodeParameter('name', i) as string;
						const htmlContent = this.getNodeParameter('htmlContent', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {});

						const body: IDataObject = {
							name,
							html: htmlContent,
						};

						// Add additional fields
						if (additionalFields.external_id) {
							body.external_id = additionalFields.external_id;
						}
						if (additionalFields.folder_name) {
							body.folder_name = additionalFields.folder_name;
						}
						if (additionalFields.fields) {
							const fieldsData = additionalFields.fields as IDataObject;
							if (fieldsData.field) {
								body.fields = fieldsData.field;
							}
						}

						responseData = await docusealApiRequest.call(this, 'POST', '/templates/html', body);
					}

					// Clone template
					else if (operation === 'clone') {
						const templateId = this.getNodeParameter('templateId', i) as number;
						const name = this.getNodeParameter('name', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {});

						const body: IDataObject = {
							name,
						};

						if (additionalFields.external_id) {
							body.external_id = additionalFields.external_id;
						}
						if (additionalFields.folder_name) {
							body.folder_name = additionalFields.folder_name;
						}

						responseData = await docusealApiRequest.call(
							this,
							'POST',
							`/templates/${templateId}/clone`,
							body,
						);
					}

					// Merge templates
					else if (operation === 'merge') {
						const templateIds = (this.getNodeParameter('templateIds', i) as string)
							.split(',')
							.map((id) => parseInt(id.trim()))
							.filter((id) => !isNaN(id));
						const name = this.getNodeParameter('mergedName', i) as string;

						const body: IDataObject = {
							template_ids: templateIds,
							name,
						};

						responseData = await docusealApiRequest.call(this, 'POST', '/templates/merge', body);
					}

					// Update template
					else if (operation === 'update') {
						const templateId = this.getNodeParameter('templateId', i) as number;
						const updateFields = this.getNodeParameter('updateFields', i, {});

						if (Object.keys(updateFields).length === 0) {
							throw new NodeOperationError(this.getNode(), 'At least one field must be updated', {
								itemIndex: i,
							});
						}

						responseData = await docusealApiRequest.call(
							this,
							'PUT',
							`/templates/${templateId}`,
							updateFields,
						);
					}

					// Update template documents
					else if (operation === 'updateDocuments') {
						const templateId = this.getNodeParameter('templateId', i) as number;
						const documentsSource = this.getNodeParameter('documentsSource', i) as string;

						const formData: IDataObject = {};

						if (documentsSource === 'binary') {
							const binaryProperties = (this.getNodeParameter('binaryProperties', i) as string)
								.split(',')
								.map((prop) => prop.trim());

							for (const [index, propertyName] of binaryProperties.entries()) {
								const binaryData = await prepareBinaryData.call(this, propertyName, i);
								formData[`documents[${index}]`] = binaryData;
							}
						} else {
							const fileUrls = (this.getNodeParameter('fileUrls', i) as string)
								.split(',')
								.map((url) => url.trim())
								.filter((url) => url.length > 0);

							// Validate all URLs for security
							for (const url of fileUrls) {
								const urlValidation = validateUrl(url);
								if (!urlValidation.isValid) {
									throw new NodeOperationError(
										this.getNode(),
										`Invalid file URL '${url}': ${urlValidation.message}`,
										{
											itemIndex: i,
										},
									);
								}
							}

							fileUrls.forEach((url, index) => {
								formData[`document_urls[${index}]`] = url;
							});
						}

						responseData = await docusealApiRequest.call(
							this,
							'PUT',
							`/templates/${templateId}/documents`,
							{},
							{},
							{ formData },
						);
					}

					// Archive template
					else if (operation === 'archive') {
						const templateId = this.getNodeParameter('templateId', i) as number;

						responseData = await docusealApiRequest.call(
							this,
							'DELETE',
							`/templates/${templateId}`,
						);
					}
				}

				// Submission operations
				else if (resource === 'submission') {
					// Get submission by ID
					if (operation === 'get') {
						const submissionId = this.getNodeParameter('submissionId', i) as number;

						responseData = await docusealApiRequest.call(
							this,
							'GET',
							`/submissions/${submissionId}`,
						);
					}

					// Get submission documents
					else if (operation === 'getDocuments') {
						const submissionId = this.getNodeParameter('submissionId', i) as number;

						responseData = await docusealApiRequest.call(
							this,
							'GET',
							`/submissions/${submissionId}/documents`,
						);
					}

					// Get list of submissions
					else if (operation === 'getMany') {
						const filters = this.getNodeParameter('filters', i, {});

						// Process status filter - convert array to comma-separated string if needed
						if (filters.status && Array.isArray(filters.status)) {
							filters.status = (filters.status as string[]).join(',');
						}

						const limit = this.getNodeParameter('limit', i);
						filters.limit = limit;

						try {
							responseData = await docusealApiRequest.call(
								this,
								'GET',
								'/submissions',
								{},
								filters,
							);

							// Handle DocuSeal API response structure
							if (
								responseData &&
								typeof responseData === 'object' &&
								'data' in responseData &&
								Array.isArray((responseData as any).data)
							) {
								responseData = (responseData as any).data;
							} else if (!Array.isArray(responseData)) {
								responseData = [];
							}
						} catch (error) {
							throw new NodeOperationError(
								this.getNode(),
								`Failed to retrieve submissions: ${(error as Error).message}`,
								{ itemIndex: i },
							);
						}
					}

					// Create submission
					else if (operation === 'create') {
						const templateId = this.getNodeParameter('templateId', i) as number;
						const submittersData = this.getNodeParameter('submitters', i) as IDataObject;
						const additionalOptions = this.getNodeParameter(
							'additionalOptions',
							i,
							{},
						) as IDataObject;

						// Build submitters array
						const submitters = buildSubmittersArray(submittersData);
						if (submitters.length === 0) {
							throw new NodeOperationError(this.getNode(), 'At least one submitter is required', {
								itemIndex: i,
							});
						}

						// Build field values from additional options
						const values = buildFieldValues(this.getNodeParameter('', 0) as IDataObject);

						// Build request body
						const body: IDataObject = {
							template_id: templateId,
							submitters,
						};

						// Add field values if any
						if (Object.keys(values).length > 0) {
							body.values = values;
						}

						// Add preferences from additional options
						const preferences: IDataObject = {};
						if (additionalOptions.bcc_completed) {
							preferences.bcc_completed = additionalOptions.bcc_completed;
						}
						if (additionalOptions.reply_to) {
							preferences.reply_to = additionalOptions.reply_to;
						}
						if (Object.keys(preferences).length > 0) {
							body.preferences = preferences;
						}

						// Add additional options
						if (additionalOptions.completed_redirect_url) {
							body.completed_redirect_url = additionalOptions.completed_redirect_url;
						}
						if (additionalOptions.expire_at) {
							body.expire_at = formatDate(additionalOptions.expire_at as string);
						}
						if (additionalOptions.external_id) {
							body.external_id = additionalOptions.external_id;
						}
						if (additionalOptions.message) {
							const messageData = additionalOptions.message as IDataObject;
							if (messageData.messageFields) {
								body.message = messageData.messageFields;
							}
						}
						if (additionalOptions.metadata) {
							body.metadata = parseJsonInput(additionalOptions.metadata as string | object);
						}
						if (additionalOptions.order) {
							body.order = additionalOptions.order;
						}
						if (additionalOptions.send_email !== undefined) {
							body.send_email = additionalOptions.send_email;
						}
						if (additionalOptions.send_sms !== undefined) {
							body.send_sms = additionalOptions.send_sms;
						}

						responseData = await docusealApiRequest.call(this, 'POST', '/submissions', body);
					}

					// Create submission from PDF
					else if (operation === 'createFromPdf') {
						const pdfSource = this.getNodeParameter('pdfSource', i) as string;
						const submittersData = this.getNodeParameter('submitters', i) as IDataObject;
						const additionalOptions = this.getNodeParameter(
							'additionalOptions',
							i,
							{},
						) as IDataObject;

						// Build submitters array
						const submitters = buildSubmittersArray(submittersData);
						if (submitters.length === 0) {
							throw new NodeOperationError(this.getNode(), 'At least one submitter is required', {
								itemIndex: i,
							});
						}

						const formData: IDataObject = {
							submitters: JSON.stringify(submitters),
						};

						if (pdfSource === 'binary') {
							const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i);
							const binaryData = await prepareBinaryData.call(this, binaryPropertyName, i);
							formData.document = binaryData;
						} else {
							const fileUrl = this.getNodeParameter('fileUrl', i) as string;
							// Validate URL for security
							const urlValidation = validateUrl(fileUrl);
							if (!urlValidation.isValid) {
								throw new NodeOperationError(
									this.getNode(),
									`Invalid file URL: ${urlValidation.message}`,
									{
										itemIndex: i,
									},
								);
							}
							formData.document_url = fileUrl;
						}

						// Add additional options
						if (additionalOptions.external_id) {
							formData.external_id = additionalOptions.external_id;
						}
						if (
							additionalOptions.send_email !== undefined &&
							additionalOptions.send_email !== null
						) {
							formData.send_email = additionalOptions.send_email.toString();
						}

						responseData = await docusealApiRequest.call(
							this,
							'POST',
							'/submissions/pdf',
							{},
							{},
							{ formData },
						);
					}

					// Create submission from HTML
					else if (operation === 'createFromHtml') {
						const htmlContent = this.getNodeParameter('htmlContent', i) as string;
						const submittersData = this.getNodeParameter('submitters', i) as IDataObject;
						const additionalOptions = this.getNodeParameter(
							'additionalOptions',
							i,
							{},
						) as IDataObject;

						// Build submitters array
						const submitters = buildSubmittersArray(submittersData);
						if (submitters.length === 0) {
							throw new NodeOperationError(this.getNode(), 'At least one submitter is required', {
								itemIndex: i,
							});
						}

						const body: IDataObject = {
							html: htmlContent,
							submitters,
						};

						// Add additional options
						if (additionalOptions.external_id) {
							body.external_id = additionalOptions.external_id;
						}
						if (additionalOptions.send_email !== undefined) {
							body.send_email = additionalOptions.send_email;
						}

						responseData = await docusealApiRequest.call(this, 'POST', '/submissions/html', body);
					}

					// Archive submission
					else if (operation === 'archive') {
						const submissionId = this.getNodeParameter('submissionId', i) as number;

						responseData = await docusealApiRequest.call(
							this,
							'DELETE',
							`/submissions/${submissionId}`,
						);
					}
				}

				// Submitter operations
				else if (resource === 'submitter') {
					// Get submitter by ID
					if (operation === 'get') {
						const submitterId = this.getNodeParameter('submitterId', i) as number;

						responseData = await docusealApiRequest.call(this, 'GET', `/submitters/${submitterId}`);
					}

					// Get list of submitters
					else if (operation === 'getMany') {
						const filters = this.getNodeParameter('filters', i, {});

						// Format date filters
						if (filters.completed_after) {
							filters.completed_after = formatDate(filters.completed_after as string);
						}
						if (filters.completed_before) {
							filters.completed_before = formatDate(filters.completed_before as string);
						}

						const limit = this.getNodeParameter('limit', i);
						filters.limit = limit;

						try {
							responseData = await docusealApiRequest.call(this, 'GET', '/submitters', {}, filters);

							// Handle DocuSeal API response structure
							if (
								responseData &&
								typeof responseData === 'object' &&
								'data' in responseData &&
								Array.isArray((responseData as any).data)
							) {
								responseData = (responseData as any).data;
							} else if (!Array.isArray(responseData)) {
								responseData = [];
							}
						} catch (error) {
							throw new NodeOperationError(
								this.getNode(),
								`Failed to retrieve submitters: ${(error as Error).message}`,
								{ itemIndex: i },
							);
						}
					}

					// Update submitter
					else if (operation === 'update') {
						const submitterId = this.getNodeParameter('submitterId', i) as number;
						const updateFields = this.getNodeParameter('updateFields', i, {});
						const fieldsData = this.getNodeParameter('fields', i, {}) as IDataObject;
						const valuesData = this.getNodeParameter('values', i, {}) as IDataObject;

						const body: IDataObject = {};

						// Add update fields
						Object.assign(body, updateFields);

						// Handle message field
						if (body.message && typeof body.message === 'object') {
							const messageData = body.message as IDataObject;
							if (messageData.messageFields) {
								body.message = messageData.messageFields;
							}
						}

						// Add fields configuration
						if (fieldsData.field) {
							body.fields = fieldsData.field;
						}

						// Add values
						if (valuesData.value) {
							const values: IDataObject = {};
							const valueItems = Array.isArray(valuesData.value)
								? valuesData.value
								: [valuesData.value];
							valueItems.forEach((item: any) => {
								if (item.name && item.value !== undefined) {
									values[item.name] = item.value;
								}
							});
							body.values = values;
						}

						if (Object.keys(body).length === 0) {
							throw new NodeOperationError(this.getNode(), 'At least one field must be updated', {
								itemIndex: i,
							});
						}

						responseData = await docusealApiRequest.call(
							this,
							'PUT', // Correct HTTP method for submitter update
							`/submitters/${submitterId}`,
							body,
						);
					}
				}

				// Form operations
				else if (resource === 'form') {
					const submitterId = this.getNodeParameter('submitterId', i) as number;

					// Get form started events
					if (operation === 'getStarted') {
						responseData = await docusealApiRequest.call(
							this,
							'GET',
							`/submitters/${submitterId}/form_started`,
						);
					}

					// Get form viewed events
					else if (operation === 'getViewed') {
						responseData = await docusealApiRequest.call(
							this,
							'GET',
							`/submitters/${submitterId}/form_viewed`,
						);
					}
				}

				// Add response data to output array
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject | IDataObject[]),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error instanceof Error ? error.message : String(error) },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
