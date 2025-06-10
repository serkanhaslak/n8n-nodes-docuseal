"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocusealApi = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const GenericFunctions_1 = require("./GenericFunctions");
const TemplateDescription_1 = require("./TemplateDescription");
const SubmissionDescription_1 = require("./SubmissionDescription");
const SubmitterDescription_1 = require("./SubmitterDescription");
const FormDescription_1 = require("./FormDescription");
class DocusealApi {
    constructor() {
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
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
                inputs: [{ type: 'main' }],
                outputs: [{ type: 'main' }],
                usableAsTool: true,
                credentials: [
                    {
                        name: 'docusealApi',
                        required: true,
                    },
                ],
                properties: [
                    {
                        displayName: 'Resource',
                        name: 'resource',
                        type: 'options',
                        noDataExpression: true,
                        options: [
                            {
                                name: 'Form',
                                value: 'form',
                                description: 'Work with form events',
                            },
                            {
                                name: 'Submission',
                                value: 'submission',
                                description: 'Create and manage document submissions',
                            },
                            {
                                name: 'Submitter',
                                value: 'submitter',
                                description: 'Manage submitters and their data',
                            },
                            {
                                name: 'Template',
                                value: 'template',
                                description: 'Create and manage document templates',
                            },
                        ],
                        default: 'submission',
                    },
                    ...TemplateDescription_1.templateOperations,
                    ...TemplateDescription_1.templateFields,
                    ...SubmissionDescription_1.submissionOperations,
                    ...SubmissionDescription_1.submissionFields,
                    ...SubmitterDescription_1.submitterOperations,
                    ...SubmitterDescription_1.submitterFields,
                    ...FormDescription_1.formOperations,
                    ...FormDescription_1.formFields,
                ],
            }
        });
        Object.defineProperty(this, "methods", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                loadOptions: {
                    async getTemplates() {
                        try {
                            return await GenericFunctions_1.getTemplates.call(this);
                        }
                        catch (error) {
                            return [];
                        }
                    },
                },
            }
        });
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        let responseData;
        for (let i = 0; i < items.length; i++) {
            try {
                const resource = this.getNodeParameter('resource', i);
                const operation = this.getNodeParameter('operation', i);
                if (resource === 'template') {
                    if (operation === 'get') {
                        const templateId = this.getNodeParameter('templateId', i);
                        responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'GET', `/templates/${templateId}`);
                    }
                    else if (operation === 'getMany') {
                        const filters = this.getNodeParameter('filters', i, {});
                        const limit = this.getNodeParameter('limit', i);
                        filters.limit = limit;
                        try {
                            responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'GET', '/templates', {}, filters);
                            if (responseData && typeof responseData === 'object' && 'data' in responseData && Array.isArray(responseData.data)) {
                                responseData = responseData.data;
                            }
                            else if (!Array.isArray(responseData)) {
                                console.warn('Unexpected DocuSeal API response format:', responseData);
                                responseData = [];
                            }
                            if (!Array.isArray(responseData)) {
                                responseData = [];
                            }
                        }
                        catch (error) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Failed to retrieve templates: ${error.message}`, { itemIndex: i });
                        }
                    }
                    else if (operation === 'createFromPdf') {
                        const name = this.getNodeParameter('name', i);
                        const pdfSource = this.getNodeParameter('pdfSource', i);
                        const additionalFields = this.getNodeParameter('additionalFields', i, {});
                        const formData = {
                            name,
                        };
                        if (pdfSource === 'binary') {
                            const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i);
                            const binaryData = await GenericFunctions_1.prepareBinaryData.call(this, binaryPropertyName, i);
                            formData.document = binaryData;
                        }
                        else {
                            const fileUrl = this.getNodeParameter('fileUrl', i);
                            const urlValidation = (0, GenericFunctions_1.validateUrl)(fileUrl);
                            if (!urlValidation.isValid) {
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Invalid file URL: ${urlValidation.message}`, {
                                    itemIndex: i,
                                });
                            }
                            formData.document_url = fileUrl;
                        }
                        if (additionalFields.external_id) {
                            formData.external_id = additionalFields.external_id;
                        }
                        if (additionalFields.folder_name) {
                            formData.folder_name = additionalFields.folder_name;
                        }
                        if (additionalFields.fields) {
                            const fieldsData = additionalFields.fields;
                            if (fieldsData.field) {
                                formData.fields = fieldsData.field;
                            }
                        }
                        responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'POST', '/templates/pdf', {}, {}, { formData });
                    }
                    else if (operation === 'createFromDocx') {
                        const name = this.getNodeParameter('name', i);
                        const docxSource = this.getNodeParameter('docxSource', i);
                        const additionalFields = this.getNodeParameter('additionalFields', i, {});
                        const formData = {
                            name,
                        };
                        if (docxSource === 'binary') {
                            const binaryPropertyName = this.getNodeParameter('binaryPropertyNameDocx', i);
                            const binaryData = await GenericFunctions_1.prepareBinaryData.call(this, binaryPropertyName, i);
                            formData.document = binaryData;
                        }
                        else {
                            const fileUrl = this.getNodeParameter('fileUrlDocx', i);
                            const urlValidation = (0, GenericFunctions_1.validateUrl)(fileUrl);
                            if (!urlValidation.isValid) {
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Invalid file URL: ${urlValidation.message}`, {
                                    itemIndex: i,
                                });
                            }
                            formData.document_url = fileUrl;
                        }
                        if (additionalFields.external_id) {
                            formData.external_id = additionalFields.external_id;
                        }
                        if (additionalFields.folder_name) {
                            formData.folder_name = additionalFields.folder_name;
                        }
                        if (additionalFields.fields) {
                            const fieldsData = additionalFields.fields;
                            if (fieldsData.field) {
                                formData.fields = fieldsData.field;
                            }
                        }
                        responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'POST', '/templates/docx', {}, {}, { formData });
                    }
                    else if (operation === 'createFromHtml') {
                        const name = this.getNodeParameter('name', i);
                        const htmlContent = this.getNodeParameter('htmlContent', i);
                        const additionalFields = this.getNodeParameter('additionalFields', i, {});
                        const body = {
                            name,
                            html: htmlContent,
                        };
                        if (additionalFields.external_id) {
                            body.external_id = additionalFields.external_id;
                        }
                        if (additionalFields.folder_name) {
                            body.folder_name = additionalFields.folder_name;
                        }
                        if (additionalFields.fields) {
                            const fieldsData = additionalFields.fields;
                            if (fieldsData.field) {
                                body.fields = fieldsData.field;
                            }
                        }
                        responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'POST', '/templates/html', body);
                    }
                    else if (operation === 'clone') {
                        const templateId = this.getNodeParameter('templateId', i);
                        const name = this.getNodeParameter('name', i);
                        const additionalFields = this.getNodeParameter('additionalFields', i, {});
                        const body = {
                            name,
                        };
                        if (additionalFields.external_id) {
                            body.external_id = additionalFields.external_id;
                        }
                        if (additionalFields.folder_name) {
                            body.folder_name = additionalFields.folder_name;
                        }
                        responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'POST', `/templates/${templateId}/clone`, body);
                    }
                    else if (operation === 'merge') {
                        const templateIds = this.getNodeParameter('templateIds', i)
                            .split(',')
                            .map((id) => parseInt(id.trim()))
                            .filter((id) => !isNaN(id));
                        const name = this.getNodeParameter('mergedName', i);
                        const body = {
                            template_ids: templateIds,
                            name,
                        };
                        responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'POST', '/templates/merge', body);
                    }
                    else if (operation === 'update') {
                        const templateId = this.getNodeParameter('templateId', i);
                        const updateFields = this.getNodeParameter('updateFields', i, {});
                        if (Object.keys(updateFields).length === 0) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'At least one field must be updated', {
                                itemIndex: i,
                            });
                        }
                        responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'PUT', `/templates/${templateId}`, updateFields);
                    }
                    else if (operation === 'updateDocuments') {
                        const templateId = this.getNodeParameter('templateId', i);
                        const documentsSource = this.getNodeParameter('documentsSource', i);
                        const formData = {};
                        if (documentsSource === 'binary') {
                            const binaryProperties = this.getNodeParameter('binaryProperties', i)
                                .split(',')
                                .map((prop) => prop.trim());
                            for (const [index, propertyName] of binaryProperties.entries()) {
                                const binaryData = await GenericFunctions_1.prepareBinaryData.call(this, propertyName, i);
                                formData[`documents[${index}]`] = binaryData;
                            }
                        }
                        else {
                            const fileUrls = this.getNodeParameter('fileUrls', i)
                                .split(',')
                                .map((url) => url.trim())
                                .filter((url) => url.length > 0);
                            for (const url of fileUrls) {
                                const urlValidation = (0, GenericFunctions_1.validateUrl)(url);
                                if (!urlValidation.isValid) {
                                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Invalid file URL '${url}': ${urlValidation.message}`, {
                                        itemIndex: i,
                                    });
                                }
                            }
                            fileUrls.forEach((url, index) => {
                                formData[`document_urls[${index}]`] = url;
                            });
                        }
                        responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'PUT', `/templates/${templateId}/documents`, {}, {}, { formData });
                    }
                    else if (operation === 'archive') {
                        const templateId = this.getNodeParameter('templateId', i);
                        responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'DELETE', `/templates/${templateId}`);
                    }
                }
                else if (resource === 'submission') {
                    if (operation === 'get') {
                        const submissionId = this.getNodeParameter('submissionId', i);
                        responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'GET', `/submissions/${submissionId}`);
                    }
                    else if (operation === 'getDocuments') {
                        const submissionId = this.getNodeParameter('submissionId', i);
                        responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'GET', `/submissions/${submissionId}/documents`);
                    }
                    else if (operation === 'getMany') {
                        const filters = this.getNodeParameter('filters', i, {});
                        if (filters.status && Array.isArray(filters.status)) {
                            filters.status = filters.status.join(',');
                        }
                        const limit = this.getNodeParameter('limit', i);
                        filters.limit = limit;
                        try {
                            responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'GET', '/submissions', {}, filters);
                            if (responseData && typeof responseData === 'object' && 'data' in responseData && Array.isArray(responseData.data)) {
                                responseData = responseData.data;
                            }
                            else if (!Array.isArray(responseData)) {
                                responseData = [];
                            }
                        }
                        catch (error) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Failed to retrieve submissions: ${error.message}`, { itemIndex: i });
                        }
                    }
                    else if (operation === 'create') {
                        const templateId = this.getNodeParameter('templateId', i);
                        const submittersData = this.getNodeParameter('submitters', i);
                        const additionalOptions = this.getNodeParameter('additionalOptions', i, {});
                        const submitters = (0, GenericFunctions_1.buildSubmittersArray)(submittersData);
                        if (submitters.length === 0) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'At least one submitter is required', {
                                itemIndex: i,
                            });
                        }
                        const values = (0, GenericFunctions_1.buildFieldValues)(this.getNodeParameter('', 0));
                        const body = {
                            template_id: templateId,
                            submitters,
                        };
                        if (Object.keys(values).length > 0) {
                            body.values = values;
                        }
                        const preferences = {};
                        if (additionalOptions.bcc_completed) {
                            preferences.bcc_completed = additionalOptions.bcc_completed;
                        }
                        if (additionalOptions.reply_to) {
                            preferences.reply_to = additionalOptions.reply_to;
                        }
                        if (Object.keys(preferences).length > 0) {
                            body.preferences = preferences;
                        }
                        if (additionalOptions.completed_redirect_url) {
                            body.completed_redirect_url = additionalOptions.completed_redirect_url;
                        }
                        if (additionalOptions.expire_at) {
                            body.expire_at = (0, GenericFunctions_1.formatDate)(additionalOptions.expire_at);
                        }
                        if (additionalOptions.external_id) {
                            body.external_id = additionalOptions.external_id;
                        }
                        if (additionalOptions.message) {
                            const messageData = additionalOptions.message;
                            if (messageData.messageFields) {
                                body.message = messageData.messageFields;
                            }
                        }
                        if (additionalOptions.metadata) {
                            body.metadata = (0, GenericFunctions_1.parseJsonInput)(additionalOptions.metadata);
                        }
                        if (additionalOptions.order) {
                            body.order = additionalOptions.order;
                        }
                        if (additionalOptions.send_email !== undefined) {
                            body.send_email = additionalOptions.send_email;
                        }
                        if (additionalOptions.send_sms !== undefined) {
                            body.send_sms = additionalOptions.send_sms;
                        }
                        responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'POST', '/submissions', body);
                    }
                    else if (operation === 'createFromPdf') {
                        const pdfSource = this.getNodeParameter('pdfSource', i);
                        const submittersData = this.getNodeParameter('submitters', i);
                        const additionalOptions = this.getNodeParameter('additionalOptions', i, {});
                        const submitters = (0, GenericFunctions_1.buildSubmittersArray)(submittersData);
                        if (submitters.length === 0) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'At least one submitter is required', {
                                itemIndex: i,
                            });
                        }
                        const formData = {
                            submitters: JSON.stringify(submitters),
                        };
                        if (pdfSource === 'binary') {
                            const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i);
                            const binaryData = await GenericFunctions_1.prepareBinaryData.call(this, binaryPropertyName, i);
                            formData.document = binaryData;
                        }
                        else {
                            const fileUrl = this.getNodeParameter('fileUrl', i);
                            const urlValidation = (0, GenericFunctions_1.validateUrl)(fileUrl);
                            if (!urlValidation.isValid) {
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Invalid file URL: ${urlValidation.message}`, {
                                    itemIndex: i,
                                });
                            }
                            formData.document_url = fileUrl;
                        }
                        if (additionalOptions.external_id) {
                            formData.external_id = additionalOptions.external_id;
                        }
                        if (additionalOptions.send_email !== undefined &&
                            additionalOptions.send_email !== null) {
                            formData.send_email = additionalOptions.send_email.toString();
                        }
                        responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'POST', '/submissions/pdf', {}, {}, { formData });
                    }
                    else if (operation === 'createFromHtml') {
                        const htmlContent = this.getNodeParameter('htmlContent', i);
                        const submittersData = this.getNodeParameter('submitters', i);
                        const additionalOptions = this.getNodeParameter('additionalOptions', i, {});
                        const submitters = (0, GenericFunctions_1.buildSubmittersArray)(submittersData);
                        if (submitters.length === 0) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'At least one submitter is required', {
                                itemIndex: i,
                            });
                        }
                        const body = {
                            html: htmlContent,
                            submitters,
                        };
                        if (additionalOptions.external_id) {
                            body.external_id = additionalOptions.external_id;
                        }
                        if (additionalOptions.send_email !== undefined) {
                            body.send_email = additionalOptions.send_email;
                        }
                        responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'POST', '/submissions/html', body);
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
                    else if (operation === 'getMany') {
                        const filters = this.getNodeParameter('filters', i, {});
                        if (filters.completed_after) {
                            filters.completed_after = (0, GenericFunctions_1.formatDate)(filters.completed_after);
                        }
                        if (filters.completed_before) {
                            filters.completed_before = (0, GenericFunctions_1.formatDate)(filters.completed_before);
                        }
                        const limit = this.getNodeParameter('limit', i);
                        filters.limit = limit;
                        try {
                            responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'GET', '/submitters', {}, filters);
                            if (responseData && typeof responseData === 'object' && 'data' in responseData && Array.isArray(responseData.data)) {
                                responseData = responseData.data;
                            }
                            else if (!Array.isArray(responseData)) {
                                responseData = [];
                            }
                        }
                        catch (error) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Failed to retrieve submitters: ${error.message}`, { itemIndex: i });
                        }
                    }
                    else if (operation === 'update') {
                        const submitterId = this.getNodeParameter('submitterId', i);
                        const updateFields = this.getNodeParameter('updateFields', i, {});
                        const fieldsData = this.getNodeParameter('fields', i, {});
                        const valuesData = this.getNodeParameter('values', i, {});
                        const body = {};
                        Object.assign(body, updateFields);
                        if (body.message && typeof body.message === 'object') {
                            const messageData = body.message;
                            if (messageData.messageFields) {
                                body.message = messageData.messageFields;
                            }
                        }
                        if (fieldsData.field) {
                            body.fields = fieldsData.field;
                        }
                        if (valuesData.value) {
                            const values = {};
                            const valueItems = Array.isArray(valuesData.value)
                                ? valuesData.value
                                : [valuesData.value];
                            valueItems.forEach((item) => {
                                if (item.name && item.value !== undefined) {
                                    values[item.name] = item.value;
                                }
                            });
                            body.values = values;
                        }
                        if (Object.keys(body).length === 0) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'At least one field must be updated', {
                                itemIndex: i,
                            });
                        }
                        responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'PUT', `/submitters/${submitterId}`, body);
                    }
                }
                else if (resource === 'form') {
                    const submitterId = this.getNodeParameter('submitterId', i);
                    if (operation === 'getStarted') {
                        responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'GET', `/submitters/${submitterId}/form_started`);
                    }
                    else if (operation === 'getViewed') {
                        responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'GET', `/submitters/${submitterId}/form_viewed`);
                    }
                }
                const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(responseData), { itemData: { item: i } });
                returnData.push(...executionData);
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: { error: error instanceof Error ? error.message : String(error) },
                    });
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