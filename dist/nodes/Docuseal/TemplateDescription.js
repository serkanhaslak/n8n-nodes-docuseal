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
                resource: ['template'],
            },
        },
        options: [
            {
                name: 'Archive',
                value: 'archive',
                description: 'Archive a template',
                action: 'Archive a template',
            },
            {
                name: 'Clone',
                value: 'clone',
                description: 'Clone an existing template',
                action: 'Clone a template',
            },
            {
                name: 'Create from DOCX',
                value: 'createFromDocx',
                description: 'Create a template from a Word document',
                action: 'Create template from DOCX',
            },
            {
                name: 'Create from HTML',
                value: 'createFromHtml',
                description: 'Create a template from HTML content',
                action: 'Create template from HTML',
            },
            {
                name: 'Create from PDF',
                value: 'createFromPdf',
                description: 'Create a template from a PDF file',
                action: 'Create template from PDF',
            },
            {
                name: 'Get',
                value: 'get',
                description: 'Get a template by ID',
                action: 'Get a template',
            },
            {
                name: 'Get Many',
                value: 'getMany',
                description: 'Get many templates',
                action: 'Get many templates',
            },
            {
                name: 'Merge',
                value: 'merge',
                description: 'Merge multiple templates into one',
                action: 'Merge templates',
            },
            {
                name: 'Update',
                value: 'update',
                description: 'Update template properties',
                action: 'Update a template',
            },
            {
                name: 'Update Documents',
                value: 'updateDocuments',
                description: 'Update template documents',
                action: 'Update template documents',
            },
        ],
        default: 'get',
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
                operation: ['get', 'clone', 'archive', 'update', 'updateDocuments'],
            },
        },
        default: 0,
        description: 'ID of the template',
    },
    {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['template'],
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
                resource: ['template'],
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
                resource: ['template'],
                operation: ['getMany'],
            },
        },
        options: [
            {
                displayName: 'Archived',
                name: 'archived',
                type: 'boolean',
                default: false,
                description: 'Whether to include archived templates',
            },
            {
                displayName: 'External ID',
                name: 'external_id',
                type: 'string',
                default: '',
                description: 'Filter templates by external ID',
            },
            {
                displayName: 'Folder Name',
                name: 'folder',
                type: 'string',
                default: '',
                description: 'Filter templates by folder name',
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
    {
        displayName: 'Input Source',
        name: 'pdfSource',
        type: 'options',
        displayOptions: {
            show: {
                resource: ['template'],
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
                resource: ['template'],
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
                resource: ['template'],
                operation: ['createFromPdf'],
                pdfSource: ['url'],
            },
        },
        default: '',
        placeholder: 'https://example.com/document.pdf',
        description: 'URL of the PDF file to use',
    },
    {
        displayName: 'Input Source',
        name: 'docxSource',
        type: 'options',
        displayOptions: {
            show: {
                resource: ['template'],
                operation: ['createFromDocx'],
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
        description: 'Source of the DOCX file',
    },
    {
        displayName: 'Binary Property',
        name: 'binaryPropertyNameDocx',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['template'],
                operation: ['createFromDocx'],
                docxSource: ['binary'],
            },
        },
        default: 'data',
        description: 'Name of the binary property containing the DOCX file',
    },
    {
        displayName: 'File URL',
        name: 'fileUrlDocx',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['template'],
                operation: ['createFromDocx'],
                docxSource: ['url'],
            },
        },
        default: '',
        placeholder: 'https://example.com/document.docx',
        description: 'URL of the DOCX file to use',
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
                resource: ['template'],
                operation: ['createFromHtml'],
            },
        },
        default: '',
        placeholder: '<html><body><h1>Document Title</h1><p>Content...</p></body></html>',
        description: 'HTML content to create the template from',
    },
    {
        displayName: 'Template Name',
        name: 'name',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['template'],
                operation: ['createFromPdf', 'createFromDocx', 'createFromHtml', 'clone', 'update'],
            },
        },
        default: '',
        description: 'Name for the template',
    },
    {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
            show: {
                resource: ['template'],
                operation: ['createFromPdf', 'createFromDocx', 'createFromHtml', 'clone'],
            },
        },
        options: [
            {
                displayName: 'External ID',
                name: 'external_id',
                type: 'string',
                default: '',
                description: 'Your custom identifier for the template',
            },
            {
                displayName: 'Folder Name',
                name: 'folder_name',
                type: 'string',
                default: '',
                description: 'Folder to organize the template in',
            },
            {
                displayName: 'Fields Configuration',
                name: 'fields',
                type: 'fixedCollection',
                typeOptions: {
                    multipleValues: true,
                },
                default: {},
                description: 'Configure form fields for the template',
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
                                description: 'Name of the field',
                            },
                            {
                                displayName: 'Field Type',
                                name: 'type',
                                type: 'options',
                                options: [
                                    {
                                        name: 'Checkbox',
                                        value: 'checkbox',
                                    },
                                    {
                                        name: 'Date',
                                        value: 'date',
                                    },
                                    {
                                        name: 'Image',
                                        value: 'image',
                                    },
                                    {
                                        name: 'Initials',
                                        value: 'initials',
                                    },
                                    {
                                        name: 'Number',
                                        value: 'number',
                                    },
                                    {
                                        name: 'Radio',
                                        value: 'radio',
                                    },
                                    {
                                        name: 'Select',
                                        value: 'select',
                                    },
                                    {
                                        name: 'Signature',
                                        value: 'signature',
                                    },
                                    {
                                        name: 'Text',
                                        value: 'text',
                                    },
                                ],
                                default: 'text',
                                description: 'Type of the field',
                            },
                            {
                                displayName: 'Required',
                                name: 'required',
                                type: 'boolean',
                                default: false,
                                description: 'Whether this field is required',
                            },
                            {
                                displayName: 'Role',
                                name: 'role',
                                type: 'string',
                                default: '',
                                description: 'Role that should fill this field',
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        displayName: 'Template IDs',
        name: 'templateIds',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['template'],
                operation: ['merge'],
            },
        },
        default: '',
        placeholder: '123,456,789',
        description: 'Comma-separated list of template IDs to merge',
    },
    {
        displayName: 'Merged Template Name',
        name: 'mergedName',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['template'],
                operation: ['merge'],
            },
        },
        default: '',
        description: 'Name for the merged template',
    },
    {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
            show: {
                resource: ['template'],
                operation: ['update'],
            },
        },
        options: [
            {
                displayName: 'External ID',
                name: 'external_id',
                type: 'string',
                default: '',
                description: 'Update the external ID',
            },
            {
                displayName: 'Folder Name',
                name: 'folder_name',
                type: 'string',
                default: '',
                description: 'Move template to a different folder',
            },
            {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
                description: 'Update the template name',
            },
        ],
    },
    {
        displayName: 'Documents Source',
        name: 'documentsSource',
        type: 'options',
        displayOptions: {
            show: {
                resource: ['template'],
                operation: ['updateDocuments'],
            },
        },
        options: [
            {
                name: 'Binary Files',
                value: 'binary',
                description: 'Use binary files from a previous node',
            },
            {
                name: 'URLs',
                value: 'urls',
                description: 'Use files from URLs',
            },
        ],
        default: 'binary',
        description: 'Source of the document files',
    },
    {
        displayName: 'Binary Properties',
        name: 'binaryProperties',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['template'],
                operation: ['updateDocuments'],
                documentsSource: ['binary'],
            },
        },
        default: 'data',
        placeholder: 'data,attachment1,attachment2',
        description: 'Comma-separated list of binary property names containing the files',
    },
    {
        displayName: 'File URLs',
        name: 'fileUrls',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['template'],
                operation: ['updateDocuments'],
                documentsSource: ['urls'],
            },
        },
        default: '',
        placeholder: 'https://example.com/doc1.pdf,https://example.com/doc2.pdf',
        description: 'Comma-separated list of file URLs',
    },
];
//# sourceMappingURL=TemplateDescription.js.map