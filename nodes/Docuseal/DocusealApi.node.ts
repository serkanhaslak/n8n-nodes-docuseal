import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	NodeConnectionType,
	IDataObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	NodeOperationError,
} from 'n8n-workflow';

import type {
	INodeTypeDescription,
} from 'n8n-workflow';

import {
	docusealApiRequest,
	docusealApiRequestAllItems,
	getTemplates,
	parseJsonInput,
} from './GenericFunctions';

import {
	templateOperations,
	templateFields,
} from './TemplateDescription';

import {
	submissionOperations,
	submissionFields,
} from './SubmissionDescription';

import {
	submitterOperations,
	submitterFields,
} from './SubmitterDescription';

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
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		// @ts-ignore
		toolSpecification: {
			name: 'DocuSeal',
			displayName: 'DocuSeal',
			description: 'Create and manage document submissions and templates in DocuSeal',
			icon: 'file:docuseal.svg',
			supportAiNode: true,
			dynamicProperties: true,
			operations: [
				{
					name: 'Create Submission',
					description: 'Create a new document submission in DocuSeal with signers, pre-filled fields, and preferences',
					parameters: {
						type: 'object',
						required: ['templateId', 'submissionData'],
						properties: {
							templateId: {
								type: 'number',
								description: 'ID of the template to create a submission for. This is a required numeric identifier that references the specific document template in DocuSeal that will be used for this submission.'
							},
							submissionData: {
								type: 'string',
								description: 'Complete JSON data for the submission including submitters, fields, and preferences. Format as a JSON string with the following structure: {"Submitters": [{"email": "user@example.com", "name": "User Name", "role": "Role Name"}], "Fields": {"field1": "value1"}, "preferences": {"font_size": 12, "color": "blue"}, "completed_redirect_url": "https://example.com", "send_email": true}'
							}
						}
					}
				},
				{
					name: 'Get Submission',
					description: 'Retrieve a specific submission by ID',
					parameters: {
						type: 'object',
						required: ['submissionId'],
						properties: {
							submissionId: {
								type: 'number',
								description: 'The ID of the submission to retrieve'
							}
						}
					}
				},
				{
					name: 'Get Submissions List',
					description: 'Retrieve a list of submissions with optional filtering',
					parameters: {
						type: 'object',
						properties: {
							limit: {
								type: 'number',
								description: 'Maximum number of results to return (default: 100)'
							},
							returnAll: {
								type: 'boolean',
								description: 'Whether to return all results or only up to the specified limit'
							},
							filterData: {
								type: 'string',
								description: 'JSON string with filter criteria: {"after": 123, "before": 456, "archived": false, "q": "search term", "status": "completed", "template_folder": "folder", "template_id": 789}'
							}
						}
					}
				},
				{
					name: 'Archive Submission',
					description: 'Archive a submission by ID',
					parameters: {
						type: 'object',
						required: ['submissionId'],
						properties: {
							submissionId: {
								type: 'number',
								description: 'The ID of the submission to archive'
							}
						}
					}
				}
			]
		},
		credentials: [
			{
				name: 'docusealApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Environment',
				name: 'environment',
				type: 'options',
				default: 'production',
				options: [
					{
						name: 'Production',
						value: 'production',
					},
					{
						name: 'Test',
						value: 'test',
					},
				],
				description: 'Choose between production and test environment',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Submission',
						value: 'submission',
					},
					{
						name: 'Submitter',
						value: 'submitter',
					},
					{
						name: 'Template',
						value: 'template',
					},
				],
				default: 'template',
			},
			// Import operations and fields from description files
			...templateOperations,
			...templateFields,
			...submissionOperations,
			...submissionFields,
			...submitterOperations,
			...submitterFields,
		],
	};

	// Load options methods
	methods = {
		loadOptions: {
			// Get all templates for selection
			async getTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const returnData: INodePropertyOptions[] = [];
					const templates = await getTemplates.call(this);
					
					if (Array.isArray(templates)) {
						return templates.map((template: {name: string, id?: number, value?: number}) => ({
							name: template.name,
							value: template.id || template.value || 0, // Provide a default value to avoid undefined
						}));
					}
					
					return returnData;
				} catch (error) {
					// Return empty array on error
					return [];
				}
			},
		},
	};

	// Execute method
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		let responseData: IDataObject | IDataObject[] = {};

		// Process each item
		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				// Template operations
				if (resource === 'template') {
					// Get template by ID
					if (operation === 'get') {
						const templateId = this.getNodeParameter('templateId', i) as number;
						
						responseData = await docusealApiRequest.call(
							this,
							'GET',
							`/templates/${templateId}`,
						);
					}
					
					// Get list of templates
					else if (operation === 'getList') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						
						if (returnAll) {
							responseData = await docusealApiRequestAllItems.call(
								this,
								'GET',
								'/templates',
								{},
								filters,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							filters.limit = limit;
							responseData = await docusealApiRequest.call(
								this,
								'GET',
								'/templates',
								{},
								filters,
							);
						}
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
					
					// Get list of submissions
					else if (operation === 'getList') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						
						// Get all top-level filter parameters
						const after = this.getNodeParameter('after', i, 0) as number;
						const before = this.getNodeParameter('before', i, 0) as number;
						const archived = this.getNodeParameter('archived', i, false) as boolean;
						const searchQuery = this.getNodeParameter('q', i, '') as string;
						const status = this.getNodeParameter('status', i, '') as string;
						const templateFolder = this.getNodeParameter('template_folder', i, '') as string;
						const templateId = this.getNodeParameter('template_id', i, 0) as number;
						
						// Build filters object
						const filters: IDataObject = {};
						
						if (after) filters.after = after;
						if (before) filters.before = before;
						if (archived) filters.archived = archived;
						if (searchQuery) filters.q = searchQuery;
						if (status) filters.status = status;
						if (templateFolder) filters.template_folder = templateFolder;
						if (templateId) filters.template_id = templateId;
						
						if (returnAll) {
							responseData = await docusealApiRequestAllItems.call(
								this,
								'GET',
								'/submissions',
								{},
								filters,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							filters.limit = limit;
							responseData = await docusealApiRequest.call(
								this,
								'GET',
								'/submissions',
								{},
								filters,
							);
						}
					}
					
					// Create submission
					else if (operation === 'create') {
						const templateId = this.getNodeParameter('templateId', i) as number;
						
						// Check if we're getting data from the new simplified parameter structure
						let submitters: IDataObject[] = [];
						let fields: IDataObject = {};
						let preferences: IDataObject = {};
						let completedRedirectUrl = '';
						let expireAt = '';
						let messageInput: string | object = {};
						let order = '';
						let sendEmail = true;
						let sendSms = false;
						let externalId = '';
						let metadata: IDataObject = {};
						let submitterTypes: IDataObject = {};
						
						// Try to get submissionData parameter (for AI agents, especially Gemini)
						try {
							const submissionDataParam = this.getNodeParameter('submissionData', i, '') as string;
							if (submissionDataParam) {
								// Parse the JSON string into an object
								const submissionData = JSON.parse(submissionDataParam);
								
								// Extract all parameters from the submissionData object
								if (submissionData.Submitters) submitters = submissionData.Submitters as IDataObject[];
								if (submissionData.Fields) fields = submissionData.Fields as IDataObject;
								if (submissionData.preferences) preferences = submissionData.preferences as IDataObject;
								if (submissionData.completed_redirect_url) completedRedirectUrl = submissionData.completed_redirect_url as string;
								if (submissionData.expire_at) expireAt = submissionData.expire_at as string;
								if (submissionData.message) messageInput = submissionData.message;
								if (submissionData.order) order = submissionData.order as string;
								if (submissionData.send_email !== undefined) sendEmail = submissionData.send_email as boolean;
								if (submissionData.send_sms !== undefined) sendSms = submissionData.send_sms as boolean;
								if (submissionData.external_id) externalId = submissionData.external_id as string;
								if (submissionData.metadata) metadata = submissionData.metadata as IDataObject;
								if (submissionData.submitter_types) submitterTypes = submissionData.submitter_types as IDataObject;
							}
						} catch (error) {
							// If submissionData parameter is not available, try the traditional parameters
							try {
								const submittersInput = this.getNodeParameter('Submitters', i) as string | object;
								submitters = typeof submittersInput === 'string' ? JSON.parse(submittersInput as string) : submittersInput as IDataObject[];
							} catch (error) {
								// If neither parameter is available, throw an error
								throw new NodeOperationError(this.getNode(), 'Submitters data is required for creating a submission', { itemIndex: i });
							}
							
							try {
								const fieldsInput = this.getNodeParameter('Fields', i) as string | object;
								fields = typeof fieldsInput === 'string' ? JSON.parse(fieldsInput as string) : fieldsInput as IDataObject;
							} catch (error) {
								// Fields parameter is optional
								fields = {};
							}
							
							try {
								const preferencesInput = this.getNodeParameter('preferences', i) as string | object;
								preferences = typeof preferencesInput === 'string' ? JSON.parse(preferencesInput as string) : preferencesInput as IDataObject;
							} catch (error) {
								// Preferences parameter is optional
								preferences = {};
							}
							
							try {
								completedRedirectUrl = this.getNodeParameter('completed_redirect_url', i) as string;
							} catch (error) {
								// Optional parameter
							}
							
							try {
								expireAt = this.getNodeParameter('expire_at', i) as string;
							} catch (error) {
								// Optional parameter
							}
							
							try {
								messageInput = this.getNodeParameter('message', i) as string | object;
							} catch (error) {
								// Optional parameter
								messageInput = {};
							}
							
							try {
								order = this.getNodeParameter('order', i) as string;
							} catch (error) {
								// Optional parameter
							}
							
							try {
								sendEmail = this.getNodeParameter('send_email', i) as boolean;
							} catch (error) {
								// Default to true
								sendEmail = true;
							}
							
							try {
								sendSms = this.getNodeParameter('send_sms', i) as boolean;
							} catch (error) {
								// Default to false
								sendSms = false;
							}
							
							try {
								externalId = this.getNodeParameter('external_id', i) as string;
							} catch (error) {
								// Optional parameter
							}
							
							try {
								metadata = this.getNodeParameter('metadata', i) as IDataObject;
							} catch (error) {
								// Optional parameter
								metadata = {};
							}
							
							try {
								submitterTypes = this.getNodeParameter('submitter_types', i) as IDataObject;
							} catch (error) {
								// Optional parameter
								submitterTypes = {};
							}
						}
						
						// Process message input
						let message: IDataObject = {};
						if (typeof messageInput === 'string') {
							try {
								message = JSON.parse(messageInput);
							} catch (error) {
								message = { text: messageInput };
							}
						} else {
							message = messageInput as IDataObject;
						}
						
						// Build request body
						const body: IDataObject = {
							template_id: templateId,
							submitters,
							fields,
							preferences,
						};
						
						// Add all top-level parameters to the body
						if (completedRedirectUrl) body.completed_redirect_url = completedRedirectUrl;
						if (expireAt) body.expire_at = expireAt;
						if (Object.keys(message).length > 0) body.message = message;
						if (order) body.order = order;
						if (externalId) body.external_id = externalId;
						if (Object.keys(metadata).length > 0) body.metadata = metadata;
						if (Object.keys(submitterTypes).length > 0) body.submitter_types = submitterTypes;
						
						body.send_email = sendEmail;
						body.send_sms = sendSms;
						
						responseData = await docusealApiRequest.call(
							this,
							'POST',
							'/submissions',
							body,
						);
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
						
						responseData = await docusealApiRequest.call(
							this,
							'GET',
							`/submitters/${submitterId}`,
						);
					}
					
					// Get list of submitters
					else if (operation === 'getList') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						
						// Get all top-level filter parameters
						const after = this.getNodeParameter('after', i, 0) as number;
						const before = this.getNodeParameter('before', i, 0) as number;
						const completedAfter = this.getNodeParameter('completed_after', i, '') as string;
						const completedBefore = this.getNodeParameter('completed_before', i, '') as string;
						const externalId = this.getNodeParameter('external_id', i, '') as string;
						const searchQuery = this.getNodeParameter('q', i, '') as string;
						const submissionId = this.getNodeParameter('submission_id', i, 0) as number;
						
						// Build filters object
						const filters: IDataObject = {};
						
						if (after) filters.after = after;
						if (before) filters.before = before;
						if (completedAfter) filters.completed_after = completedAfter;
						if (completedBefore) filters.completed_before = completedBefore;
						if (externalId) filters.external_id = externalId;
						if (searchQuery) filters.q = searchQuery;
						if (submissionId) filters.submission_id = submissionId;
						
						if (returnAll) {
							responseData = await docusealApiRequestAllItems.call(
								this,
								'GET',
								'/submitters',
								{},
								filters,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							filters.limit = limit;
							responseData = await docusealApiRequest.call(
								this,
								'GET',
								'/submitters',
								{},
								filters,
							);
						}
					}
					
					// Update submitter
					else if (operation === 'update') {
						const submitterId = this.getNodeParameter('submitterId', i) as number;
						
						// Get all top-level parameters
						let completed = false;
						let completedRedirectUrl = '';
						let email = '';
						let externalId = '';
						let fieldsInput: string | object = {};
						let messageInput: string | object = {};
						let name = '';
						let phone = '';
						let role = '';
						let sendEmail = false;
						let sendSms = false;
						let valuesInput: string | object = {};
						
						try {
							completed = this.getNodeParameter('completed', i) as boolean;
						} catch (error) {
							// Optional parameter
						}
						
						try {
							completedRedirectUrl = this.getNodeParameter('completed_redirect_url', i) as string;
						} catch (error) {
							// Optional parameter
						}
						
						try {
							email = this.getNodeParameter('email', i) as string;
						} catch (error) {
							// Optional parameter
						}
						
						try {
							externalId = this.getNodeParameter('external_id', i) as string;
						} catch (error) {
							// Optional parameter
						}
						
						try {
							fieldsInput = this.getNodeParameter('fields', i) as string | object;
						} catch (error) {
							// Optional parameter
							fieldsInput = {};
						}
						
						try {
							messageInput = this.getNodeParameter('message', i) as string | object;
						} catch (error) {
							// Optional parameter
							messageInput = {};
						}
						
						try {
							name = this.getNodeParameter('name', i) as string;
						} catch (error) {
							// Optional parameter
						}
						
						try {
							phone = this.getNodeParameter('phone', i) as string;
						} catch (error) {
							// Optional parameter
						}
						
						try {
							role = this.getNodeParameter('role', i) as string;
						} catch (error) {
							// Optional parameter
						}
						
						try {
							sendEmail = this.getNodeParameter('send_email', i) as boolean;
						} catch (error) {
							// Optional parameter
						}
						
						try {
							sendSms = this.getNodeParameter('send_sms', i) as boolean;
						} catch (error) {
							// Optional parameter
						}
						
						try {
							valuesInput = this.getNodeParameter('values', i) as string | object;
						} catch (error) {
							// Optional parameter
							valuesInput = {};
						}
						
						// Parse inputs
						const fields = parseJsonInput(fieldsInput);
						const message = parseJsonInput(messageInput);
						const values = parseJsonInput(valuesInput);
						
						// Build request body
						const body: IDataObject = {};
						
						if (completed !== undefined) body.completed = completed;
						if (completedRedirectUrl) body.completed_redirect_url = completedRedirectUrl;
						if (email) body.email = email;
						if (externalId) body.external_id = externalId;
						if (fields && Array.isArray(fields) && fields.length > 0) body.fields = fields;
						if (message && Object.keys(message).length > 0) body.message = message;
						if (name) body.name = name;
						if (phone) body.phone = phone;
						if (role) body.role = role;
						if (sendEmail !== undefined) body.send_email = sendEmail;
						if (sendSms !== undefined) body.send_sms = sendSms;
						if (values && Object.keys(values).length > 0) body.values = values;
						
						responseData = await docusealApiRequest.call(
							this,
							'PATCH',
							`/submitters/${submitterId}`,
							body,
						);
					}
				}

				// Add response data to output array
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
