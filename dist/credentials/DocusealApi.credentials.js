"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocusealApi = void 0;
class DocusealApi {
    constructor() {
        this.name = 'docusealApi';
        this.displayName = 'DocuSeal API';
        this.documentationUrl = 'https://www.docuseal.com/docs/api';
        this.properties = [
            {
                displayName: 'Production API Key',
                name: 'productionApiKey',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                description: 'The DocuSeal production API key obtained from your DocuSeal account',
            },
            {
                displayName: 'Test API Key',
                name: 'testApiKey',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                description: 'The DocuSeal test API key for sandbox testing',
            },
            {
                displayName: 'Base URL',
                name: 'baseUrl',
                type: 'string',
                default: 'https://api.docuseal.com',
                description: 'The base URL for DocuSeal API calls',
            },
        ];
    }
}
exports.DocusealApi = DocusealApi;
//# sourceMappingURL=DocusealApi.credentials.js.map