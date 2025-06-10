"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = exports.buildFieldValues = exports.buildSubmittersArray = exports.prepareBinaryData = exports.getTemplates = exports.parseJsonInput = exports.docusealApiUploadOptimized = exports.docusealApiBatchRequest = exports.docusealApiRequestAllItems = exports.docusealApiRequest = exports.validateEndpoint = exports.validateUrl = exports.validateFile = exports.sanitizeInput = exports.validateApiKey = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
];
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const API_KEY_PATTERN = /^[a-zA-Z0-9_-]{20,}$/;
function validateApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
        return { isValid: false, message: 'API key is required and must be a string' };
    }
    if (apiKey.trim() !== apiKey) {
        return { isValid: false, message: 'API key cannot contain leading or trailing whitespace' };
    }
    if (apiKey.length < 20) {
        return { isValid: false, message: 'API key must be at least 20 characters long' };
    }
    if (!API_KEY_PATTERN.test(apiKey)) {
        return {
            isValid: false,
            message: 'API key contains invalid characters. Only alphanumeric characters, hyphens, and underscores are allowed',
        };
    }
    if (/^(demo|sample|example)/i.test(apiKey)) {
        return { isValid: false, message: 'API key appears to be a placeholder key' };
    }
    return { isValid: true };
}
exports.validateApiKey = validateApiKey;
function sanitizeInput(input) {
    if (typeof input === 'string') {
        return input
            .replace(/[<>"'&]/g, '')
            .replace(/[\p{Cc}]/gu, '')
            .trim();
    }
    if (Array.isArray(input)) {
        return input.map(sanitizeInput);
    }
    if (input && typeof input === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(input)) {
            sanitized[sanitizeInput(key)] = sanitizeInput(value);
        }
        return sanitized;
    }
    return input;
}
exports.sanitizeInput = sanitizeInput;
function validateFile(fileData, fileName, mimeType) {
    if (fileData.length > MAX_FILE_SIZE) {
        return {
            isValid: false,
            message: `File size (${Math.round(fileData.length / 1024 / 1024)}MB) exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        };
    }
    if (mimeType && !ALLOWED_FILE_TYPES.includes(mimeType)) {
        return {
            isValid: false,
            message: `File type '${mimeType}' is not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`,
        };
    }
    const fileExtension = fileName.toLowerCase().split('.').pop();
    const allowedExtensions = ['pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png', 'gif', 'txt'];
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        return {
            isValid: false,
            message: `File extension '${fileExtension}' is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`,
        };
    }
    const fileSignature = fileData.slice(0, 8).toString('hex').toUpperCase();
    if (fileExtension === 'pdf' && !fileSignature.startsWith('255044462D')) {
        return { isValid: false, message: 'File does not appear to be a valid PDF' };
    }
    if (fileExtension === 'png' && !fileSignature.startsWith('89504E47')) {
        return { isValid: false, message: 'File does not appear to be a valid PNG' };
    }
    if (['jpg', 'jpeg'].includes(fileExtension) && !fileSignature.startsWith('FFD8FF')) {
        return { isValid: false, message: 'File does not appear to be a valid JPEG' };
    }
    return { isValid: true };
}
exports.validateFile = validateFile;
function validateUrl(url) {
    if (!url || typeof url !== 'string') {
        return { isValid: false, message: 'URL is required and must be a string' };
    }
    try {
        const urlObj = new URL(url);
        if (urlObj.protocol !== 'https:') {
            return { isValid: false, message: 'Only HTTPS URLs are allowed for security reasons' };
        }
        const hostname = urlObj.hostname.toLowerCase();
        const isLocalhost = hostname === 'localhost';
        const isLoopback = hostname === '127.0.0.1';
        const isPrivateClass1 = hostname.startsWith('192.168.');
        const isPrivateClass2 = hostname.startsWith('10.');
        const isPrivateClass3 = Boolean(hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./));
        const isLinkLocal = hostname.startsWith('169.254.');
        if (isLocalhost ||
            isLoopback ||
            isPrivateClass1 ||
            isPrivateClass2 ||
            isPrivateClass3 ||
            isLinkLocal) {
            return {
                isValid: false,
                message: 'URLs pointing to localhost or private networks are not allowed',
            };
        }
        if (url.includes('..') || url.includes('%2e%2e')) {
            return { isValid: false, message: 'URL contains suspicious path traversal patterns' };
        }
        return { isValid: true };
    }
    catch (error) {
        return { isValid: false, message: 'Invalid URL format' };
    }
}
exports.validateUrl = validateUrl;
function validateEndpoint(endpoint) {
    if (!endpoint || typeof endpoint !== 'string') {
        return { isValid: false, message: 'Endpoint is required and must be a string' };
    }
    let sanitized = endpoint.trim();
    if (!sanitized.startsWith('/')) {
        sanitized = `/${sanitized}`;
    }
    sanitized = sanitized.replace(/\/+/g, '/');
    if (sanitized.includes('..') || sanitized.includes('%2e%2e')) {
        return { isValid: false, message: 'Endpoint contains invalid path traversal patterns' };
    }
    if (!/^[a-zA-Z0-9/_-]+$/.test(sanitized)) {
        return { isValid: false, message: 'Endpoint contains invalid characters' };
    }
    return { isValid: true, sanitized };
}
exports.validateEndpoint = validateEndpoint;
async function docusealApiRequest(method, endpoint, body = {}, query = {}, options = {}, retryCount = 3) {
    const endpointValidation = validateEndpoint(endpoint);
    if (!endpointValidation.isValid) {
        throw new n8n_workflow_1.NodeApiError(this.getNode(), {
            message: 'Invalid API endpoint',
            description: endpointValidation.message,
            httpCode: '400',
        });
    }
    endpoint = endpointValidation.sanitized ?? endpoint;
    body = sanitizeInput(body);
    query = sanitizeInput(query);
    let credentials;
    try {
        credentials = await this.getCredentials('docusealApi');
    }
    catch (error) {
        throw new n8n_workflow_1.NodeApiError(this.getNode(), {
            message: 'Failed to retrieve DocuSeal credentials',
            description: 'Please ensure DocuSeal API credentials are properly configured in n8n',
            cause: error,
            httpCode: '401',
        });
    }
    if (!credentials) {
        throw new n8n_workflow_1.NodeApiError(this.getNode(), {
            message: 'DocuSeal credentials not found',
            description: 'Please configure DocuSeal API credentials in the node settings',
            httpCode: '401',
        });
    }
    const environment = credentials.environment || 'production';
    let apiKey = '';
    if (environment === 'production') {
        apiKey = credentials.productionApiKey;
        if (!apiKey || apiKey.trim() === '') {
            throw new n8n_workflow_1.NodeApiError(this.getNode(), {
                message: 'Production API key is missing',
                description: 'Please provide a valid production API key in the DocuSeal credentials. You can obtain this from your DocuSeal account settings.',
                httpCode: '401',
            });
        }
    }
    else {
        apiKey = credentials.testApiKey;
        if (!apiKey || apiKey.trim() === '') {
            throw new n8n_workflow_1.NodeApiError(this.getNode(), {
                message: 'Test API key is missing',
                description: 'Please provide a valid test API key in the DocuSeal credentials for sandbox testing. You can obtain this from your DocuSeal test environment.',
                httpCode: '401',
            });
        }
    }
    const apiKeyValidation = validateApiKey(apiKey);
    if (!apiKeyValidation.isValid) {
        throw new n8n_workflow_1.NodeApiError(this.getNode(), {
            message: 'Invalid API key format',
            description: apiKeyValidation.message,
            httpCode: '401',
        });
    }
    const baseUrl = credentials.baseUrl || 'https://api.docuseal.com';
    const urlValidation = validateUrl(baseUrl);
    if (!urlValidation.isValid) {
        throw new n8n_workflow_1.NodeApiError(this.getNode(), {
            message: 'Invalid base URL',
            description: urlValidation.message,
            httpCode: '400',
        });
    }
    const requestOptions = {
        method,
        body,
        qs: query,
        url: `${baseUrl}${endpoint}`,
        headers: {
            'X-Auth-Token': apiKey,
            'User-Agent': 'n8n-docuseal-node/1.0.0',
        },
        json: true,
        timeout: 30000,
    };
    if (Object.keys(options).length > 0) {
        Object.assign(requestOptions, options);
    }
    if (options.formData) {
        const formData = options.formData;
        for (const [, value] of Object.entries(formData)) {
            if (value && typeof value === 'object' && 'value' in value && Buffer.isBuffer(value.value)) {
                const fileObject = value;
                const fileValidation = validateFile(fileObject.value, fileObject.filename ?? 'unknown', fileObject.contentType);
                if (!fileValidation.isValid) {
                    throw new n8n_workflow_1.NodeApiError(this.getNode(), {
                        message: 'File validation failed',
                        description: fileValidation.message,
                        httpCode: '400',
                    });
                }
            }
        }
        requestOptions.formData = options.formData;
        delete requestOptions.body;
        delete requestOptions.json;
    }
    for (let attempt = 1; attempt <= retryCount; attempt++) {
        try {
            const response = await this.helpers.request(requestOptions);
            return response;
        }
        catch (error) {
            const isLastAttempt = attempt === retryCount;
            const isRetryableError = isTransientError(error);
            if (isLastAttempt || !isRetryableError) {
                const errorMessage = getEnhancedErrorMessage(error, method, endpoint, environment);
                throw new n8n_workflow_1.NodeApiError(this.getNode(), errorMessage);
            }
            const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
            await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
    }
}
exports.docusealApiRequest = docusealApiRequest;
function isTransientError(error) {
    if (!error) {
        return false;
    }
    if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
        return true;
    }
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    if (error.statusCode && retryableStatusCodes.includes(error.statusCode)) {
        return true;
    }
    return false;
}
function getEnhancedErrorMessage(error, method, endpoint, environment) {
    const baseMessage = {
        method,
        endpoint,
        environment,
        timestamp: new Date().toISOString(),
    };
    if (error.statusCode) {
        switch (error.statusCode) {
            case 400:
                return {
                    ...baseMessage,
                    message: 'Bad Request - Invalid parameters',
                    description: `The request to ${endpoint} contains invalid parameters. Please check your input data.`,
                    httpCode: '400',
                    details: error.message || error.body,
                };
            case 401:
                return {
                    ...baseMessage,
                    message: 'Authentication failed',
                    description: `Invalid API key for ${environment} environment. Please verify your DocuSeal credentials.`,
                    httpCode: '401',
                    details: error.message || error.body,
                };
            case 403:
                return {
                    ...baseMessage,
                    message: 'Access forbidden',
                    description: `Insufficient permissions to access ${endpoint}. Please check your API key permissions.`,
                    httpCode: '403',
                    details: error.message || error.body,
                };
            case 404:
                return {
                    ...baseMessage,
                    message: 'Resource not found',
                    description: `The requested resource at ${endpoint} was not found. ` +
                        'Please verify the endpoint and resource ID.',
                    httpCode: '404',
                    details: error.message || error.body,
                };
            case 429:
                return {
                    ...baseMessage,
                    message: 'Rate limit exceeded',
                    description: 'Too many requests sent to DocuSeal API. Please wait before making additional requests.',
                    httpCode: '429',
                    details: error.message || error.body,
                };
            case 500:
                return {
                    ...baseMessage,
                    message: 'Internal server error',
                    description: 'DocuSeal API encountered an internal error. Please try again later.',
                    httpCode: '500',
                    details: error.message || error.body,
                };
            default:
                return {
                    ...baseMessage,
                    message: `HTTP ${error.statusCode} Error`,
                    description: `Request to ${endpoint} failed with status ${error.statusCode}`,
                    httpCode: error.statusCode.toString(),
                    details: error.message || error.body,
                };
        }
    }
    if (error.code) {
        switch (error.code) {
            case 'ECONNRESET':
                return {
                    ...baseMessage,
                    message: 'Connection reset',
                    description: 'The connection to DocuSeal API was reset. This is usually a temporary network issue.',
                    httpCode: 'NETWORK_ERROR',
                    details: error.message,
                };
            case 'ENOTFOUND':
                return {
                    ...baseMessage,
                    message: 'DNS resolution failed',
                    description: 'Could not resolve DocuSeal API hostname. Please check your internet connection.',
                    httpCode: 'NETWORK_ERROR',
                    details: error.message,
                };
            case 'ETIMEDOUT':
                return {
                    ...baseMessage,
                    message: 'Request timeout',
                    description: 'The request to DocuSeal API timed out. Please try again.',
                    httpCode: 'TIMEOUT',
                    details: error.message,
                };
            default:
                return {
                    ...baseMessage,
                    message: `Network error: ${error.code}`,
                    description: 'A network error occurred while connecting to DocuSeal API.',
                    httpCode: 'NETWORK_ERROR',
                    details: error.message,
                };
        }
    }
    return {
        ...baseMessage,
        message: 'Unknown error occurred',
        description: `An unexpected error occurred while making request to ${endpoint}`,
        httpCode: 'UNKNOWN',
        details: error.message || error.toString(),
    };
}
async function docusealApiRequestAllItems(method, endpoint, body = {}, query = {}, options = {}) {
    const returnData = [];
    let responseData;
    let nextCursor;
    let totalFetched = 0;
    const batchSize = options.batchSize ?? 100;
    const maxItems = options.maxItems ?? 10000;
    const memoryOptimized = options.memoryOptimized ?? false;
    query.limit = Math.min(batchSize, maxItems);
    do {
        if (totalFetched >= maxItems) {
            break;
        }
        if (totalFetched + batchSize > maxItems) {
            query.limit = maxItems - totalFetched;
        }
        if (nextCursor) {
            query.after = nextCursor;
        }
        try {
            responseData = await docusealApiRequest.call(this, method, endpoint, body, query);
        }
        catch (error) {
            if (error.httpCode === '429') {
                await new Promise((resolve) => setTimeout(resolve, 5000));
                continue;
            }
            throw error;
        }
        if (responseData && typeof responseData === 'object') {
            let currentBatch = [];
            if (responseData.data && Array.isArray(responseData.data)) {
                currentBatch = responseData.data;
                if (responseData.pagination?.next) {
                    nextCursor = responseData.pagination.next;
                }
                else {
                    nextCursor = undefined;
                }
            }
            else if (Array.isArray(responseData)) {
                currentBatch = responseData;
                if (responseData.length === query.limit) {
                    const lastItem = responseData[responseData.length - 1];
                    if (lastItem?.id) {
                        nextCursor = lastItem.id;
                    }
                    else {
                        nextCursor = undefined;
                    }
                }
                else {
                    nextCursor = undefined;
                }
            }
            else {
                break;
            }
            if (memoryOptimized && currentBatch.length > 0) {
                for (let j = 0; j < currentBatch.length; j += 50) {
                    const chunk = currentBatch.slice(j, j + 50);
                    returnData.push(...chunk);
                    if (j % 200 === 0) {
                        await new Promise((resolve) => setImmediate(resolve));
                    }
                }
            }
            else {
                returnData.push(...currentBatch);
            }
            totalFetched += currentBatch.length;
            if (totalFetched % 500 === 0) {
            }
        }
        else {
            break;
        }
    } while (nextCursor && totalFetched < maxItems);
    return returnData;
}
exports.docusealApiRequestAllItems = docusealApiRequestAllItems;
async function docusealApiBatchRequest(requests, options = {}) {
    const results = [];
    const batchSize = options.batchSize ?? 5;
    const delay = options.delayBetweenBatches ?? 100;
    for (let i = 0; i < requests.length; i += batchSize) {
        const batch = requests.slice(i, i + batchSize);
        const batchPromises = batch.map(async (request) => {
            try {
                return await docusealApiRequest.call(this, request.method, request.endpoint, request.body ?? {}, request.query ?? {});
            }
            catch (error) {
                return {
                    error: true,
                    message: error.message,
                    request,
                };
            }
        });
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        if (i + batchSize < requests.length) {
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
    return results;
}
exports.docusealApiBatchRequest = docusealApiBatchRequest;
async function docusealApiUploadOptimized(fileData, fileName, options = {}) {
    const chunkSize = options.chunkSize ?? 1024 * 1024;
    if (fileData.length <= chunkSize) {
        return await docusealApiRequest.call(this, 'POST', '/documents', {}, {}, {
            formData: {
                document: {
                    value: fileData,
                    options: {
                        filename: fileName,
                        contentType: 'application/octet-stream',
                    },
                },
            },
        });
    }
    return await docusealApiRequest.call(this, 'POST', '/documents', {}, {}, {
        formData: {
            document: {
                value: fileData,
                options: {
                    filename: fileName,
                    contentType: 'application/octet-stream',
                },
            },
        },
        timeout: 120000,
    });
}
exports.docusealApiUploadOptimized = docusealApiUploadOptimized;
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
        const rawResponse = await docusealApiRequest.call(this, 'GET', '/templates', {}, { limit: 100 });
        let templates;
        if (Array.isArray(rawResponse)) {
            templates = rawResponse;
        }
        else if (rawResponse && typeof rawResponse === 'object') {
            if (rawResponse.data && Array.isArray(rawResponse.data)) {
                templates = rawResponse.data;
            }
            else if (rawResponse.templates && Array.isArray(rawResponse.templates)) {
                templates = rawResponse.templates;
            }
            else if (rawResponse.results && Array.isArray(rawResponse.results)) {
                templates = rawResponse.results;
            }
            else {
                return [];
            }
        }
        else {
            return [];
        }
        if (templates.length === 0) {
            return [];
        }
        const options = templates.map((template) => {
            const option = {
                name: template.name || template.title || `Template ${template.id}`,
                value: String(template.id),
            };
            return option;
        });
        return options;
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
            filename: fileName ?? binaryData.fileName ?? 'file',
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
            if (additionalFields.name) {
                submitter.name = additionalFields.name;
            }
            if (additionalFields.phone) {
                submitter.phone = additionalFields.phone;
            }
            if (additionalFields.external_id) {
                submitter.external_id = additionalFields.external_id;
            }
            if (additionalFields.completed !== undefined) {
                submitter.completed = additionalFields.completed;
            }
            if (additionalFields.send_email !== undefined) {
                submitter.send_email = additionalFields.send_email;
            }
            if (additionalFields.send_sms !== undefined) {
                submitter.send_sms = additionalFields.send_sms;
            }
            if (additionalFields.metadata) {
                submitter.metadata = parseJsonInput(additionalFields.metadata);
            }
            if (additionalFields.fields) {
                submitter.fields = parseJsonInput(additionalFields.fields);
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
    if (!date) {
        return '';
    }
    const dateObj = new Date(date);
    return dateObj.toISOString();
}
exports.formatDate = formatDate;
//# sourceMappingURL=GenericFunctions.js.map