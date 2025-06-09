"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = exports.buildFieldValues = exports.buildSubmittersArray = exports.prepareBinaryData = exports.getTemplates = exports.parseJsonInput = exports.docusealApiRequestAllItems = exports.docusealApiRequest = void 0;
const n8n_workflow_1 = require("n8n-workflow");
async function docusealApiRequest(method, endpoint, body = {}, query = {}, options = {}) {
    const credentials = await this.getCredentials('docusealApi');
    if (!credentials) {
        throw new Error('No credentials provided!');
    }
    const environment = credentials.environment || 'production';
    let apiKey = '';
    if (environment === 'production') {
        apiKey = credentials.productionApiKey;
        if (!apiKey) {
            throw new Error('Production API key is required for production environment');
        }
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
        url: `${baseUrl}${endpoint}`,
        headers: {
            'X-Auth-Token': apiKey,
        },
        json: true,
    };
    if (Object.keys(options).length > 0) {
        Object.assign(requestOptions, options);
    }
    if (options.formData) {
        requestOptions.formData = options.formData;
        delete requestOptions.body;
        delete requestOptions.json;
    }
    try {
        return await this.helpers.request(requestOptions);
    }
    catch (error) {
        throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
    }
}
exports.docusealApiRequest = docusealApiRequest;
async function docusealApiRequestAllItems(method, endpoint, body = {}, query = {}) {
    const returnData = [];
    let responseData;
    let nextCursor;
    query.limit = 100;
    do {
        if (nextCursor) {
            query.after = nextCursor;
        }
        responseData = await docusealApiRequest.call(this, method, endpoint, body, query);
        if (Array.isArray(responseData)) {
            returnData.push(...responseData);
            if (responseData.length === query.limit) {
                const lastItem = responseData[responseData.length - 1];
                nextCursor = lastItem.id;
            }
            else {
                nextCursor = undefined;
            }
        }
        else {
            break;
        }
    } while (nextCursor);
    return returnData;
}
exports.docusealApiRequestAllItems = docusealApiRequestAllItems;
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
exports.parseJsonInput = parseJsonInput;
async function getTemplates() {
    try {
        const templates = await docusealApiRequest.call(this, 'GET', '/templates', {}, { limit: 100 });
        if (!Array.isArray(templates)) {
            return [];
        }
        return templates.map((template) => ({
            name: template.name || `Template ${template.id}`,
            value: template.id,
        }));
    }
    catch (error) {
        return [];
    }
}
exports.getTemplates = getTemplates;
async function prepareBinaryData(binaryPropertyName, itemIndex, fileName) {
    const binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
    const dataBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
    return {
        value: dataBuffer,
        options: {
            filename: fileName || binaryData.fileName || 'file',
            contentType: binaryData.mimeType,
        },
    };
}
exports.prepareBinaryData = prepareBinaryData;
function buildSubmittersArray(submittersData) {
    if (!submittersData.submitter) {
        return [];
    }
    const submitterItems = Array.isArray(submittersData.submitter)
        ? submittersData.submitter
        : [submittersData.submitter];
    return submitterItems.map((item) => {
        const submitter = {
            email: item.email,
            role: item.role || 'Signer',
        };
        if (item.additionalFields) {
            const additionalFields = item.additionalFields;
            if (additionalFields.name)
                submitter.name = additionalFields.name;
            if (additionalFields.phone)
                submitter.phone = additionalFields.phone;
            if (additionalFields.external_id)
                submitter.external_id = additionalFields.external_id;
            if (additionalFields.completed !== undefined)
                submitter.completed = additionalFields.completed;
            if (additionalFields.send_email !== undefined)
                submitter.send_email = additionalFields.send_email;
            if (additionalFields.send_sms !== undefined)
                submitter.send_sms = additionalFields.send_sms;
            if (additionalFields.metadata) {
                submitter.metadata = parseJsonInput(additionalFields.metadata);
            }
            if (additionalFields.values) {
                submitter.values = parseJsonInput(additionalFields.values);
            }
        }
        return submitter;
    });
}
exports.buildSubmittersArray = buildSubmittersArray;
function buildFieldValues(nodeParameters) {
    const fieldValuesMode = nodeParameters.fieldValuesMode || 'individual';
    if (fieldValuesMode === 'json') {
        const fieldValuesJson = nodeParameters.fieldValuesJson;
        if (fieldValuesJson) {
            return parseJsonInput(fieldValuesJson);
        }
        return {};
    }
    else {
        const fieldValues = nodeParameters.fieldValues;
        if (!fieldValues || !fieldValues.field) {
            return {};
        }
        const fields = fieldValues.field;
        const result = {};
        for (const field of fields) {
            if (field.name && field.value !== undefined) {
                result[field.name] = field.value;
            }
        }
        return result;
    }
}
exports.buildFieldValues = buildFieldValues;
function formatDate(date) {
    if (!date)
        return '';
    const dateObj = new Date(date);
    return dateObj.toISOString();
}
exports.formatDate = formatDate;
//# sourceMappingURL=GenericFunctions.js.map