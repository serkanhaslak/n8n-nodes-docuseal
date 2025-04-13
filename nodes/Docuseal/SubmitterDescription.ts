import type { INodeProperties } from 'n8n-workflow';

// Submitter operations
export const submitterOperations: INodeProperties[] = [
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
				description: 'Update a submitter.',
				action: 'Update a submitter',
			},
		],
		default: 'update',
	},
];

// Submitter fields
export const submitterFields: INodeProperties[] = [
	// Submitter: Update by ID
	{
		displayName: 'Submitter ID',
		name: 'submitterId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['submitter'],
				operation: ['update'],
			},
		},
		default: 0,
		description: 'ID of the submitter to update.',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['submitter'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Completed',
				name: 'completed',
				type: 'boolean',
				default: false,
				description: 'Whether to mark the submitter as completed and auto-signed via API.',
			},
			{
				displayName: 'Completed Redirect URL',
				name: 'completed_redirect_url',
				type: 'string',
				default: '',
				description: 'URL to redirect the submitter to after completion.',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'Email address of the submitter.',
			},
			{
				displayName: 'External ID',
				name: 'external_id',
				type: 'string',
				default: '',
				description: 'Your application-specific unique string key to identify this submitter.',
			},
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'json',
				default: '[]',
				description: 'List of field configurations to update. Format: [{"name": "Field Name", "default_value": "Value", "readonly": false, "required": true, "preferences": {"font_size": 12, "align": "left"}}].',
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'json',
				default: '{"subject": "", "body": ""}',
				description: 'Custom email message for the submitter. Format: {"subject": "Custom subject", "body": "Custom body with variables: {{template.name}}, {{submitter.link}}, {{account.name}}"}.',
			},
			{
				displayName: 'Metadata',
				name: 'metadata',
				type: 'json',
				default: '{}',
				description: 'Metadata object with additional submitter information.',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name of the submitter.',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Phone number of the submitter in E.164 format (e.g., +1234567890).',
			},
			{
				displayName: 'Reply To',
				name: 'reply_to',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'Reply-To address to use in notification emails.',
			},
			{
				displayName: 'Send Email',
				name: 'send_email',
				type: 'boolean',
				default: false,
				description: 'Whether to re-send signature request emails.',
			},
			{
				displayName: 'Send SMS',
				name: 'send_sms',
				type: 'boolean',
				default: false,
				description: 'Whether to re-send signature request via SMS.',
			},
			{
				displayName: 'Values',
				name: 'values',
				type: 'json',
				default: '{}',
				description: 'Object with pre-filled values for the submission. Use field names as keys. Example: {"First Name": "John", "Last Name": "Doe"}.',
			},
		],
	},
];
