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
                resource: ['submitter'],
            },
        },
        options: [
            {
                name: 'Get',
                value: 'get',
                description: 'Get a submitter by ID',
                action: 'Get a submitter',
            },
            {
                name: 'Get Many',
                value: 'getMany',
                description: 'Get many submitters',
                action: 'Get many submitters',
            },
            {
                name: 'Update',
                value: 'update',
                description: 'Update a submitter',
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
        description: 'ID of the submitter',
    },
    {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['submitter'],
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
                resource: ['submitter'],
                operation: ['getMany'],
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
                resource: ['submitter'],
                operation: ['getMany'],
            },
        },
        options: [
            {
                displayName: 'After ID',
                name: 'after',
                type: 'number',
                default: 0,
                description: 'Fetch submitters with ID greater than this value (cursor-based pagination)',
            },
            {
                displayName: 'Before ID',
                name: 'before',
                type: 'number',
                default: 0,
                description: 'Fetch submitters with ID less than this value (cursor-based pagination)',
            },
            {
                displayName: 'Completed After',
                name: 'completed_after',
                type: 'dateTime',
                default: '',
                description: 'Filter submitters completed after this date',
            },
            {
                displayName: 'Completed Before',
                name: 'completed_before',
                type: 'dateTime',
                default: '',
                description: 'Filter submitters completed before this date',
            },
            {
                displayName: 'External ID',
                name: 'external_id',
                type: 'string',
                default: '',
                description: 'Filter by external ID',
            },
            {
                displayName: 'Search Query',
                name: 'q',
                type: 'string',
                default: '',
                description: 'Search by name, email or phone',
            },
            {
                displayName: 'Submission ID',
                name: 'submission_id',
                type: 'number',
                default: 0,
                description: 'Filter by submission ID',
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
                description: 'Whether to mark the submitter as completed',
            },
            {
                displayName: 'Completed Redirect URL',
                name: 'completed_redirect_url',
                type: 'string',
                default: '',
                placeholder: 'https://example.com/thank-you',
                description: 'URL to redirect after completion',
            },
            {
                displayName: 'Email',
                name: 'email',
                type: 'string',
                placeholder: 'name@email.com',
                default: '',
                description: 'Update email address',
            },
            {
                displayName: 'External ID',
                name: 'external_id',
                type: 'string',
                default: '',
                description: 'Update external ID',
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
                                description: 'Custom email body',
                            },
                        ],
                    },
                ],
            },
            {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
                description: 'Update submitter name',
            },
            {
                displayName: 'Phone',
                name: 'phone',
                type: 'string',
                default: '',
                placeholder: '+1234567890',
                description: 'Update phone number',
            },
            {
                displayName: 'Role',
                name: 'role',
                type: 'string',
                default: '',
                placeholder: 'e.g., Signer, Client, Witness',
                description: 'Update submitter role',
            },
            {
                displayName: 'Send Email',
                name: 'send_email',
                type: 'boolean',
                default: false,
                description: 'Whether to send email notification',
            },
            {
                displayName: 'Send SMS',
                name: 'send_sms',
                type: 'boolean',
                default: false,
                description: 'Whether to send SMS notification',
            },
        ],
    },
    {
        displayName: 'Fields Configuration',
        name: 'fields',
        type: 'fixedCollection',
        typeOptions: {
            multipleValues: true,
        },
        displayOptions: {
            show: {
                resource: ['submitter'],
                operation: ['update'],
            },
        },
        default: {},
        placeholder: 'Add Field Configuration',
        description: 'Configure field settings',
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
                        description: 'Name of the field as defined in the template',
                    },
                    {
                        displayName: 'Default Value',
                        name: 'default_value',
                        type: 'string',
                        default: '',
                        description: 'Default value for the field',
                    },
                    {
                        displayName: 'Read Only',
                        name: 'readonly',
                        type: 'boolean',
                        default: false,
                        description: 'Whether the field is read-only',
                    },
                    {
                        displayName: 'Required',
                        name: 'required',
                        type: 'boolean',
                        default: false,
                        description: 'Whether the field is required',
                    },
                ],
            },
        ],
    },
    {
        displayName: 'Field Values',
        name: 'values',
        type: 'fixedCollection',
        typeOptions: {
            multipleValues: true,
        },
        displayOptions: {
            show: {
                resource: ['submitter'],
                operation: ['update'],
            },
        },
        default: {},
        placeholder: 'Add Field Value',
        description: 'Pre-fill field values',
        options: [
            {
                name: 'value',
                displayName: 'Value',
                values: [
                    {
                        displayName: 'Field Name',
                        name: 'name',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'Name of the field',
                    },
                    {
                        displayName: 'Value',
                        name: 'value',
                        type: 'string',
                        default: '',
                        description: 'Value to set',
                    },
                ],
            },
        ],
    },
];
//# sourceMappingURL=SubmitterDescription.js.map