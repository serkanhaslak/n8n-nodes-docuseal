import {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	INodeExecutionData,
	IDataObject,
	NodeOperationError,
} from 'n8n-workflow';

export class DocusealAiTool implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DocuSeal AI Tool',
		name: 'docusealAiTool',
		icon: 'file:docuseal.svg',
		group: ['transform'],
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
			// Parameters for Get Template operation
			{
				displayName: 'Template ID',
				name: 'templateId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['getTemplate'],
					},
				},
				default: '',
				description: 'ID of the template to retrieve',
			},
			// Parameters for Create Submission operation
			{
				displayName: 'Template ID',
				name: 'templateId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['createSubmission'],
					},
				},
				default: '',
				description: 'ID of the template to use for creating a submission',
			},
			{
				displayName: 'Submitter Email',
				name: 'submitterEmail',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['createSubmission'],
					},
				},
				default: '',
				description: 'Email address of the submitter',
			},
			{
				displayName: 'Submitter Name',
				name: 'submitterName',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['createSubmission'],
					},
				},
				default: '',
				description: 'Name of the submitter',
			},
			{
				displayName: 'Submitter Role',
				name: 'submitterRole',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['createSubmission'],
					},
				},
				default: '',
				description: 'Role of the submitter',
			},
			{
				displayName: 'Field Values',
				name: 'fieldValues',
				type: 'json',
				required: true,
				displayOptions: {
					show: {
						operation: ['createSubmission'],
					},
				},
				default: '{}',
				description: 'JSON object with key-value pairs mapping field names to values (e.g. {"First Name": "John", "Last Name": "Doe", "Email": "john@example.com"})',
			},
			{
				displayName: 'Send Email',
				name: 'sendEmail',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['createSubmission'],
					},
				},
				default: true,
				description: 'Whether to send an email notification to the submitter',
			},
			{
				displayName: 'Environment',
				name: 'environment',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['getTemplate', 'createSubmission'],
					},
				},
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
				description: 'The environment to use for the API call',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const environment = this.getNodeParameter('environment', i, 'production') as string;

				// Handle credentials with backward compatibility
				const credentials = await this.getCredentials('docusealApi');
				
				if (credentials === undefined) {
					throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
				}

				let apiKey = '';
				let baseUrl = 'https://api.docuseal.co';

				if (credentials) {
					// Support both old and new credential format
					if (credentials.productionApiKey) {
						apiKey = credentials.productionApiKey as string;
					} else if (credentials.apiKey) {
						// Backward compatibility
						apiKey = credentials.apiKey as string;
					}
				}

				if (environment === 'test') {
					baseUrl = 'https://test-api.docuseal.co';
				}

				if (operation === 'getTemplate') {
					const templateId = this.getNodeParameter('templateId', i) as string;
					
					const response = await this.helpers.request({
						method: 'GET',
						uri: `${baseUrl}/templates/${templateId}`,
						headers: {
							'X-Auth-Token': apiKey,
							'Content-Type': 'application/json',
						},
						json: true,
					});

					returnData.push({
						success: true,
						message: 'Template retrieved successfully',
						templateId,
						...response,
					});
				}

				if (operation === 'createSubmission') {
					const templateId = this.getNodeParameter('templateId', i) as string;
					const submitterEmail = this.getNodeParameter('submitterEmail', i) as string;
					const submitterName = this.getNodeParameter('submitterName', i, '') as string;
					const submitterRole = this.getNodeParameter('submitterRole', i, '') as string;
					const sendEmail = this.getNodeParameter('sendEmail', i, true) as boolean;
					
					let fieldValues: IDataObject = {};
					try {
						const fieldValuesInput = this.getNodeParameter('fieldValues', i) as string;
						fieldValues = typeof fieldValuesInput === 'string' 
							? JSON.parse(fieldValuesInput)
							: fieldValuesInput;
					} catch (error) {
						throw new NodeOperationError(this.getNode(), `Invalid JSON in field values: ${error.message}`);
					}

					const submissionData = {
						template_id: templateId,
						send_email: sendEmail,
						submitters: [
							{
								email: submitterEmail,
								name: submitterName || undefined,
								role: submitterRole || undefined,
								values: fieldValues,
							},
						],
					};

					const response = await this.helpers.request({
						method: 'POST',
						uri: `${baseUrl}/submissions`,
						headers: {
							'X-Auth-Token': apiKey,
							'Content-Type': 'application/json',
						},
						body: submissionData,
						json: true,
					});

					returnData.push({
						success: true,
						message: 'Submission created successfully',
						templateId,
						submitterEmail,
						...response,
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ error: error.message });
				} else {
					throw error;
				}
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
