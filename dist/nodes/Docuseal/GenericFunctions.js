"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.docusealApiRequest = docusealApiRequest;
exports.docusealApiRequestAllItems = docusealApiRequestAllItems;
exports.parseJsonInput = parseJsonInput;
exports.getTemplates = getTemplates;
const n8n_workflow_1 = require("n8n-workflow");
async function docusealApiRequest(method, endpoint, body = {}, query = {}, options = {}) {
    const credentials = await this.getCredentials('docusealApi');
    if (!credentials) {
        throw new Error('No credentials provided!');
    }
    let environment;
    try {
        environment = this.getNodeParameter('environment', 0);
    }
    catch (error) {
        environment = 'production';
    }
    let apiKey = '';
    if (environment === 'production') {
        apiKey = credentials.productionApiKey;
    }
    else {
        apiKey = credentials.testApiKey;
        if (!apiKey) {
            throw new Error('Test API key is required for test environment');
        }
    }
    const baseUrl = credentials.baseUrl || 'https://api.docuseal.com';
    const requestOptions = {
        method,
        body,
        qs: query,
        uri: `${baseUrl}${endpoint}`,
        headers: {
            'X-Auth-Token': apiKey,
        },
        json: true,
    };
    if (Object.keys(options).length > 0) {
        Object.assign(requestOptions, options);
    }
    try {
        return await this.helpers.request(requestOptions);
    }
    catch (error) {
        throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
    }
}
async function docusealApiRequestAllItems(method, endpoint, body = {}, query = {}) {
    const returnData = [];
    let responseData;
    query.limit = 100;
    responseData = await docusealApiRequest.call(this, method, endpoint, body, query);
    if (Array.isArray(responseData)) {
        returnData.push(...responseData);
    }
    return returnData;
}
function parseJsonInput(inputData) {
    if (typeof inputData === 'string') {
        try {
            return JSON.parse(inputData);
        }
        catch (error) {
            throw new Error('Invalid JSON input. Please provide valid JSON.');
        }
    }
    return inputData;
}
async function getTemplates() {
    const templates = await docusealApiRequest.call(this, 'GET', '/templates', {}, {});
    if (!Array.isArray(templates)) {
        return [];
    }
    return templates.map((template) => ({
        name: template.name,
        value: template.id,
    }));
}
//# sourceMappingURL=GenericFunctions.js.map