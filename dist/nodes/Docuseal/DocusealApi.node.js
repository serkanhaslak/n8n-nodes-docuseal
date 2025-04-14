"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocusealApi = void 0;
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
                description: 'Create documents, manage templates, and handle submissions with DocuSeal',
                icon: 'file:docuseal.svg',
                supportAiNode: true,
                schemaDefinition: {
                    type: 'object',
                    properties: {
                        resource: {
                            type: 'string',
                            description: 'Resource to operate on (template, submission, submitter)',
                            enum: ['template', 'submission', 'submitter']
                        },
                        operation: {
                            type: 'string',
                            description: 'Operation to perform on the resource',
                            enum: ['create', 'get', 'getList', 'update', 'delete']
                        },
                        submitters: {
                            type: 'array',
                            description: 'Array of submitters who will sign the document',
                            items: {
                                type: 'object',
                                properties: {
                                    email: {
                                        type: 'string',
                                        description: 'Email address of the submitter'
                                    },
                                    name: {
                                        type: 'string',
                                        description: 'Name of the submitter'
                                    },
                                    role: {
                                        type: 'string',
                                        description: 'Role of the submitter'
                                    }
                                }
                            }
                        },
                        fields: {
                            type: 'object',
                            description: 'JSON object with field values to pre-fill in the document',
                            additionalProperties: {
                                type: 'string'
                            }
                        },
                        templateId: {
                            type: 'integer',
                            description: 'ID of the template'
                        },
                        submissionId: {
                            type: 'integer',
                            description: 'ID of the submission'
                        },
                        submitterId: {
                            type: 'integer',
                            description: 'ID of the submitter'
                        }
                    },
                    required: ['resource', 'operation'],
                },
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
                                value: template.id || template.value,
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
                        const filters = this.getNodeParameter('filters', i, {});
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
                        const submittersInput = this.getNodeParameter('submitters', i);
                        const options = this.getNodeParameter('options', i, {});
                        const submitters = (0, GenericFunctions_1.parseJsonInput)(submittersInput);
                        const body = {
                            template_id: templateId,
                            submitters,
                        };
                        if (options.send_email !== undefined) {
                            body.send_email = options.send_email;
                        }
                        if (options.send_sms !== undefined) {
                            body.send_sms = options.send_sms;
                        }
                        if (options.fields) {
                            const fields = (0, GenericFunctions_1.parseJsonInput)(options.fields);
                            submitters.forEach((submitter) => {
                                submitter.values = fields;
                            });
                        }
                        responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'POST', '/submissions', body);
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
                        const filters = this.getNodeParameter('filters', i, {});
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
                        const updateFields = this.getNodeParameter('updateFields', i, {});
                        const body = {};
                        const simpleFields = [
                            'name', 'email', 'phone', 'external_id', 'completed',
                            'send_email', 'send_sms', 'reply_to', 'completed_redirect_url'
                        ];
                        for (const field of simpleFields) {
                            if (updateFields[field] !== undefined) {
                                body[field] = updateFields[field];
                            }
                        }
                        if (updateFields.values) {
                            body.values = (0, GenericFunctions_1.parseJsonInput)(updateFields.values);
                        }
                        if (updateFields.metadata) {
                            body.metadata = (0, GenericFunctions_1.parseJsonInput)(updateFields.metadata);
                        }
                        if (updateFields.message) {
                            body.message = (0, GenericFunctions_1.parseJsonInput)(updateFields.message);
                        }
                        if (updateFields.fields) {
                            body.fields = (0, GenericFunctions_1.parseJsonInput)(updateFields.fields);
                        }
                        responseData = await GenericFunctions_1.docusealApiRequest.call(this, 'PUT', `/submitters/${submitterId}`, body);
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