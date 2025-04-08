import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	IDataObject,
	IHttpRequestMethods,
	IRequestOptions,
	NodeConnectionType,
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
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
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
						name: 'Archive',
						value: 'archive',
						description: 'Archive a submission',
						action: 'Archive a submission',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new submission',
						action: 'Create a submission',
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
			// Template: Get List Parameters
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['getList'],
					},
				},
				options: [
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
						displayName: 'Offset',
						name: 'offset',
						type: 'number',
						default: 0,
						description: 'Number of results to skip',
					},
				],
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
						displayName: 'After',
						name: 'after',
						type: 'string',
						default: '',
						description: 'Return submissions created after this timestamp',
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
						displayName: 'After',
						name: 'after',
						type: 'number',
						default: 0,
						description: 'Return results after this submitter ID',
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
				],
			},
			// Submission operation parameters
			{
				displayName: 'Submission ID',
				name: 'submissionId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'submission',
						],
						operation: [
							'get',
							'archive',
						],
					},
				},
				default: '',
				description: 'ID of the submission to retrieve or archive',
			},
			// Parameters for submission create operation
			{
				displayName: 'Template ID',
				name: 'templateId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'submission',
						],
						operation: [
							'create',
						],
					},
				},
				default: '',
				description: 'ID of the template to use for the submission',
			},
			{
				displayName: 'Send Email',
				name: 'sendEmail',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: [
							'submission',
						],
						operation: [
							'create',
						],
					},
				},
				default: true,
				description: 'Whether to send email notification to submitters',
			},
			{
				displayName: 'Submitters',
				name: 'submitters',
				placeholder: 'Add Submitter',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: [
							'submission',
						],
						operation: [
							'create',
						],
					},
				},
				default: {},
				options: [
					{
						name: 'submitterValues',
						displayName: 'Submitter',
						values: [
							{
								displayName: 'Email',
								name: 'email',
								type: 'string',
								placeholder: 'name@email.com',
								required: true,
								default: '',
								description: 'Email address of the submitter',
							},
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Name of the submitter',
							},
							{
								displayName: 'Role',
								name: 'role',
								type: 'string',
								default: '',
								description: 'Role of the submitter',
							},
							{
								displayName: 'Fields',
								name: 'fields',
								type: 'json',
								default: '{}',
								description: 'Field values to pre-fill. Should be an object with field names as keys.',
							},
						],
					},
				],
				description: 'List of submitters to create for this submission',
			},
			// Submitter operation parameters
			{
				displayName: 'Submitter ID',
				name: 'submitterId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'submitter',
						],
						operation: [
							'update',
							'get',
						],
					},
				},
				default: '',
				description: 'ID of the submitter to operate on',
			},
			// Parameters for submitter update operation
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: [
							'submitter',
						],
						operation: [
							'update',
						],
					},
				},
				options: [
					{
						displayName: 'Email',
						name: 'email',
						type: 'string',
						placeholder: 'name@email.com',
						default: '',
						description: 'New email address for the submitter',
					},
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'New name for the submitter',
					},
					{
						displayName: 'Role',
						name: 'role',
						type: 'string',
						default: '',
						description: 'New role for the submitter',
					},
					{
						displayName: 'Field Values',
						name: 'values',
						type: 'json',
						default: '{}',
						description: 'New field values for the submitter. Should be an object with field names as keys.',
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
		const environment = this.getNodeParameter('environment', 0) as string;
		const baseUrl = environment === 'production' ? (credentials.baseUrl as string) || 'https://api.docuseal.com' : (credentials.baseUrl as string) || 'https://test-api.docuseal.com';

		// Handle both old and new credential structures for backward compatibility
		let apiKey: string;
		if (credentials.apiKey) {
			// Support old credentials format
			apiKey = credentials.apiKey as string;
		} else {
			// Use new credentials format with environment selection
			apiKey = environment === 'production' 
				? (credentials.productionApiKey as string) 
				: (credentials.testApiKey as string);
		}

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
								'X-Auth-Token': apiKey,
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
								'X-Auth-Token': apiKey,
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
								'X-Auth-Token': apiKey,
								'Content-Type': 'application/json',
							},
							json: true,
						};

						responseData = await this.helpers.request(options);
					}
				} else if (resource === 'submission') {
					// Create Submission
					if (operation === 'create') {
						const templateId = this.getNodeParameter('templateId', i) as number;
						const sendEmail = this.getNodeParameter('sendEmail', i) as boolean;
						const submitters = this.getNodeParameter('submitters.submitterValues', i, []) as IDataObject[];
						
						// Format submitters data
						const formattedSubmitters = submitters.map((submitter) => {
							return {
								email: submitter.email,
								name: submitter.name || undefined,
								role: submitter.role || undefined,
								values: submitter.fields ? JSON.parse(submitter.fields as string) : {},
							};
						});

						const submissionData: IDataObject = {
							template_id: templateId,
							send_email: sendEmail,
							submitters: formattedSubmitters,
						};

						const options: IRequestOptions = {
							method: 'POST' as IHttpRequestMethods,
							url: `${baseUrl}/submissions`,
							json: true,
							body: submissionData,
							headers: {
								'X-Auth-Token': apiKey,
								'Content-Type': 'application/json',
							},
						};

						responseData = await this.helpers.request(options);
					}

					// Get Submission by ID
					else if (operation === 'get') {
						const submissionId = this.getNodeParameter('submissionId', i) as number;

						const options: IRequestOptions = {
							method: 'GET' as IHttpRequestMethods,
							url: `${baseUrl}/submissions/${submissionId}`,
							headers: {
								'X-Auth-Token': apiKey,
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
								'X-Auth-Token': apiKey,
							},
							json: true,
						};

						responseData = await this.helpers.request(options);
					}

					// Archive Submission
					else if (operation === 'archive') {
						const submissionId = this.getNodeParameter('submissionId', i) as number;

						const options: IRequestOptions = {
							method: 'DELETE' as IHttpRequestMethods,
							url: `${baseUrl}/submissions/${submissionId}`,
							headers: {
								'X-Auth-Token': apiKey,
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
								'X-Auth-Token': apiKey,
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
						
						// Prepare the update data
						const updateData: IDataObject = {};
						
						if (updateFields.email) {
							updateData.email = updateFields.email;
						}
						
						if (updateFields.name) {
							updateData.name = updateFields.name;
						}
						
						if (updateFields.role) {
							updateData.role = updateFields.role;
						}
						
						if (updateFields.values) {
							try {
								updateData.values = JSON.parse(updateFields.values as string);
							} catch (error) {
								throw new NodeOperationError(this.getNode(), 'Invalid JSON in field values');
							}
						}
						
						const options: IRequestOptions = {
							method: 'PUT' as IHttpRequestMethods,
							url: `${baseUrl}/submitters/${submitterId}`,
							body: updateData,
							headers: {
								'X-Auth-Token': apiKey,
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
								'X-Auth-Token': apiKey,
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
								'X-Auth-Token': apiKey,
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
