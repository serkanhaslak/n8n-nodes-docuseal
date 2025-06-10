import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class DocusealApi implements ICredentialType {
	name = 'docusealApi';
	displayName = 'DocuSeal API';
	documentationUrl = 'https://www.docuseal.com/docs/api';
	properties: INodeProperties[] = [
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
			description: 'Choose whether to use the production or test environment',
		},
		{
			displayName: 'Production API Key',
			name: 'productionApiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'The DocuSeal production API key obtained from your DocuSeal account. Must be at least 20 characters long and contain only alphanumeric characters, hyphens, and underscores.',
			displayOptions: {
				show: {
					environment: ['production'],
				},
			},
		},
		{
			displayName: 'Test API Key',
			name: 'testApiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'The DocuSeal test API key for sandbox testing. Must be at least 20 characters long and contain only alphanumeric characters, hyphens, and underscores.',
			displayOptions: {
				show: {
					environment: ['test'],
				},
			},
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.docuseal.com',
			description: 'The base URL for DocuSeal API calls. Must be a valid HTTPS URL.',
		},
	];
}
