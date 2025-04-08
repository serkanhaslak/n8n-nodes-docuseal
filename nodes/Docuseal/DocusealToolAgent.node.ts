import {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	INodeExecutionData,
	IDataObject,
	NodeOperationError,
} from 'n8n-workflow';

export class DocusealToolAgent implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DocuSeal Tool',
		name: 'docusealToolAgent',
		icon: 'file:docuseal.svg',
		group: ['ai'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Automate document signing with DocuSeal',
		defaults: {
			name: 'DocuSeal Tool',
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
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}',
			headers: {
				'X-Auth-Token': '={{$credentials.apiKey || $credentials.productionApiKey}}',
			},
		},
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
			const operation = this.getNodeParameter('operation', i) as string;
			const environment = this.getNodeParameter('environment', i, 'production') as string;

			const credentials = await this.getCredentials('docusealApi');
			
			let apiKey: string;
			if ('apiKey' in credentials) {
				apiKey = credentials.apiKey as string;
			} else {
				apiKey = environment === 'production' 
					? credentials.productionApiKey as string 
					: credentials.testApiKey as string;
			}

			const baseUrl = environment === 'production'
				? 'https://api.docuseal.com'
				: 'https://test-api.docuseal.com';

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
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
