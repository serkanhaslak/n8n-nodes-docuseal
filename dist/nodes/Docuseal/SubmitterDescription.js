"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitterFields = exports.submitterOperations = void 0;
exports.submitterOperations = [
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
exports.submitterFields = [
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
        displayName: 'Filters',
        name: 'filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: {
            show: {
                resource: ['submitter'],
                operation: ['getList'],
            },
        },
        options: [
            {
                displayName: 'After ID',
                name: 'after',
                type: 'number',
                default: 0,
                description: 'Return submitters with ID greater than this value.',
            },
            {
                displayName: 'Before ID',
                name: 'before',
                type: 'number',
                default: 0,
                description: 'Return submitters with ID less than this value.',
            },
            {
                displayName: 'Completed After',
                name: 'completed_after',
                type: 'dateTime',
                default: '',
                description: 'Filter submitters that completed after this date and time.',
            },
            {
                displayName: 'Completed Before',
                name: 'completed_before',
                type: 'dateTime',
                default: '',
                description: 'Filter submitters that completed before this date and time.',
            },
            {
                displayName: 'External ID',
                name: 'external_id',
                type: 'string',
                default: '',
                description: 'Filter submitters by external ID.',
            },
            {
                displayName: 'Query',
                name: 'q',
                type: 'string',
                default: '',
                description: 'Filter submitters on name, email or phone partial match.',
            },
            {
                displayName: 'Submission ID',
                name: 'submission_id',
                type: 'number',
                default: 0,
                description: 'Filter submitters by submission ID.',
            },
        ],
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
                typeOptions: {
                    jsonSchema: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string',
                                    description: 'Name of the field as defined in the template.'
                                },
                                default_value: {
                                    type: 'string',
                                    description: 'Default value to pre-fill for this field.'
                                },
                                readonly: {
                                    type: 'boolean',
                                    description: 'Whether the field should be read-only.'
                                },
                                required: {
                                    type: 'boolean',
                                    description: 'Whether the field is required to be filled.'
                                },
                                preferences: {
                                    type: 'object',
                                    description: 'Visual preferences for the field.',
                                    properties: {
                                        font_size: {
                                            type: 'number',
                                            description: 'Font size in pixels.'
                                        },
                                        align: {
                                            type: 'string',
                                            description: 'Text alignment (left, center, right).'
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
                default: '{"subject": "", "body": ""}',
                description: 'Custom email message for the submitter. Format: {"subject": "Custom subject", "body": "Custom body with variables: {{template.name}}, {{submitter.link}}, {{account.name}}"}.',
                typeOptions: {
                    jsonSchema: {
                        type: 'object',
                        properties: {
                            subject: {
                                type: 'string',
                                description: 'Custom email subject line.'
                            },
                            body: {
                                type: 'string',
                                description: 'Custom email body text. Can include variables: {{template.name}}, {{submitter.link}}, {{account.name}}.'
                            }
                        }
                    }
                }
            },
            {
                displayName: 'Metadata',
                name: 'metadata',
                type: 'json',
                default: '{}',
                description: 'Metadata object with additional submitter information.',
                typeOptions: {
                    jsonSchema: {
                        type: 'object',
                        description: 'Custom metadata for the submitter.',
                        additionalProperties: {
                            type: 'string'
                        }
                    }
                }
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
//# sourceMappingURL=SubmitterDescription.js.map