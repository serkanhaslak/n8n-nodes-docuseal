import type { INodeProperties } from 'n8n-workflow';

// Submission operations
export const submissionOperations: INodeProperties[] = [
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
		],
		default: 'create',
	},
];

// Submission fields
export const submissionFields: INodeProperties[] = [
	// Submission: Get by ID
	{
		displayName: 'Submission ID',
		name: 'submissionId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['submission'],
				operation: ['get', 'archive'],
			},
		},
		default: 0,
		description: 'ID of the submission to retrieve',
	},
	// Submission: Get List Parameters
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['submission'],
				operation: ['getList'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['submission'],
				operation: ['getList'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['submission'],
				operation: ['getList'],
			},
		},
		options: [
			{
				displayName: 'After ID',
				name: 'after',
				type: 'number',
				default: 0,
				description: 'Return results after this submission ID',
			},
			{
				displayName: 'Before ID',
				name: 'before',
				type: 'number',
				default: 0,
				description: 'Return results before this submission ID',
			},
			{
				displayName: 'Include Archived',
				name: 'archived',
				type: 'boolean',
				default: false,
				description: 'Whether to include archived submissions',
			},
			{
				displayName: 'Search Query',
				name: 'q',
				type: 'string',
				default: '',
				description: 'Search submitters by name, email, or phone',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{
						name: 'Completed',
						value: 'completed',
					},
					{
						name: 'Declined',
						value: 'declined',
					},
					{
						name: 'Expired',
						value: 'expired',
					},
					{
						name: 'Pending',
						value: 'pending',
					},
				],
				default: 'pending',
				description: 'Filter submissions by status',
			},
			{
				displayName: 'Template Folder',
				name: 'template_folder',
				type: 'string',
				default: '',
				description: 'Filter by template folder name',
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
	// Submission: Create Parameters
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['submission'],
				operation: ['create'],
			},
		},
		default: 0,
		description: 'ID of the template to use for this submission',
	},
	{
		displayName: 'Submitters',
		name: 'submitters',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['submission'],
				operation: ['create'],
			},
		},
		default: '[\n  {\n    "email": "example@email.com",\n    "name": "John Doe",\n    "role": "Signer"\n  }\n]',
		description: 'Array of submitters who will sign the document. Each submitter should include email (required), name, role, and optionally phone, values, metadata, etc. Example schema: [{ "email": "user@example.com", "name": "User Name", "role": "First Party", "phone": "+1234567890", "external_id": "user-123", "values": {"field1": "value1"}, "metadata": {"custom": "data"}, "send_email": true }]',
		hint: 'Format: [{"email": "user@example.com", "name": "User Name", "role": "Role Name"}]',
		typeOptions: {
			jsonSchema: {
				type: 'array',
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
						},
						phone: {
							type: 'string',
							description: 'Phone number of the submitter'
						},
						external_id: {
							type: 'string',
							description: 'External ID for the submitter'
						},
						values: {
							type: 'object',
							description: 'Pre-filled values for fields'
						},
						metadata: {
							type: 'object',
							description: 'Additional metadata for the submitter'
						},
						send_email: {
							type: 'boolean',
							description: 'Whether to send email to this submitter'
						}
					},
					required: ['email']
				}
			}
		}
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['submission'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Completed Redirect URL',
				name: 'completed_redirect_url',
				type: 'string',
				default: '',
				description: 'URL to redirect submitters to after they complete the submission',
			},
			{
				displayName: 'Expire At',
				name: 'expire_at',
				type: 'string',
				default: '',
				description: 'Expiration date and time in format: YYYY-MM-DD HH:MM:SS UTC. After this time, the submission will be unavailable for signing.',
			},
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'json',
				default: '{}',
				description: 'JSON object with field values to pre-fill in the document. The keys should match the field names in the template. Example: {"First Name": "John", "Last Name": "Doe", "Date": "12/31/2023", "Signature": "data:image/png;base64,..." or URL to image}. For complex fields, you can specify preferences like: {"Amount": {"value": 100, "preferences": {"font_size": 12, "align": "right", "format": "usd"}}}',
				hint: 'Format: {"field_name": "field_value"}',
				typeOptions: {
					jsonSchema: {
						type: 'object',
						additionalProperties: {
							oneOf: [
								{ type: 'string', description: 'Simple field value as string' },
								{ type: 'number', description: 'Numeric field value' },
								{ type: 'boolean', description: 'Boolean field value' },
								{
									type: 'object',
									description: 'Complex field with preferences',
									properties: {
										value: {
											type: 'string',
											description: 'The value for the field'
										},
										preferences: {
											type: 'object',
											description: 'Visual preferences for the field',
											properties: {
												font_size: { 
													type: 'number',
													description: 'Font size in pixels'
												},
												align: { 
													type: 'string',
													description: 'Text alignment (left, center, right)'
												},
												format: { 
													type: 'string',
													description: 'Format for special fields (e.g., usd, eur for currency)'
												}
											}
										}
									}
								}
							]
						}
					}
				}
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'json',
				default: '{"subject": "", "body": ""}',
				description: 'Custom email message for all submitters. Format: {"subject": "Custom email subject", "body": "Custom email body text. Can include variables: {{template.name}}, {{submitter.link}}, {{account.name}}"}',
				typeOptions: {
					jsonSchema: {
						type: 'object',
						properties: {
							subject: {
								type: 'string',
								description: 'Custom email subject line'
							},
							body: {
								type: 'string',
								description: 'Custom email body text. Can include variables: {{template.name}}, {{submitter.link}}, {{account.name}}'
							}
						}
					}
				}
			},
			{
				displayName: 'Order',
				name: 'order',
				type: 'options',
				options: [
					{
						name: 'Preserved (Sequential)',
						value: 'preserved',
					},
					{
						name: 'Random (All at Once)',
						value: 'random',
					},
				],
				default: 'preserved',
				description: 'Document signing order - "preserved" means sequential signing (second party receives email after first signs), "random" sends to all parties at once',
			},
			{
				displayName: 'Send Email',
				name: 'send_email',
				type: 'boolean',
				default: true,
				description: 'Whether to send email notifications to submitters',
			},
			{
				displayName: 'Send SMS',
				name: 'send_sms',
				type: 'boolean',
				default: false,
				description: 'Whether to send SMS notifications to submitters',
			},
		],
	},
];
