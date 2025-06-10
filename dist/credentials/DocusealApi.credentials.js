"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocusealApi = void 0;
class DocusealApi {
    constructor() {
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'docusealApi'
        });
        Object.defineProperty(this, "displayName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'DocuSeal API'
        });
        Object.defineProperty(this, "documentationUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'https://www.docuseal.com/docs/api'
        });
        Object.defineProperty(this, "properties", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: [
                {
                    displayName: 'Environment',
                    name: 'environment',
                    type: 'options',
                    options: [
                        {
                            name: 'Production',
                            value: 'production',
                        },
                        {
                            name: 'Test',
                            value: 'test',
                        },
                    ],
                    default: 'production',
                    description: 'Choose whether to use the production or test environment',
                },
                {
                    displayName: 'Production API Key',
                    name: 'productionApiKey',
                    type: 'string',
                    typeOptions: { password: true },
                    default: '',
                    description: 'The DocuSeal production API key obtained from your DocuSeal account. Must be at least 20 characters long and contain only alphanumeric characters, hyphens, and underscores.',
                    displayOptions: {
                        show: {
                            environment: ['production'],
                        },
                    },
                },
                {
                    displayName: 'Test API Key',
                    name: 'testApiKey',
                    type: 'string',
                    typeOptions: { password: true },
                    default: '',
                    description: 'The DocuSeal test API key for sandbox testing. Must be at least 20 characters long and contain only alphanumeric characters, hyphens, and underscores.',
                    displayOptions: {
                        show: {
                            environment: ['test'],
                        },
                    },
                },
                {
                    displayName: 'Base URL',
                    name: 'baseUrl',
                    type: 'string',
                    default: 'https://api.docuseal.com',
                    description: 'The base URL for DocuSeal API calls. Must be a valid HTTPS URL.',
                },
            ]
        });
    }
}
exports.DocusealApi = DocusealApi;
//# sourceMappingURL=DocusealApi.credentials.js.map