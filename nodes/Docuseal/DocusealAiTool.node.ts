import {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	INodeExecutionData,
	IDataObject,
	NodeOperationError,
	IHttpRequestMethods,
} from 'n8n-workflow';

export class DocusealAiTool implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DocuSeal AI Tool',
		name: 'docusealAiTool',
		icon: 'file:docuseal.svg',
		group: ['ai', 'transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Create and pre-fill DocuSeal submissions',
		defaults: {
			name: 'DocuSeal AI Tool',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
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
				default: 'production',
				description: 'The environment to use',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Template',
						value: 'getTemplate',
						description: 'Retrieve a DocuSeal template with its fields',
						action: 'Get DocuSeal template details',
					},
					{
						name: 'Create Submission',
						value: 'createSubmission',
						description: 'Create a new submission with pre-filled values',
						action: 'Create a DocuSeal submission',
					},
				],
				default: 'createSubmission',
			},
			{
				displayName: 'Template ID',
				name: 'templateId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'getTemplate',
							'createSubmission',
						],
					},
				},
				default: '',
				description: 'The ID of the template',
			},
			{
				displayName: 'Field Values',
				name: 'fieldValues',
				type: 'json',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'createSubmission',
						],
					},
				},
				default: '{}',
				description: 'Field values to pre-fill in the submission in JSON format. Example: { "email": "user@example.com", "name": "John Doe" }',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		let responseData: any;
		
		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const environment = this.getNodeParameter('environment', i) as string;

				// Handle credentials with backward compatibility
				const credentials = await this.getCredentials('docusealApi');
				
				if (credentials === undefined) {
					throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
				}

				let apiKey = '';
				let baseUrl = '';

				if (credentials) {
					// Support both old and new credential format
					if (credentials.productionApiKey && environment === 'production') {
						apiKey = credentials.productionApiKey as string;
					} else if (credentials.testApiKey && environment === 'test') {
						apiKey = credentials.testApiKey as string;
					} else if (credentials.apiKey) {
						// Backward compatibility
						apiKey = credentials.apiKey as string;
					}

					if (environment === 'production') {
						baseUrl = (credentials.baseUrl as string) || 'https://api.docuseal.co';
					} else {
						baseUrl = 'https://test-api.docuseal.co';
					}
				}

				if (!apiKey) {
					throw new NodeOperationError(this.getNode(), 'API key is required! Please check your credentials.');
				}

				if (operation === 'getTemplate') {
					const templateId = this.getNodeParameter('templateId', i) as string;
					
					const options = {
						method: 'GET' as IHttpRequestMethods,
						headers: {
							'X-Auth-Token': apiKey,
							'Content-Type': 'application/json',
						},
					};

					responseData = await this.helpers.request(
						`${baseUrl}/templates/${templateId}`,
						options,
					);

				} else if (operation === 'createSubmission') {
					const templateId = this.getNodeParameter('templateId', i) as string;
					const fieldValuesJson = this.getNodeParameter('fieldValues', i) as string;
					
					let fieldValues: IDataObject;
					try {
						fieldValues = JSON.parse(fieldValuesJson);
					} catch (error) {
						throw new NodeOperationError(this.getNode(), 'Invalid JSON for field values. Please provide a valid JSON object');
					}
					
					const options = {
						method: 'POST' as IHttpRequestMethods,
						headers: {
							'X-Auth-Token': apiKey,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							values: fieldValues,
						}),
					};

					responseData = await this.helpers.request(
						`${baseUrl}/templates/${templateId}/submissions`,
						options,
					);
				}

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
		
		return this.prepareOutputData(returnData);
	}
}
