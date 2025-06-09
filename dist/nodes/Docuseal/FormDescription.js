"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formFields = exports.formOperations = void 0;
exports.formOperations = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['form'],
            },
        },
        options: [
            {
                name: 'Get Started',
                value: 'getStarted',
                description: 'Get form events when form is started',
                action: 'Get form started events',
            },
            {
                name: 'Get Viewed',
                value: 'getViewed',
                description: 'Get form events when form is viewed',
                action: 'Get form viewed events',
            },
        ],
        default: 'getStarted',
    },
];
exports.formFields = [
    {
        displayName: 'Submitter ID',
        name: 'submitterId',
        type: 'number',
        required: true,
        displayOptions: {
            show: {
                resource: ['form'],
                operation: ['getStarted', 'getViewed'],
            },
        },
        default: 0,
        description: 'ID of the submitter to get form events for',
    },
];
//# sourceMappingURL=FormDescription.js.map