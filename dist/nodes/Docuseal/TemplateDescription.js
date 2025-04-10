"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateFields = exports.templateOperations = void 0;
exports.templateOperations = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: [
                    'template',
                ],
            },
        },
        options: [
            {
                name: 'Get',
                value: 'get',
                description: 'Get a template by ID',
                action: 'Get a template by ID',
            },
            {
                name: 'Get List',
                value: 'getList',
                description: 'Get a list of templates',
                action: 'Get a list of templates',
            },
        ],
        default: 'getList',
    },
];
exports.templateFields = [
    {
        displayName: 'Template ID',
        name: 'templateId',
        type: 'number',
        required: true,
        displayOptions: {
            show: {
                resource: ['template'],
                operation: ['get'],
            },
        },
        default: 0,
        description: 'ID of the template to retrieve',
    },
    {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['template'],
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
                resource: ['template'],
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
                resource: ['template'],
                operation: ['getList'],
            },
        },
        options: [
            {
                displayName: 'External ID',
                name: 'external_id',
                type: 'string',
                default: '',
                description: 'Filter templates by external ID',
            },
            {
                displayName: 'Folder',
                name: 'folder',
                type: 'string',
                default: '',
                description: 'Filter templates by folder name',
            },
            {
                displayName: 'Include Archived',
                name: 'archived',
                type: 'boolean',
                default: false,
                description: 'Whether to include archived templates',
            },
            {
                displayName: 'Search Query',
                name: 'q',
                type: 'string',
                default: '',
                description: 'Search templates by name',
            },
        ],
    },
];
//# sourceMappingURL=TemplateDescription.js.map