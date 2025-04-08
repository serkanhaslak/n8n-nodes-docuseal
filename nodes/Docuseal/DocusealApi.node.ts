import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	IDataObject,
	IHttpRequestMethods,
	IRequestOptions,
} from 'n8n-workflow';

export class DocusealApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DocuSeal',
		name: 'docusealApi',
		icon: 'file:docuseal.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with DocuSeal API',
		defaults: {
			name: 'DocuSeal',
		},
		inputs: [
			{
				type: 'main',
			},
		],
		outputs: [
			{
				type: 'main',
			},
		],
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
						name: 'Template',
						value: 'template',
					},
					{
						name: 'Submission',
						value: 'submission',
					},
					{
						name: 'Submitter',
						value: 'submitter',
					},
				],
				default: 'template',
			},
			// Template operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [
							'template',
						],
					},
				},
				options: [
					{
						name: 'Get List',
						value: 'getList',
						description: 'Get a list of templates',
						action: 'Get a list of templates',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a template by ID',
						action: 'Get a template by ID',
					},
					{
						name: 'Create From PDF',
						value: 'createFromPdf',
						description: 'Create a new template from a PDF file',
						action: 'Create a new template from a PDF',
					},
				],
				default: 'getList',
			},
			// Submission operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [
							'submission',
						],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new submission',
						action: 'Create a submission',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a submission',
						action: 'Delete a submission',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a submission by ID',
						action: 'Get a submission',
					},
					{
						name: 'Get List',
						value: 'getList',
						description: 'Get a list of submissions',
						action: 'Get a list of submissions',
					},
					{
						name: 'Send Email',
						value: 'sendEmail',
						description: 'Send email notification for a submission',
						action: 'Send email notification for a submission',
					},
				],
				default: 'create',
			},
			// Submitter operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [
							'submitter',
						],
					},
				},
				options: [
					{
						name: 'Update',
						value: 'update',
						description: 'Update a submitter',
						action: 'Update a submitter',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a submitter by ID',
						action: 'Get a submitter',
					},
					{
						name: 'Get List',
						value: 'getList',
						description: 'Get a list of submitters',
						action: 'Get a list of submitters',
					},
				],
				default: 'update',
			},
			// Template: Get Parameters
			{
				displayName: 'Template ID',
				name: 'templateId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['get'],
					},
				},
				default: 0,
				description: 'ID of the template to retrieve',
			},
			// Submission: Get List Parameters
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['submission'],
						operation: ['getList'],
					},
				},
				options: [
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{
								name: 'Pending',
								value: 'pending',
							},
							{
								name: 'Completed',
								value: 'completed',
							},
							{
								name: 'Canceled',
								value: 'canceled',
							},
						],
						default: 'pending',
						description: 'Filter submissions by status',
					},
					{
						displayName: 'Template ID',
						name: 'template_id',
						type: 'number',
						default: 0,
						description: 'Filter submissions by template ID',
					},
					{
						displayName: 'Email',
						name: 'email',
						type: 'string',
						placeholder: 'name@email.com',
						default: '',
						description: 'Filter submissions by submitter email',
					},
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 50,
						description: 'Max number of results to return',
					},
					{
						displayName: 'After',
						name: 'after',
						type: 'number',
						default: 0,
						description: 'Return results after this submission ID',
					},
				],
			},
			// Submission: Delete Parameters
			{
				displayName: 'Submission ID',
				name: 'submissionId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: ['submission'],
						operation: ['delete'],
					},
				},
				default: 0,
				description: 'ID of the submission to delete',
			},
			// Submission: Send Email Parameters
			{
				displayName: 'Submitters',
				name: 'submitters',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: ['submission'],
						operation: ['sendEmail'],
					},
				},
				default: {},
				placeholder: 'Add Submitter',
				options: [
					{
						name: 'submitterValues',
						displayName: 'Submitter',
						values: [
							{
								displayName: 'Submission ID',
								name: 'submission_id',
								type: 'number',
								required: true,
								default: 0,
								description: 'The ID of the submission',
							},
							{
								displayName: 'Email',
								name: 'email',
								type: 'string',
								placeholder: 'name@email.com',
								required: true,
								default: '',
								description: 'The email of the submitter',
							},
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'The name of the submitter',
							},
							{
								displayName: 'Role',
								name: 'role',
								type: 'string',
								default: '',
								description: 'The role of the submitter (if specified in template)',
							},
						],
					},
				],
			},
			// Submitter: Get Parameters
			{
				displayName: 'Submitter ID',
				name: 'submitterId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: ['submitter'],
						operation: ['get'],
					},
				},
				default: 0,
				description: 'ID of the submitter to retrieve',
			},
			// Submitter: Get List Parameters
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['submitter'],
						operation: ['getList'],
					},
				},
				options: [
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{
								name: 'Pending',
								value: 'pending',
							},
							{
								name: 'Completed',
								value: 'completed',
							},
						],
						default: 'pending',
						description: 'Filter submitters by status',
					},
					{
						displayName: 'Email',
						name: 'email',
						type: 'string',
						placeholder: 'name@email.com',
						default: '',
						description: 'Filter submitters by email',
					},
					{
						displayName: 'Submission ID',
						name: 'submission_id',
						type: 'number',
						default: 0,
						description: 'Filter submitters by submission ID',
					},
					{
						displayName: 'Template ID',
						name: 'template_id',
						type: 'number',
						default: 0,
						description: 'Filter submitters by template ID',
					},
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 50,
						description: 'Max number of results to return',
					},
					{
						displayName: 'After',
						name: 'after',
						type: 'number',
						default: 0,
						description: 'Return results after this submitter ID',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		const credentials = await this.getCredentials('docusealApi') as IDataObject;
		const baseUrl = (credentials.baseUrl as string) || 'https://api.docuseal.com';

		let responseData;

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'template') {
					// Get Templates List
					if (operation === 'getList') {
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const qs: IDataObject = {};

						// Add query parameters from additionalFields
						for (const key of Object.keys(additionalFields)) {
							qs[key] = additionalFields[key];
						}

						const options: IRequestOptions = {
							method: 'GET' as IHttpRequestMethods,
							url: `${baseUrl}/templates`,
							qs,
							headers: {
								'X-Auth-Token': credentials.apiKey,
							},
							json: true,
						};

						responseData = await this.helpers.request(options);
					}

					// Get Template by ID
					else if (operation === 'get') {
						const templateId = this.getNodeParameter('templateId', i) as number;

						const options: IRequestOptions = {
							method: 'GET' as IHttpRequestMethods,
							url: `${baseUrl}/templates/${templateId}`,
							headers: {
								'X-Auth-Token': credentials.apiKey,
							},
							json: true,
						};

						responseData = await this.helpers.request(options);
					}

					// Create Template from PDF
					else if (operation === 'createFromPdf') {
						const name = this.getNodeParameter('name', i) as string;
						const pdfFile = this.getNodeParameter('pdfFile', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						const body: IDataObject = {
							name,
							documents: [
								{
									name: name,
									file: pdfFile,
								},
							],
						};

						// Add fields if provided
						if (additionalFields.fields) {
							try {
								const fields = JSON.parse(additionalFields.fields as string);
								if (Array.isArray(fields)) {
									(body.documents as IDataObject[])[0].fields = fields;
								}
							} catch (error) {
								throw new NodeOperationError(this.getNode(), 'Fields must be a valid JSON array');
							}
						}

						// Add external_id and folder_name if provided
						if (additionalFields.external_id) {
							body.external_id = additionalFields.external_id;
						}

						if (additionalFields.folder_name) {
							body.folder_name = additionalFields.folder_name;
						}

						const options: IRequestOptions = {
							method: 'POST' as IHttpRequestMethods,
							url: `${baseUrl}/templates/pdf`,
							body,
							headers: {
								'X-Auth-Token': credentials.apiKey,
								'Content-Type': 'application/json',
							},
							json: true,
						};

						responseData = await this.helpers.request(options);
					}
				} else if (resource === 'submission') {
					// Create Submission
					if (operation === 'create') {
						// Get the parameters
						const templateId = this.getNodeParameter('templateId', i) as number;
						const sendEmail = this.getNodeParameter('sendEmail', i) as boolean;
						const order = this.getNodeParameter('order', i) as string;

						const submitters = this.getNodeParameter('submitters', i) as {
							submitterValues: Array<{
								email: string;
								name?: string;
								role?: string;
								fields?: {
									fieldValues: Array<{
										name: string;
										default_value?: string;
										readonly?: boolean;
										required?: boolean;
										title?: string;
										description?: string;
										validation_pattern?: string;
										invalid_message?: string;
										preferences?: {
											preferenceValues: {
												font_size?: number;
												font_type?: string;
												font?: string;
												color?: string;
												align?: string;
												format?: string;
												price?: number;
												currency?: string;
												mask?: boolean;
											}
										},
										roles?: string[];
									}>
								}
							}>
						};

						// Prepare submitter data
						const submitterData = submitters.submitterValues.map(submitter => {
							const formattedSubmitter: IDataObject = {
								email: submitter.email,
							};

							if (submitter.name) {
								formattedSubmitter.name = submitter.name;
							}

							if (submitter.role) {
								formattedSubmitter.role = submitter.role;
							}

							// Process fields if they exist
							if (submitter.fields && submitter.fields.fieldValues && submitter.fields.fieldValues.length > 0) {
								const fields = submitter.fields.fieldValues.map(field => {
									const formattedField: IDataObject = {
										name: field.name,
									};

									if (field.default_value !== undefined) {
										formattedField.default_value = field.default_value;
									}

									if (field.readonly !== undefined) {
										formattedField.readonly = field.readonly;
									}

									if (field.required !== undefined) {
										formattedField.required = field.required;
									}

									if (field.title) {
										formattedField.title = field.title;
									}

									if (field.description) {
										formattedField.description = field.description;
									}

									if (field.validation_pattern) {
										formattedField.validation_pattern = field.validation_pattern;
									}

									if (field.invalid_message) {
										formattedField.invalid_message = field.invalid_message;
									}

									// Process preferences if they exist
									if (field.preferences && field.preferences.preferenceValues) {
										const prefs = field.preferences.preferenceValues;
										const preferences: IDataObject = {};

										if (prefs.font_size !== undefined) {
											preferences.font_size = prefs.font_size;
										}

										if (prefs.font_type) {
											preferences.font_type = prefs.font_type;
										}

										if (prefs.font) {
											preferences.font = prefs.font;
										}

										if (prefs.color) {
											preferences.color = prefs.color;
										}

										if (prefs.align) {
											preferences.align = prefs.align;
										}

										if (prefs.format) {
											preferences.format = prefs.format;
										}

										if (prefs.price !== undefined) {
											preferences.price = prefs.price;
										}

										if (prefs.currency) {
											preferences.currency = prefs.currency;
										}

										if (prefs.mask !== undefined) {
											preferences.mask = prefs.mask;
										}

										if (Object.keys(preferences).length > 0) {
											formattedField.preferences = preferences;
										}
									}

									// Add roles if provided
									if (field.roles && field.roles.length > 0) {
										formattedField.roles = field.roles;
									}

									return formattedField;
								});

								formattedSubmitter.fields = fields;
							}

							return formattedSubmitter;
						});

						// Prepare the request data
						const submissionData: IDataObject = {
							template_id: templateId,
							send_email: sendEmail,
							submitters: submitterData,
						};

						if (order) {
							submissionData.order = order;
						}

						// Make the API request
						const options: IRequestOptions = {
							method: 'POST' as IHttpRequestMethods,
							url: `${baseUrl}/submissions`,
							json: true,
							body: submissionData,
							headers: {
								'X-Auth-Token': credentials.apiKey,
								'Content-Type': 'application/json',
							},
						};

						responseData = await this.helpers.request(options);
					}

					// Get Submission
					else if (operation === 'get') {
						const submissionId = this.getNodeParameter('submissionId', i) as number;

						const options: IRequestOptions = {
							method: 'GET' as IHttpRequestMethods,
							url: `${baseUrl}/submissions/${submissionId}`,
							headers: {
								'X-Auth-Token': credentials.apiKey,
							},
							json: true,
						};

						responseData = await this.helpers.request(options);
					}

					// Get Submissions List
					else if (operation === 'getList') {
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const qs: IDataObject = {};

						// Add query parameters from additionalFields
						for (const key of Object.keys(additionalFields)) {
							qs[key] = additionalFields[key];
						}

						const options: IRequestOptions = {
							method: 'GET' as IHttpRequestMethods,
							url: `${baseUrl}/submissions`,
							qs,
							headers: {
								'X-Auth-Token': credentials.apiKey,
							},
							json: true,
						};

						responseData = await this.helpers.request(options);
					}

					// Delete Submission
					else if (operation === 'delete') {
						const submissionId = this.getNodeParameter('submissionId', i) as number;

						const options: IRequestOptions = {
							method: 'DELETE' as IHttpRequestMethods,
							url: `${baseUrl}/submissions/${submissionId}`,
							headers: {
								'X-Auth-Token': credentials.apiKey,
							},
							json: true,
						};

						responseData = await this.helpers.request(options);
					}

					// Send Email for Submission
					else if (operation === 'sendEmail') {
						const submitters = this.getNodeParameter('submitters', i) as {
							submitterValues: Array<{
								submission_id: number;
								email: string;
								name?: string;
								role?: string;
							}>
						};

						// Prepare submitter data
						const submitterData = submitters.submitterValues.map(submitter => {
							const formattedSubmitter: IDataObject = {
								submission_id: submitter.submission_id,
								email: submitter.email,
							};

							if (submitter.name) {
								formattedSubmitter.name = submitter.name;
							}

							if (submitter.role) {
								formattedSubmitter.role = submitter.role;
							}

							return formattedSubmitter;
						});

						const options: IRequestOptions = {
							method: 'POST' as IHttpRequestMethods,
							url: `${baseUrl}/submissions/emails`,
							body: submitterData,
							headers: {
								'X-Auth-Token': credentials.apiKey,
								'Content-Type': 'application/json',
							},
							json: true,
						};

						responseData = await this.helpers.request(options);
					}
				} else if (resource === 'submitter') {
					// Update Submitter
					if (operation === 'update') {
						const submitterId = this.getNodeParameter('submitterId', i) as number;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

						const body: IDataObject = {};

						// Add fields to update
						if (updateFields.name) body.name = updateFields.name;
						if (updateFields.email) body.email = updateFields.email;
						if (updateFields.send_email !== undefined) body.send_email = updateFields.send_email;

						// Handle values field (JSON object)
						if (updateFields.values) {
							try {
								body.values = JSON.parse(updateFields.values as string);
							} catch (error) {
								throw new NodeOperationError(this.getNode(), 'Values must be a valid JSON object');
							}
						}

						const options: IRequestOptions = {
							method: 'PUT' as IHttpRequestMethods,
							url: `${baseUrl}/submitters/${submitterId}`,
							body,
							headers: {
								'X-Auth-Token': credentials.apiKey,
								'Content-Type': 'application/json',
							},
							json: true,
						};

						responseData = await this.helpers.request(options);
					}

					// Get Submitter
					else if (operation === 'get') {
						const submitterId = this.getNodeParameter('submitterId', i) as number;

						const options: IRequestOptions = {
							method: 'GET' as IHttpRequestMethods,
							url: `${baseUrl}/submitters/${submitterId}`,
							headers: {
								'X-Auth-Token': credentials.apiKey,
							},
							json: true,
						};

						responseData = await this.helpers.request(options);
					}

					// Get Submitters List
					else if (operation === 'getList') {
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const qs: IDataObject = {};

						// Add query parameters from additionalFields
						for (const key of Object.keys(additionalFields)) {
							qs[key] = additionalFields[key];
						}

						const options: IRequestOptions = {
							method: 'GET' as IHttpRequestMethods,
							url: `${baseUrl}/submitters`,
							qs,
							headers: {
								'X-Auth-Token': credentials.apiKey,
							},
							json: true,
						};

						responseData = await this.helpers.request(options);
					}
				}

				if (responseData !== undefined) {
					returnData.push({
						json: responseData,
						pairedItem: {
							item: i,
						},
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: {
							item: 0,
						},
					});
				} else {
					throw error;
				}
			}
		}

		return [returnData];
	}
}
