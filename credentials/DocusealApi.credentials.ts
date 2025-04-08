import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class DocusealApi implements ICredentialType {
	name = 'docusealApi';
	displayName = 'DocuSeal API';
	documentationUrl = 'https://www.docuseal.co/docs/api';
	properties: INodeProperties[] = [
		{
			displayName: 'Production API Key',
			name: 'productionApiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'The DocuSeal production API key obtained from your DocuSeal account',
		},
		{
			displayName: 'Test API Key',
			name: 'testApiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'The DocuSeal test API key for sandbox testing',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.docuseal.com',
			description: 'The base URL for DocuSeal API calls',
		},
	];
}
