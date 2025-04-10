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
        description: 'Array of submitters. Each submitter should have email, name, and optional role properties.',
        hint: 'Format: [{"email": "user@example.com", "name": "User Name", "role": "Role Name"}]',
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
                displayName: 'Fields',
                name: 'fields',
                type: 'json',
                default: '{}',
                description: 'JSON object with field values to pre-fill in the submission. The keys should match the field names in the template.',
                hint: 'Format: {"field_name": "field_value"}',
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
//# sourceMappingURL=SubmissionDescription.js.map