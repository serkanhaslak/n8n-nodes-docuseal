"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocusealApi = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const GenericFunctions_1 = require("./GenericFunctions");
const TemplateDescription_1 = require("./TemplateDescription");
const SubmissionDescription_1 = require("./SubmissionDescription");
const SubmitterDescription_1 = require("./SubmitterDescription");
class DocusealApi {
    constructor() {
        this.description = {
            displayName: 'DocuSeal',
            name: 'docusealApi',
            icon: 'file:docuseal.svg',
            group: ['transform'],
            version: 1,
            subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
            description: 'Create documents, manage templates, and handle submissions with DocuSeal',
            defaults: {
                name: 'DocuSeal',
            },
            inputs: ["main"],
            outputs: ["main"],
            usableAsTool: true,
            toolSpecification: {
                name: 'DocuSeal',
                displayName: 'DocuSeal',
                description: 'Create and manage document submissions and templates in DocuSeal',
                icon: 'file:docuseal.svg',
                supportAiNode: true,
                dynamicProperties: true,
                operations: [
                    {
                        name: 'Create Submission',
                        description: 'Create a new document submission in DocuSeal with signers, pre-filled fields, and preferences',
                        parameters: {
                            type: 'object',
                            required: ['templateId', 'submissionData'],
                            properties: {
                                templateId: {
                                    type: 'number',
                                    description: 'ID of the template to create a submission for. This is a required numeric identifier that references the specific document template in DocuSeal that will be used for this submission.'
                                },
                                submissionData: {
                                    type: 'string',
                                    description: 'Complete JSON data for the submission including submitters, fields, and preferences. Format as a JSON string with the following structure: {"Submitters": [{"email": "user@example.com", "name": "User Name", "role": "Role Name"}], "Fields": {"field1": "value1"}, "preferences": {"font_size": 12, "color": "blue"}, "completed_redirect_url": "https://example.com", "send_email": true}'
                                }
                            }
                        }
                    },
                    {
                        name: 'Get Submission',
                        description: 'Retrieve a specific submission by ID',
                        parameters: {
                            type: 'object',
                            required: ['submissionId'],
                            properties: {
                                submissionId: {
                                    type: 'number',
                                    description: 'The ID of the submission to retrieve'
                                }
                            }
                        }
                    },
                    {
                        name: 'Get Submissions List',
                        description: 'Retrieve a list of submissions with optional filtering',
                        parameters: {
                            type: 'object',
                            properties: {
                                limit: {
                                    type: 'number',
                                    description: 'Maximum number of results to return (default: 100)'
                                },
                                returnAll: {
                                    type: 'boolean',
                                    description: 'Whether to return all results or only up to the specified limit'
                                },
                                filterData: {
                                    type: 'string',
                                    description: 'JSON string with filter criteria: {"after": 123, "before": 456, "archived": false, "q": "search term", "status": "completed", "template_folder": "folder", "template_id": 789}'
                                }
                            }
                        }
                    },
                    {
                        name: 'Archive Submission',
                        description: 'Archive a submission by ID',
                        parameters: {
                            type: 'object',
                            required: ['submissionId'],
                            properties: {
                                submissionId: {
                                    type: 'number',
                                    description: 'The ID of the submission to archive'
                                }
                            }
                        }
                    }
                ]
            },
            credentials: [
                {
                    name: 'docusealApi',
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: 'Environment',
                    name: 'environment',
                    type: 'options',
                    default: 'production',
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
                    description: 'Choose between production and test environment',
                },
                {
                    displayName: 'Resource',
                    name: 'resource',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Submission',
                            value: 'submission',
                        },
                        {
                            name: 'Submitter',
                            value: 'submitter',
                        },
                        {
                            name: 'Template',
                            value: 'template',
                        },
                    ],
                    default: 'template',
                },
                ...TemplateDescription_1.templateOperations,
                ...TemplateDescription_1.templateFields,
                ...SubmissionDescription_1.submissionOperations,
                ...SubmissionDescription_1.submissionFields,
                ...SubmitterDescription_1.submitterOperations,
                ...SubmitterDescription_1.submitterFields,
            ],
        };
        this.methods = {
            loadOptions: {
                async getTemplates() {
                    try {
                        const returnData = [];
                        const templates = await GenericFunctions_1.getTemplates.call(this);
                        if (Array.isArray(templates)) {
                            return templates.map((template) => ({
                                name: template.name,
                                value: template.id || template.value || 0,
                            }));
                        }
                        return returnData;
                    }
                    catch (error) {
                        return [];
                    }
                },
            },
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        let responseData;
        const ensureProperFormat = (data) => {
            if (data === null || data === undefined) {
                return data;
            }
            if (typeof data === 'string') {
                try {
                    return JSON.parse(data);
                }
                catch (e) {
                    return data;
                }
            }
            if (Array.isArray(data)) {
                return data.map(item => ensureProperFormat(item));
            }
            if (typeof data === 'object') {
                const result = {};
                for (const key in data) {
                    result[key] = ensureProperFormat(data[key]);
                }
                return result;
            }
            return data;
        };
        for (let i = 0; i < items.length; i++) {
            try {
                const resource = this.getNodeParameter('resource', i);
                const operation = this.getNodeParameter('operation', i);
                if (resource === 'template') {
                    if (operation === 'get') {
                        const templateId = this.getNodeParameter('templateId', i);
                        responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'GET', `/templates/${templateId}`);
                    }
                    else if (operation === 'getList') {
                        const returnAll = this.getNodeParameter('returnAll', i);
                        const filters = this.getNodeParameter('filters', i, {});
                        if (returnAll) {
                            responseData = await GenericFunctions_1.docusealApiRequestAllItems.call(this, 'GET', '/templates', {}, filters);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            filters.limit = limit;
                            responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'GET', '/templates', {}, filters);
                        }
                    }
                }
                else if (resource === 'submission') {
                    if (operation === 'get') {
                        const submissionId = this.getNodeParameter('submissionId', i);
                        responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'GET', `/submissions/${submissionId}`);
                    }
                    else if (operation === 'getList') {
                        const returnAll = this.getNodeParameter('returnAll', i);
                        const after = this.getNodeParameter('after', i, 0);
                        const before = this.getNodeParameter('before', i, 0);
                        const archived = this.getNodeParameter('archived', i, false);
                        const searchQuery = this.getNodeParameter('q', i, '');
                        const status = this.getNodeParameter('status', i, '');
                        const templateFolder = this.getNodeParameter('template_folder', i, '');
                        const templateId = this.getNodeParameter('template_id', i, 0);
                        const filters = {};
                        if (after)
                            filters.after = after;
                        if (before)
                            filters.before = before;
                        if (archived)
                            filters.archived = archived;
                        if (searchQuery)
                            filters.q = searchQuery;
                        if (status)
                            filters.status = status;
                        if (templateFolder)
                            filters.template_folder = templateFolder;
                        if (templateId)
                            filters.template_id = templateId;
                        if (returnAll) {
                            responseData = await GenericFunctions_1.docusealApiRequestAllItems.call(this, 'GET', '/submissions', {}, filters);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            filters.limit = limit;
                            responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'GET', '/submissions', {}, filters);
                        }
                    }
                    else if (operation === 'create') {
                        const templateId = this.getNodeParameter('templateId', i);
                        let submitters = [];
                        let fields = {};
                        let preferences = {};
                        let completedRedirectUrl = '';
                        let expireAt = '';
                        let messageInput = {};
                        let order = '';
                        let sendEmail = true;
                        let sendSms = false;
                        let externalId = '';
                        let metadata = {};
                        let submitterTypes = {};
                        try {
                            const submissionDataParam = this.getNodeParameter('submissionData', i, '');
                            if (submissionDataParam) {
                                const submissionData = JSON.parse(submissionDataParam);
                                if (submissionData.Submitters)
                                    submitters = submissionData.Submitters;
                                if (submissionData.Fields)
                                    fields = submissionData.Fields;
                                if (submissionData.preferences)
                                    preferences = submissionData.preferences;
                                if (submissionData.completed_redirect_url)
                                    completedRedirectUrl = submissionData.completed_redirect_url;
                                if (submissionData.expire_at)
                                    expireAt = submissionData.expire_at;
                                if (submissionData.message)
                                    messageInput = submissionData.message;
                                if (submissionData.order)
                                    order = submissionData.order;
                                if (submissionData.send_email !== undefined)
                                    sendEmail = submissionData.send_email;
                                if (submissionData.send_sms !== undefined)
                                    sendSms = submissionData.send_sms;
                                if (submissionData.external_id)
                                    externalId = submissionData.external_id;
                                if (submissionData.metadata)
                                    metadata = submissionData.metadata;
                                if (submissionData.submitter_types)
                                    submitterTypes = submissionData.submitter_types;
                            }
                        }
                        catch (error) {
                            try {
                                const submittersInput = this.getNodeParameter('Submitters', i);
                                submitters = typeof submittersInput === 'string' ? JSON.parse(submittersInput) : submittersInput;
                            }
                            catch (error) {
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Submitters data is required for creating a submission', { itemIndex: i });
                            }
                            try {
                                const fieldsInput = this.getNodeParameter('Fields', i);
                                fields = typeof fieldsInput === 'string' ? JSON.parse(fieldsInput) : fieldsInput;
                            }
                            catch (error) {
                                fields = {};
                            }
                            try {
                                const preferencesInput = this.getNodeParameter('preferences', i);
                                preferences = typeof preferencesInput === 'string' ? JSON.parse(preferencesInput) : preferencesInput;
                            }
                            catch (error) {
                                preferences = {};
                            }
                            try {
                                completedRedirectUrl = this.getNodeParameter('completed_redirect_url', i);
                            }
                            catch (error) {
                            }
                            try {
                                expireAt = this.getNodeParameter('expire_at', i);
                            }
                            catch (error) {
                            }
                            try {
                                messageInput = this.getNodeParameter('message', i);
                            }
                            catch (error) {
                                messageInput = {};
                            }
                            try {
                                order = this.getNodeParameter('order', i);
                            }
                            catch (error) {
                            }
                            try {
                                sendEmail = this.getNodeParameter('send_email', i);
                            }
                            catch (error) {
                                sendEmail = true;
                            }
                            try {
                                sendSms = this.getNodeParameter('send_sms', i);
                            }
                            catch (error) {
                                sendSms = false;
                            }
                            try {
                                externalId = this.getNodeParameter('external_id', i);
                            }
                            catch (error) {
                            }
                            try {
                                metadata = this.getNodeParameter('metadata', i);
                            }
                            catch (error) {
                                metadata = {};
                            }
                            try {
                                submitterTypes = this.getNodeParameter('submitter_types', i);
                            }
                            catch (error) {
                                submitterTypes = {};
                            }
                        }
                        let message = {};
                        if (typeof messageInput === 'string') {
                            try {
                                message = JSON.parse(messageInput);
                            }
                            catch (error) {
                                message = { text: messageInput };
                            }
                        }
                        else {
                            message = messageInput;
                        }
                        const formattedSubmitters = ensureProperFormat(submitters);
                        const formattedFields = ensureProperFormat(fields);
                        const formattedPreferences = ensureProperFormat(preferences);
                        const formattedMessage = ensureProperFormat(message);
                        const formattedMetadata = ensureProperFormat(metadata);
                        const formattedSubmitterTypes = ensureProperFormat(submitterTypes);
                        this.logger.info(`DEBUG - Submitters data before formatting: ${JSON.stringify(submitters)}`);
                        this.logger.info(`DEBUG - Formatted submitters: ${JSON.stringify(formattedSubmitters)}`);
                        const body = {
                            template_id: templateId,
                        };
                        if (Array.isArray(formattedSubmitters) && formattedSubmitters.length > 0) {
                            for (const [index, submitter] of formattedSubmitters.entries()) {
                                if (typeof submitter !== 'object' || submitter === null ||
                                    !Object.prototype.hasOwnProperty.call(submitter, 'email') || typeof submitter.email !== 'string' || submitter.email.trim() === '' ||
                                    !Object.prototype.hasOwnProperty.call(submitter, 'role') || typeof submitter.role !== 'string' || submitter.role.trim() === '') {
                                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Invalid submitter at index ${index}: Each submitter must be an object with non-empty 'email' and 'role' string properties. Found: ${JSON.stringify(submitter)}`);
                                }
                            }
                            body.submitters = formattedSubmitters;
                        }
                        else {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Submitters parameter must be a valid array with at least one submitter object');
                        }
                        if (formattedFields && Object.keys(formattedFields).length > 0) {
                            body.values = formattedFields;
                        }
                        if (formattedPreferences && Object.keys(formattedPreferences).length > 0) {
                            body.preferences = formattedPreferences;
                        }
                        this.logger.info(`DEBUG - DocuSeal API Request Body: ${JSON.stringify(body, null, 2)}`);
                        if (completedRedirectUrl)
                            body.completed_redirect_url = completedRedirectUrl;
                        if (expireAt)
                            body.expire_at = expireAt;
                        if (Object.keys(formattedMessage).length > 0)
                            body.message = formattedMessage;
                        if (order)
                            body.order = order;
                        if (externalId)
                            body.external_id = externalId;
                        if (Object.keys(formattedMetadata).length > 0)
                            body.metadata = formattedMetadata;
                        if (Object.keys(formattedSubmitterTypes).length > 0)
                            body.submitter_types = formattedSubmitterTypes;
                        body.send_email = sendEmail;
                        body.send_sms = sendSms;
                        this.logger.info(`DEBUG - Final DocuSeal API Request Body: ${JSON.stringify(body, null, 2)}`);
                        try {
                            responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'POST', '/submissions', body);
                        }
                        catch (error) {
                            this.logger.error('Error creating submission:', error);
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Error creating submission: ${error.message}`);
                        }
                    }
                    else if (operation === 'archive') {
                        const submissionId = this.getNodeParameter('submissionId', i);
                        responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'DELETE', `/submissions/${submissionId}`);
                    }
                }
                else if (resource === 'submitter') {
                    if (operation === 'get') {
                        const submitterId = this.getNodeParameter('submitterId', i);
                        responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'GET', `/submitters/${submitterId}`);
                    }
                    else if (operation === 'getList') {
                        const returnAll = this.getNodeParameter('returnAll', i);
                        const after = this.getNodeParameter('after', i, 0);
                        const before = this.getNodeParameter('before', i, 0);
                        const completedAfter = this.getNodeParameter('completed_after', i, '');
                        const completedBefore = this.getNodeParameter('completed_before', i, '');
                        const externalId = this.getNodeParameter('external_id', i, '');
                        const searchQuery = this.getNodeParameter('q', i, '');
                        const submissionId = this.getNodeParameter('submission_id', i, 0);
                        const filters = {};
                        if (after)
                            filters.after = after;
                        if (before)
                            filters.before = before;
                        if (completedAfter)
                            filters.completed_after = completedAfter;
                        if (completedBefore)
                            filters.completed_before = completedBefore;
                        if (externalId)
                            filters.external_id = externalId;
                        if (searchQuery)
                            filters.q = searchQuery;
                        if (submissionId)
                            filters.submission_id = submissionId;
                        if (returnAll) {
                            responseData = await GenericFunctions_1.docusealApiRequestAllItems.call(this, 'GET', '/submitters', {}, filters);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            filters.limit = limit;
                            responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'GET', '/submitters', {}, filters);
                        }
                    }
                    else if (operation === 'update') {
                        const submitterId = this.getNodeParameter('submitterId', i);
                        let completed = false;
                        let completedRedirectUrl = '';
                        let email = '';
                        let externalId = '';
                        let fieldsInput = {};
                        let messageInput = {};
                        let name = '';
                        let phone = '';
                        let role = '';
                        let sendEmail = false;
                        let sendSms = false;
                        let valuesInput = {};
                        try {
                            completed = this.getNodeParameter('completed', i);
                        }
                        catch (error) {
                        }
                        try {
                            completedRedirectUrl = this.getNodeParameter('completed_redirect_url', i);
                        }
                        catch (error) {
                        }
                        try {
                            email = this.getNodeParameter('email', i);
                        }
                        catch (error) {
                        }
                        try {
                            externalId = this.getNodeParameter('external_id', i);
                        }
                        catch (error) {
                        }
                        try {
                            fieldsInput = this.getNodeParameter('fields', i);
                        }
                        catch (error) {
                            fieldsInput = {};
                        }
                        try {
                            messageInput = this.getNodeParameter('message', i);
                        }
                        catch (error) {
                            messageInput = {};
                        }
                        try {
                            name = this.getNodeParameter('name', i);
                        }
                        catch (error) {
                        }
                        try {
                            phone = this.getNodeParameter('phone', i);
                        }
                        catch (error) {
                        }
                        try {
                            role = this.getNodeParameter('role', i);
                        }
                        catch (error) {
                        }
                        try {
                            sendEmail = this.getNodeParameter('send_email', i);
                        }
                        catch (error) {
                        }
                        try {
                            sendSms = this.getNodeParameter('send_sms', i);
                        }
                        catch (error) {
                        }
                        try {
                            valuesInput = this.getNodeParameter('values', i);
                        }
                        catch (error) {
                            valuesInput = {};
                        }
                        const fields = ensureProperFormat(fieldsInput);
                        const message = ensureProperFormat(messageInput);
                        const values = ensureProperFormat(valuesInput);
                        const body = {};
                        if (completed !== undefined)
                            body.completed = completed;
                        if (completedRedirectUrl)
                            body.completed_redirect_url = completedRedirectUrl;
                        if (email)
                            body.email = email;
                        if (externalId)
                            body.external_id = externalId;
                        if (fields && Array.isArray(fields) && fields.length > 0)
                            body.fields = fields;
                        if (message && Object.keys(message).length > 0)
                            body.message = message;
                        if (name)
                            body.name = name;
                        if (phone)
                            body.phone = phone;
                        if (role)
                            body.role = role;
                        if (sendEmail !== undefined)
                            body.send_email = sendEmail;
                        if (sendSms !== undefined)
                            body.send_sms = sendSms;
                        if (values && Object.keys(values).length > 0)
                            body.values = values;
                        this.logger.info(`DEBUG - DocuSeal API Request Body: ${JSON.stringify(body, null, 2)}`);
                        responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'PATCH', `/submitters/${submitterId}`, body);
                    }
                }
                const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(responseData), { itemData: { item: i } });
                returnData.push(...executionData);
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: error.message } });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.DocusealApi = DocusealApi;
//# sourceMappingURL=DocusealApi.node.js.map