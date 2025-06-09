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
                resource: ['submission'],
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
                description: 'Create a new submission from a template',
                action: 'Create a submission',
            },
            {
                name: 'Create from HTML',
                value: 'createFromHtml',
                description: 'Create a submission from HTML content',
                action: 'Create submission from HTML',
            },
            {
                name: 'Create from PDF',
                value: 'createFromPdf',
                description: 'Create a submission from a PDF file',
                action: 'Create submission from PDF',
            },
            {
                name: 'Get',
                value: 'get',
                description: 'Get a submission by ID',
                action: 'Get a submission',
            },
            {
                name: 'Get Documents',
                value: 'getDocuments',
                description: 'Get documents from a submission',
                action: 'Get submission documents',
            },
            {
                name: 'Get Many',
                value: 'getMany',
                description: 'Get many submissions',
                action: 'Get many submissions',
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
                operation: ['get', 'archive', 'getDocuments'],
            },
        },
        default: 0,
        description: 'ID of the submission',
    },
    {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['submission'],
                operation: ['getMany'],
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
                operation: ['getMany'],
                returnAll: [false],
            },
        },
        typeOptions: {
            minValue: 1,
            maxValue: 100,
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
                operation: ['getMany'],
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
                displayName: 'Archived',
                name: 'archived',
                type: 'boolean',
                default: false,
                description: 'Whether to include archived submissions',
            },
            {
                displayName: 'Before ID',
                name: 'before',
                type: 'number',
                default: 0,
                description: 'Return results before this submission ID',
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
                        name: 'All',
                        value: '',
                    },
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
                default: '',
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
    {
        displayName: 'Template Name or ID',
        name: 'templateId',
        type: 'options',
        typeOptions: {
            loadOptionsMethod: 'getTemplates',
        },
        required: true,
        displayOptions: {
            show: {
                resource: ['submission'],
                operation: ['create'],
            },
        },
        default: '',
        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
    },
    {
        displayName: 'Submitters',
        name: 'submitters',
        type: 'fixedCollection',
        typeOptions: {
            multipleValues: true,
        },
        required: true,
        displayOptions: {
            show: {
                resource: ['submission'],
                operation: ['create', 'createFromPdf', 'createFromHtml'],
            },
        },
        default: {},
        placeholder: 'Add Submitter',
        description: 'People who will sign or fill the document',
        options: [
            {
                name: 'submitter',
                displayName: 'Submitter',
                values: [
                    {
                        displayName: 'Email',
                        name: 'email',
                        type: 'string',
                        placeholder: 'name@email.com',
                        required: true,
                        default: '',
                        description: 'Email address of the submitter',
                    },
                    {
                        displayName: 'Role',
                        name: 'role',
                        type: 'string',
                        required: true,
                        default: 'Signer',
                        placeholder: 'e.g., Signer, Client, Witness',
                        description: 'Role of the submitter in the document',
                    },
                    {
                        displayName: 'Additional Fields',
                        name: 'additionalFields',
                        type: 'collection',
                        placeholder: 'Add Field',
                        default: {},
                        options: [
                            {
                                displayName: 'Completed',
                                name: 'completed',
                                type: 'boolean',
                                default: false,
                                description: 'Whether to mark this submitter as already completed',
                            },
                            {
                                displayName: 'External ID',
                                name: 'external_id',
                                type: 'string',
                                default: '',
                                description: 'Your custom identifier for this submitter',
                            },
                            {
                                displayName: 'Metadata',
                                name: 'metadata',
                                type: 'json',
                                default: '{}',
                                description: 'Additional metadata for the submitter',
                            },
                            {
                                displayName: 'Name',
                                name: 'name',
                                type: 'string',
                                default: '',
                                description: 'Full name of the submitter',
                            },
                            {
                                displayName: 'Phone',
                                name: 'phone',
                                type: 'string',
                                default: '',
                                placeholder: '+1234567890',
                                description: 'Phone number of the submitter',
                            },
                            {
                                displayName: 'Send Email',
                                name: 'send_email',
                                type: 'boolean',
                                default: true,
                                description: 'Whether to send email notification to this submitter',
                            },
                            {
                                displayName: 'Send SMS',
                                name: 'send_sms',
                                type: 'boolean',
                                default: false,
                                description: 'Whether to send SMS notification to this submitter',
                            },
                            {
                                displayName: 'Values',
                                name: 'values',
                                type: 'json',
                                default: '{}',
                                placeholder: '{"First Name": "John", "Last Name": "Doe"}',
                                description: 'Pre-filled values for this submitter\'s fields',
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        displayName: 'Field Values',
        name: 'fieldValues',
        type: 'fixedCollection',
        typeOptions: {
            multipleValues: true,
        },
        displayOptions: {
            show: {
                resource: ['submission'],
                operation: ['create'],
            },
        },
        default: {},
        placeholder: 'Add Field Value',
        description: 'Pre-fill document fields with values',
        options: [
            {
                name: 'field',
                displayName: 'Field',
                values: [
                    {
                        displayName: 'Field Name',
                        name: 'name',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'Name of the field in the template',
                    },
                    {
                        displayName: 'Value',
                        name: 'value',
                        type: 'string',
                        default: '',
                        description: 'Value to pre-fill in the field',
                    },
                ],
            },
        ],
    },
    {
        displayName: 'Input Source',
        name: 'pdfSource',
        type: 'options',
        displayOptions: {
            show: {
                resource: ['submission'],
                operation: ['createFromPdf'],
            },
        },
        options: [
            {
                name: 'Binary File',
                value: 'binary',
                description: 'Use a binary file from a previous node',
            },
            {
                name: 'URL',
                value: 'url',
                description: 'Use a file from a URL',
            },
        ],
        default: 'binary',
        description: 'Source of the PDF file',
    },
    {
        displayName: 'Binary Property',
        name: 'binaryPropertyName',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['submission'],
                operation: ['createFromPdf'],
                pdfSource: ['binary'],
            },
        },
        default: 'data',
        description: 'Name of the binary property containing the PDF file',
    },
    {
        displayName: 'File URL',
        name: 'fileUrl',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['submission'],
                operation: ['createFromPdf'],
                pdfSource: ['url'],
            },
        },
        default: '',
        placeholder: 'https://example.com/document.pdf',
        description: 'URL of the PDF file to use',
    },
    {
        displayName: 'HTML Content',
        name: 'htmlContent',
        type: 'string',
        typeOptions: {
            rows: 10,
        },
        required: true,
        displayOptions: {
            show: {
                resource: ['submission'],
                operation: ['createFromHtml'],
            },
        },
        default: '',
        placeholder: '<html><body><h1>Document Title</h1><p>Content...</p></body></html>',
        description: 'HTML content to create the submission from',
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
                operation: ['create', 'createFromPdf', 'createFromHtml'],
            },
        },
        options: [
            {
                displayName: 'Completed Redirect URL',
                name: 'completed_redirect_url',
                type: 'string',
                default: '',
                placeholder: 'https://example.com/thank-you',
                description: 'URL to redirect submitters after completion',
            },
            {
                displayName: 'Expire At',
                name: 'expire_at',
                type: 'dateTime',
                default: '',
                description: 'When the submission should expire',
            },
            {
                displayName: 'External ID',
                name: 'external_id',
                type: 'string',
                default: '',
                description: 'Your custom identifier for this submission',
            },
            {
                displayName: 'Message',
                name: 'message',
                type: 'fixedCollection',
                default: {},
                options: [
                    {
                        name: 'messageFields',
                        displayName: 'Message',
                        values: [
                            {
                                displayName: 'Subject',
                                name: 'subject',
                                type: 'string',
                                default: '',
                                description: 'Custom email subject',
                            },
                            {
                                displayName: 'Body',
                                name: 'body',
                                type: 'string',
                                typeOptions: {
                                    rows: 5,
                                },
                                default: '',
                                description: 'Custom email body. Available variables: {{template.name}}, {{submitter.link}}, {{account.name}}',
                            },
                        ],
                    },
                ],
            },
            {
                displayName: 'Metadata',
                name: 'metadata',
                type: 'json',
                default: '{}',
                description: 'Additional metadata for the submission',
            },
            {
                displayName: 'Order',
                name: 'order',
                type: 'options',
                options: [
                    {
                        name: 'Random (All at Once)',
                        value: 'random',
                        description: 'Send to all parties at once',
                    },
                    {
                        name: 'Sequential',
                        value: 'preserved',
                        description: 'Send in order (next party after previous completes)',
                    },
                ],
                default: 'random',
                description: 'Document signing order',
            },
            {
                displayName: 'Send Email',
                name: 'send_email',
                type: 'boolean',
                default: true,
                description: 'Whether to send email notifications',
            },
            {
                displayName: 'Send SMS',
                name: 'send_sms',
                type: 'boolean',
                default: false,
                description: 'Whether to send SMS notifications',
            },
        ],
    },
    {
        displayName: 'Document Preferences',
        name: 'preferences',
        type: 'collection',
        placeholder: 'Add Preference',
        default: {},
        displayOptions: {
            show: {
                resource: ['submission'],
                operation: ['create', 'createFromPdf', 'createFromHtml'],
            },
        },
        options: [
            {
                displayName: 'Bcc Completed',
                name: 'bcc_completed',
                type: 'string',
                default: '',
                placeholder: 'admin@example.com',
                description: 'Email address to BCC when submission is completed',
            },
            {
                displayName: 'Reply To',
                name: 'reply_to',
                type: 'string',
                default: '',
                placeholder: 'support@example.com',
                description: 'Reply-to email address for notifications',
            },
        ],
    },
];
//# sourceMappingURL=SubmissionDescription.js.map