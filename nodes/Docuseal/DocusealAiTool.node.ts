import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	IHttpRequestMethods,
	IRequestOptions,
	NodeConnectionType,
	IDataObject,
} from 'n8n-workflow';

export class DocusealAiTool implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DocuSeal AI Tool',
		name: 'docusealAiTool',
		icon: 'file:docuseal.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Pre-fill submission fields using AI-like logic',
		defaults: {
			name: 'DocuSeal AI Tool',
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
				displayName: 'Usable as Tool',
				name: 'usableAsTool',
				type: 'hidden',
				default: true,
			},
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
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				options: [
					{
						name: 'Auto Fill Submission',
						value: 'autoFill',
						description: 'Pre-fill submission fields based on input data',
						action: 'Pre fill submission fields based on input data',
					},
				],
				default: 'autoFill',
				noDataExpression: true,
			},
			{
				displayName: 'Template ID',
				name: 'templateId',
				type: 'number',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'autoFill',
						],
					},
				},
				description: 'ID of the template to use for the submission',
			},
			{
				displayName: 'Source Data',
				name: 'sourceData',
				type: 'json',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'autoFill',
						],
					},
				},
				description: 'The source data to use for AI field mapping (must be a valid JSON object)',
			},
			{
				displayName: 'Submitter Email',
				name: 'submitterEmail',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'autoFill',
						],
					},
				},
				description: 'Email address of the submitter',
			},
			{
				displayName: 'Submitter Name',
				name: 'submitterName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: [
							'autoFill',
						],
					},
				},
				description: 'Name of the submitter (optional)',
			},
			{
				displayName: 'Submitter Role',
				name: 'submitterRole',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: [
							'autoFill',
						],
					},
				},
				description: 'Role of the submitter (optional)',
			},
			{
				displayName: 'Send Email',
				name: 'sendEmail',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						operation: [
							'autoFill',
						],
					},
				},
				description: 'Whether to send email notification to the submitter',
			},
			{
				displayName: 'Field Mapping',
				name: 'fieldMapping',
				placeholder: 'Add Field Mapping',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				displayOptions: {
					show: {
						operation: [
							'autoFill',
						],
					},
				},
				options: [
					{
						name: 'mapping',
						displayName: 'Mapping',
						values: [
							{
								displayName: 'Form Field Name',
								name: 'formField',
								type: 'string',
								default: '',
								description: 'Name of the field in the DocuSeal form',
							},
							{
								displayName: 'Source Data Path',
								name: 'sourcePath',
								type: 'string',
								default: '',
								description: 'Path to the data in the source JSON (e.g., person.name)',
							},
							{
								displayName: 'Fallback Value',
								name: 'fallbackValue',
								type: 'string',
								default: '',
								description: 'Value to use if the source path is not found',
							},
						],
					},
				],
				description: 'Define how fields should be mapped from source data',
			},
		],

	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		
		// Get credentials and base URL
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
		const operation = this.getNodeParameter('operation', 0) as string;

		// Auto fill operation
		if (operation === 'autoFill') {
			try {
				for (let i = 0; i < items.length; i++) {
					const templateId = this.getNodeParameter('templateId', i) as number;
					const sourceDataStr = this.getNodeParameter('sourceData', i) as string;
					const submitterEmail = this.getNodeParameter('submitterEmail', i) as string;
					const submitterName = this.getNodeParameter('submitterName', i) as string;
					const submitterRole = this.getNodeParameter('submitterRole', i) as string;
					const sendEmail = this.getNodeParameter('sendEmail', i) as boolean;
					const fieldMappingParam = this.getNodeParameter('fieldMapping.mapping', i, []) as Array<{
						formField: string;
						sourcePath: string;
						fallbackValue: string;
					}>;

					// Parse the source data
					let sourceData;
					try {
						sourceData = JSON.parse(sourceDataStr);
					} catch (error) {
						throw new NodeOperationError(this.getNode(), 'Source data must be a valid JSON object');
					}

					// Create values object based on field mapping
					const values: { [key: string]: string } = {};
					
					for (const mapping of fieldMappingParam) {
						const { formField, sourcePath, fallbackValue } = mapping;
						if (!formField) continue;

						// Extract value from source data path
						let value = fallbackValue;
						if (sourcePath) {
							const pathParts = sourcePath.split('.');
							let currentValue = sourceData;
							let pathFound = true;

							for (const part of pathParts) {
								if (currentValue && typeof currentValue === 'object' && part in currentValue) {
									currentValue = currentValue[part];
								} else {
									pathFound = false;
									break;
								}
							}

							if (pathFound && currentValue !== undefined && currentValue !== null) {
								value = String(currentValue);
							}
						}

						values[formField] = value;
					}

					// Prepare the submission request
					const submissionData = {
						template_id: templateId,
						send_email: sendEmail,
						submitters: [
							{
								email: submitterEmail,
								name: submitterName || undefined,
								role: submitterRole || undefined,
								values: values,
							},
						],
					};

					// Make API request to create submission with pre-filled values
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

					const response = await this.helpers.request(options);
					
					// Return the response data
					returnData.push({
						json: {
							success: true,
							submissionData,
							response,
						},
					});
				}
			} catch (error) {
				if (error.node) {
					throw error;
				}
				throw new NodeOperationError(this.getNode(), `Error: ${error.message}`);
			}
		}

		return [returnData];
	}
}
