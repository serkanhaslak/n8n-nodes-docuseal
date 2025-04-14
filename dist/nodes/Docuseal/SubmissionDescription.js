"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submissionFields = exports.submissionOperations = void 0;
exports.submissionOperations = [
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
exports.submissionFields = [
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
        displayName: 'After ID',
        name: 'after',
        type: 'number',
        displayOptions: {
            show: {
                resource: ['submission'],
                operation: ['getList'],
            },
        },
        default: 0,
        description: 'Return results after this submission ID',
    },
    {
        displayName: 'Before ID',
        name: 'before',
        type: 'number',
        displayOptions: {
            show: {
                resource: ['submission'],
                operation: ['getList'],
            },
        },
        default: 0,
        description: 'Return results before this submission ID',
    },
    {
        displayName: 'Include Archived',
        name: 'archived',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['submission'],
                operation: ['getList'],
            },
        },
        default: false,
        description: 'Whether to include archived submissions',
    },
    {
        displayName: 'Search Query',
        name: 'q',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['submission'],
                operation: ['getList'],
            },
        },
        default: '',
        description: 'Search submitters by name, email, or phone',
    },
    {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        displayOptions: {
            show: {
                resource: ['submission'],
                operation: ['getList'],
            },
        },
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
        displayOptions: {
            show: {
                resource: ['submission'],
                operation: ['getList'],
            },
        },
        default: '',
        description: 'Filter by template folder name',
    },
    {
        displayName: 'Template ID',
        name: 'template_id',
        type: 'number',
        displayOptions: {
            show: {
                resource: ['submission'],
                operation: ['getList'],
            },
        },
        default: 0,
        description: 'Filter submissions by template ID',
    },
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
        description: 'ID of the template to create a submission for. This is a required numeric identifier that references the specific document template in DocuSeal that will be used for this submission. You can find the Template ID in the DocuSeal dashboard or by using the Get Templates operation.',
    },
    {
        displayName: 'Submitters',
        name: 'Submitters',
        type: 'json',
        required: true,
        displayOptions: {
            show: {
                resource: ['submission'],
                operation: ['create'],
            },
        },
        default: '[\n  {\n    "email": "example@email.com",\n    "name": "John Doe",\n    "role": "Signer"\n  }\n]',
        description: 'List of people who will sign or fill the document. Each submitter must include an email address and can include name, role, and other optional properties. Format as an array of objects, where each object represents one submitter. Example: [{"email": "john@example.com", "name": "John Smith", "role": "Client", "phone": "+1234567890"}]. The email field is required for each submitter. You can add multiple submitters by adding more objects to the array.',
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
        displayName: 'Fields',
        name: 'Fields',
        type: 'json',
        required: true,
        displayOptions: {
            show: {
                resource: ['submission'],
                operation: ['create'],
            },
        },
        default: '{\n  "First Name": "John",\n  "Last Name": "Doe",\n  "Date": "2025-04-14"\n}',
        description: 'Pre-filled values for form fields in the document. Format as a JSON object where each key is the exact field name from the template and each value is what you want to pre-fill. Example: {"First Name": "John", "Last Name": "Doe", "Email": "john@example.com", "Date": "2025-04-14"}. For signature fields, you can use image URLs or base64 encoded images like: {"Signature": "data:image/png;base64,..."}. For complex fields with formatting preferences, use: {"Amount": {"value": 100, "preferences": {"font_size": 12, "align": "right", "format": "usd"}}}.',
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
        displayName: 'Preferences',
        name: 'preferences',
        type: 'json',
        required: true,
        displayOptions: {
            show: {
                resource: ['submission'],
                operation: ['create'],
            },
        },
        default: '{\n  "font_size": 12,\n  "color": "blue",\n  "theme": "light"\n}',
        description: 'Visual and behavioral preferences for the document. Format as a JSON object with preference settings. Example: {"font_size": 12, "color": "blue", "theme": "light"}. Common preferences include: font_size (number in pixels), color (text color), theme (light/dark), page_size (A4, Letter), orientation (portrait/landscape), and margin (in pixels). These settings affect how the document appears to signers.',
        typeOptions: {
            jsonSchema: {
                type: 'object',
                properties: {
                    font_size: {
                        type: 'number',
                        description: 'Font size in pixels'
                    },
                    color: {
                        type: 'string',
                        description: 'Color theme for the document'
                    },
                    theme: {
                        type: 'string',
                        description: 'Visual theme (light/dark)'
                    },
                    page_size: {
                        type: 'string',
                        description: 'Page size (A4, Letter, etc.)'
                    },
                    orientation: {
                        type: 'string',
                        description: 'Page orientation (portrait/landscape)'
                    },
                    margin: {
                        type: 'number',
                        description: 'Page margin in pixels'
                    }
                }
            }
        }
    },
    {
        displayName: 'Additional Options',
        name: 'additionalOptions',
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
                description: 'URL to redirect the submitter to after they complete the submission. This allows you to direct signers back to your application or a thank you page after they finish signing the document.',
            },
            {
                displayName: 'External ID',
                name: 'external_id',
                type: 'string',
                default: '',
                description: 'Your custom identifier for this submission. This can be used to track the submission in your own system and easily reference it later without using DocuSeal\'s internal ID.',
            },
            {
                displayName: 'Message',
                name: 'message',
                type: 'string',
                default: '',
                description: 'Custom message to include in the email sent to submitters. Use this to provide additional context or instructions to the signers about the document they\'re receiving.',
            },
            {
                displayName: 'Metadata',
                name: 'metadata',
                type: 'json',
                default: '{}',
                description: 'Additional custom data to store with the submission. This can be any JSON object with your own custom fields that you want to associate with this submission for tracking or integration purposes.',
            },
            {
                displayName: 'Send Email',
                name: 'send_email',
                type: 'boolean',
                default: true,
                description: 'Whether to send email notifications to submitters. Set to false if you want to handle notifications yourself or if you\'re using a different notification method.',
            },
            {
                displayName: 'Send SMS',
                name: 'send_sms',
                type: 'boolean',
                default: false,
                description: 'Whether to send SMS notifications to submitters. This requires submitters to have phone numbers specified and your DocuSeal account to have SMS capabilities enabled.',
            },
            {
                displayName: 'Submitter Types',
                name: 'submitter_types',
                type: 'json',
                default: '{}',
                description: 'Define custom types for submitters. Format as a JSON object where keys are role names and values are type definitions. Example: {"Client": {"name": "Client", "fields": ["signature", "name"]}, "Witness": {"name": "Witness", "fields": ["signature"]}}',
            },
        ],
    },
    {
        displayName: 'Completed Redirect URL',
        name: 'completed_redirect_url',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['submission'],
                operation: ['create'],
            },
        },
        default: '',
        description: 'URL to redirect submitters to after they complete the submission',
    },
    {
        displayName: 'Expire At',
        name: 'expire_at',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['submission'],
                operation: ['create'],
            },
        },
        default: '',
        description: 'Expiration date and time in format: YYYY-MM-DD HH:MM:SS UTC. After this time, the submission will be unavailable for signing.',
    },
    {
        displayName: 'Message',
        name: 'message',
        type: 'json',
        displayOptions: {
            show: {
                resource: ['submission'],
                operation: ['create'],
            },
        },
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
                        description: 'Custom email body text'
                    }
                }
            }
        }
    },
    {
        displayName: 'Send Email',
        name: 'send_email',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['submission'],
                operation: ['create'],
            },
        },
        default: true,
        description: 'Whether to send email notifications to submitters',
    },
    {
        displayName: 'Send SMS',
        name: 'send_sms',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['submission'],
                operation: ['create'],
            },
        },
        default: false,
        description: 'Whether to send SMS notifications to submitters (phone number required)',
    },
    {
        displayName: 'Order',
        name: 'order',
        type: 'options',
        displayOptions: {
            show: {
                resource: ['submission'],
                operation: ['create'],
            },
        },
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
];
//# sourceMappingURL=SubmissionDescription.js.map