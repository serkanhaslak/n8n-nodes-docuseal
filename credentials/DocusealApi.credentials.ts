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
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'The DocuSeal API key obtained from your DocuSeal account',
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
