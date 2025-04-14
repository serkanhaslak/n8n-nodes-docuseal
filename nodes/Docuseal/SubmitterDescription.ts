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
				name: 'Get',
				value: 'get',
				description: 'Get a submitter.',
				action: 'Get a submitter',
			},
			{
				name: 'Get List',
				value: 'getList',
				description: 'Get a list of submitters.',
				action: 'Get a list of submitters',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a submitter.',
				action: 'Update a submitter',
			},
		],
		default: 'get',
	},
];

// Submitter fields
export const submitterFields: INodeProperties[] = [
	// Submitter: Get by ID
	{
		displayName: 'Submitter ID',
		name: 'submitterId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['submitter'],
				operation: ['get', 'update'],
			},
		},
		default: 0,
		description: 'ID of the submitter to retrieve.',
	},

	// Submitter: Get List
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['submitter'],
				operation: ['getList'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit.',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['submitter'],
				operation: ['getList'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max number of results to return.',
	},
	{
		displayName: 'After ID',
		name: 'after',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['submitter'],
				operation: ['getList'],
			},
		},
		default: 0,
		description: 'Return submitters with ID greater than this value.',
	},
	{
		displayName: 'Before ID',
		name: 'before',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['submitter'],
				operation: ['getList'],
			},
		},
		default: 0,
		description: 'Return submitters with ID less than this value.',
	},
	{
		displayName: 'Completed After',
		name: 'completed_after',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['submitter'],
				operation: ['getList'],
			},
		},
		default: '',
		description: 'Filter submitters that completed after this date and time.',
	},
	{
		displayName: 'Completed Before',
		name: 'completed_before',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['submitter'],
				operation: ['getList'],
			},
		},
		default: '',
		description: 'Filter submitters that completed before this date and time.',
	},
	{
		displayName: 'External ID',
		name: 'external_id',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['submitter'],
				operation: ['getList'],
			},
		},
		default: '',
		description: 'Filter submitters by external ID.',
	},
	{
		displayName: 'Query',
		name: 'q',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['submitter'],
				operation: ['getList'],
			},
		},
		default: '',
		description: 'Filter submitters on name, email or phone partial match.',
	},
	{
		displayName: 'Submission ID',
		name: 'submission_id',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['submitter'],
				operation: ['getList'],
			},
		},
		default: 0,
		description: 'Filter submitters by submission ID.',
	},

	// Submitter: Update
	{
		displayName: 'Completed',
		name: 'completed',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['submitter'],
				operation: ['update'],
			},
		},
		default: false,
		description: 'Whether to mark the submitter as completed and auto-signed via API',
	},
	{
		displayName: 'Completed Redirect URL',
		name: 'completed_redirect_url',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['submitter'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'URL to redirect the submitter to after completion',
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		displayOptions: {
			show: {
				resource: ['submitter'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Email address of the submitter',
	},
	{
		displayName: 'External ID',
		name: 'external_id',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['submitter'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Your application-specific unique string key to identify this submitter',
	},
	{
		displayName: 'Fields',
		name: 'fields',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['submitter'],
				operation: ['update'],
			},
		},
		default: '[]',
		description: 'List of field configurations to update. Format: [{"name": "Field Name", "default_value": "Value", "readonly": false, "required": true, "preferences": {"font_size": 12, "align": "left"}}]',
		typeOptions: {
			jsonSchema: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						name: {
							type: 'string',
							description: 'Name of the field as defined in the template'
						},
						default_value: {
							type: 'string',
							description: 'Default value to pre-fill for this field'
						},
						readonly: {
							type: 'boolean',
							description: 'Whether the field should be read-only'
						},
						required: {
							type: 'boolean',
							description: 'Whether the field is required to be filled'
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
								}
							}
						}
					},
					required: ['name']
				}
			}
		}
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['submitter'],
				operation: ['update'],
			},
		},
		default: '{"subject": "", "body": ""}',
		description: 'Custom email message for this submitter. Format: {"subject": "Custom email subject", "body": "Custom email body text"}',
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
						description: 'Custom email body text'
					}
				}
			}
		}
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['submitter'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Name of the submitter',
	},
	{
		displayName: 'Phone',
		name: 'phone',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['submitter'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Phone number of the submitter',
	},
	{
		displayName: 'Role',
		name: 'role',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['submitter'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Role of the submitter',
	},
	{
		displayName: 'Send Email',
		name: 'send_email',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['submitter'],
				operation: ['update'],
			},
		},
		default: false,
		description: 'Whether to send an email notification to the submitter',
	},
	{
		displayName: 'Send SMS',
		name: 'send_sms',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['submitter'],
				operation: ['update'],
			},
		},
		default: false,
		description: 'Whether to send an SMS notification to the submitter',
	},
	{
		displayName: 'Values',
		name: 'values',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['submitter'],
				operation: ['update'],
			},
		},
		default: '{}',
		description: 'Pre-filled values for fields. Format: {"Field Name": "Value"}',
		typeOptions: {
			jsonSchema: {
				type: 'object',
				additionalProperties: {
					type: ['string', 'number', 'boolean'],
					description: 'Field value'
				}
			}
		}
	},
];
