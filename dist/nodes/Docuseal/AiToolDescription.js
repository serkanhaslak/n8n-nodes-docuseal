"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiToolFields = exports.aiToolOperations = void 0;
exports.aiToolOperations = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['aiTool'],
            },
        },
        options: [
            {
                name: 'Generate Document',
                value: 'generateDocument',
                description: 'Generate a document using AI based on a description',
                action: 'Generate a document with AI',
            },
        ],
        default: 'generateDocument',
    },
];
exports.aiToolFields = [
    {
        displayName: 'Document Type',
        name: 'documentType',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['aiTool'],
                operation: ['generateDocument'],
            },
        },
        default: '',
        placeholder: 'e.g., Non-disclosure agreement, Employment contract, Invoice',
        description: 'The type of document to generate (e.g., "Non-disclosure agreement", "Employment contract", "Invoice", "Purchase agreement")',
    },
    {
        displayName: 'Document Description',
        name: 'description',
        type: 'string',
        typeOptions: {
            rows: 4,
        },
        required: true,
        displayOptions: {
            show: {
                resource: ['aiTool'],
                operation: ['generateDocument'],
            },
        },
        default: '',
        placeholder: 'e.g., Standard NDA for a contractor relationship between Acme Inc. and John Doe',
        description: 'Detailed description of the document content and requirements. Include party names, specific terms, and any special clauses needed.',
    },
    {
        displayName: 'Additional Options',
        name: 'additionalOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: {
            show: {
                resource: ['aiTool'],
                operation: ['generateDocument'],
            },
        },
        options: [
            {
                displayName: 'Language',
                name: 'language',
                type: 'options',
                default: 'en',
                options: [
                    {
                        name: 'Chinese (Simplified)',
                        value: 'zh',
                    },
                    {
                        name: 'Dutch',
                        value: 'nl',
                    },
                    {
                        name: 'English',
                        value: 'en',
                    },
                    {
                        name: 'French',
                        value: 'fr',
                    },
                    {
                        name: 'German',
                        value: 'de',
                    },
                    {
                        name: 'Italian',
                        value: 'it',
                    },
                    {
                        name: 'Japanese',
                        value: 'ja',
                    },
                    {
                        name: 'Korean',
                        value: 'ko',
                    },
                    {
                        name: 'Polish',
                        value: 'pl',
                    },
                    {
                        name: 'Portuguese',
                        value: 'pt',
                    },
                    {
                        name: 'Russian',
                        value: 'ru',
                    },
                    {
                        name: 'Spanish',
                        value: 'es',
                    },
                ],
                description: 'Language for the generated document',
            },
            {
                displayName: 'Style',
                name: 'style',
                type: 'options',
                default: 'formal',
                options: [
                    {
                        name: 'Formal',
                        value: 'formal',
                    },
                    {
                        name: 'Friendly',
                        value: 'friendly',
                    },
                    {
                        name: 'Simple',
                        value: 'simple',
                    },
                ],
                description: 'Writing style for the document',
            },
            {
                displayName: 'Fields to Include',
                name: 'fields',
                type: 'string',
                default: '',
                placeholder: 'e.g., signature, date, name, address',
                description: 'Comma-separated list of fields to include in the document (e.g., "signature, date, name, company, address")',
            },
        ],
    },
];
//# sourceMappingURL=AiToolDescription.js.map