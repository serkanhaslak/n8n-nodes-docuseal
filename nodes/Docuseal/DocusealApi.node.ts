import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	NodeConnectionType,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

import type {
	INodeTypeDescription,
	IDataObject,
	INodePropertyOptions,
} from 'n8n-workflow';

import {
	docusealApiRequest,
	docusealApiRequestAllItems,
	parseJsonInput,
	getTemplates,
} from './GenericFunctions';

import { templateOperations, templateFields } from './TemplateDescription';
import { submissionOperations, submissionFields } from './SubmissionDescription';
import { submitterOperations, submitterFields } from './SubmitterDescription';

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
			description: 'Create documents, manage templates, and handle submissions with DocuSeal',
			icon: 'file:docuseal.svg',
			supportAiNode: true,
			schemaDefinition: {
				// This ensures proper schema translation for AI tools
				type: 'object',
				properties: {
					resource: {
						type: 'string',
						description: 'Resource to operate on (template, submission, submitter)',
						enum: ['template', 'submission', 'submitter']
					},
					operation: {
						type: 'string',
						description: 'Operation to perform on the resource',
						enum: ['create', 'get', 'getList', 'update', 'delete']
					},
					submitters: {
						type: 'array',
						description: 'Array of submitters who will sign the document',
						items: {
							type: 'object',
							properties: {
								email: {
									type: 'string',
									description: 'Email address of the submitter'
								},
								name: {
									type: 'string',
									description: 'Name of the submitter'
								},
								role: {
									type: 'string',
									description: 'Role of the submitter'
								}
							}
						}
					},
					fields: {
						type: 'object',
						description: 'JSON object with field values to pre-fill in the document',
						additionalProperties: {
							type: 'string'
						}
					},
					templateId: {
						type: 'integer',
						description: 'ID of the template'
					},
					submissionId: {
						type: 'integer',
						description: 'ID of the submission'
					},
					submitterId: {
						type: 'integer',
						description: 'ID of the submitter'
					}
				},
				required: ['resource', 'operation'],
			},
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
						return templates.map((template: any) => ({
							name: template.name,
							value: template.id || template.value,
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
		let responseData;

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
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						
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
						const submittersInput = this.getNodeParameter('submitters', i) as string | object;
						const options = this.getNodeParameter('options', i, {}) as IDataObject;
						
						// Parse submitters
						const submitters = parseJsonInput(submittersInput);
						
						// Build request body
						const body: IDataObject = {
							template_id: templateId,
							submitters,
						};
						
						// Add options
						if (options.send_email !== undefined) {
							body.send_email = options.send_email;
						}
						
						if (options.send_sms !== undefined) {
							body.send_sms = options.send_sms;
						}
						
						// Handle field values (if any)
						if (options.fields) {
							const fields = parseJsonInput(options.fields as string | object);
							
							// Apply field values to each submitter
							(submitters as IDataObject[]).forEach((submitter: IDataObject) => {
								submitter.values = fields;
							});
						}
						
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
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						
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
						const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
						
						// Build request body
						const body: IDataObject = {};
						
						// Add simple fields
						const simpleFields = [
							'name', 'email', 'phone', 'external_id', 'completed',
							'send_email', 'send_sms', 'reply_to', 'completed_redirect_url'
						];
						
						for (const field of simpleFields) {
							if (updateFields[field] !== undefined) {
								body[field] = updateFields[field];
							}
						}
						
						// Handle JSON fields
						if (updateFields.values) {
							body.values = parseJsonInput(updateFields.values as string | object);
						}
						
						if (updateFields.metadata) {
							body.metadata = parseJsonInput(updateFields.metadata as string | object);
						}
						
						if (updateFields.message) {
							body.message = parseJsonInput(updateFields.message as string | object);
						}
						
						// Handle fields array
						if (updateFields.fields) {
							body.fields = parseJsonInput(updateFields.fields as string | object);
						}
						
						responseData = await docusealApiRequest.call(
							this,
							'PUT',
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
