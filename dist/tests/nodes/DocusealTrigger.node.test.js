"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DocusealTrigger_node_1 = require("../../nodes/Docuseal/DocusealTrigger.node");
describe('DocusealTrigger.node', () => {
    let docusealTrigger;
    beforeEach(() => {
        docusealTrigger = new DocusealTrigger_node_1.DocusealTrigger();
        jest.clearAllMocks();
    });
    describe('Node Properties', () => {
        it('should have correct basic properties', () => {
            expect(docusealTrigger.description.displayName).toBe('DocuSeal Trigger');
            expect(docusealTrigger.description.name).toBe('docusealTrigger');
            expect(docusealTrigger.description.group).toEqual(['trigger']);
            expect(docusealTrigger.description.version).toBe(1);
            expect(docusealTrigger.description.description).toBe('Handle DocuSeal webhook events');
        });
        it('should have correct input/output configuration', () => {
            expect(docusealTrigger.description.inputs).toEqual([]);
            expect(docusealTrigger.description.outputs).toEqual([{ type: 'main' }]);
        });
        it('should use DocuSeal API credentials', () => {
            expect(docusealTrigger.description.credentials).toEqual([
                {
                    name: 'docusealApi',
                    required: true,
                },
            ]);
        });
        it('should have webhook properties', () => {
            expect(docusealTrigger.description.webhooks).toBeDefined();
            expect(docusealTrigger.description.webhooks).toHaveLength(2);
            const webhooks = docusealTrigger.description.webhooks ?? [];
            expect(webhooks[0]?.name).toBe('default');
            expect(webhooks[0]?.httpMethod).toBe('POST');
            expect(webhooks[1]?.name).toBe('setup');
            expect(webhooks[1]?.httpMethod).toBe('GET');
        });
        it('should have correct properties structure', () => {
            expect(docusealTrigger.description.properties).toBeDefined();
            expect(Array.isArray(docusealTrigger.description.properties)).toBe(true);
            const eventTypeProperty = docusealTrigger.description.properties.find((prop) => prop.name === 'eventType');
            expect(eventTypeProperty).toBeDefined();
            if (eventTypeProperty) {
                expect(eventTypeProperty.type).toBe('options');
                expect(eventTypeProperty.required).toBe(true);
            }
        });
    });
    describe('Webhook Methods', () => {
        it('should have webhook method', () => {
            expect(typeof docusealTrigger.webhook).toBe('function');
        });
        it('should have webhookMethods', () => {
            expect(docusealTrigger.webhookMethods).toBeDefined();
            expect(docusealTrigger.webhookMethods.default).toBeDefined();
            expect(docusealTrigger.webhookMethods.setup).toBeDefined();
        });
        describe('Default Webhook Methods', () => {
            let mockHookFunctions;
            beforeEach(() => {
                mockHookFunctions = {
                    getNodeWebhookUrl: jest.fn().mockReturnValue('https://webhook.example.com/webhook'),
                    getNodeParameter: jest.fn().mockReturnValue('all'),
                    logger: {
                        info: jest.fn(),
                        error: jest.fn(),
                        warn: jest.fn(),
                        debug: jest.fn(),
                        verbose: jest.fn(),
                    },
                };
            });
            it('should not check webhook existence', async () => {
                const result = await docusealTrigger.webhookMethods.default.checkExists.call(mockHookFunctions);
                expect(result).toBe(false);
            });
            it('should create webhook with instructions', async () => {
                const result = await docusealTrigger.webhookMethods.default.create.call(mockHookFunctions);
                expect(result).toBe(true);
                expect(mockHookFunctions.getNodeWebhookUrl).toHaveBeenCalledWith('default');
                expect(mockHookFunctions.getNodeParameter).toHaveBeenCalledWith('eventType');
                expect(mockHookFunctions.logger?.info).toHaveBeenCalledWith(expect.stringContaining('DocuSeal Webhook Setup'));
            });
            it('should create webhook with specific event type instructions', async () => {
                mockHookFunctions.getNodeParameter.mockReturnValue('submission.completed');
                const result = await docusealTrigger.webhookMethods.default.create.call(mockHookFunctions);
                expect(result).toBe(true);
                expect(mockHookFunctions.logger?.info).toHaveBeenCalledWith(expect.stringContaining('submission.completed'));
            });
            it('should delete webhook with instructions', async () => {
                const result = await docusealTrigger.webhookMethods.default.delete.call(mockHookFunctions);
                expect(result).toBe(true);
                expect(mockHookFunctions.getNodeWebhookUrl).toHaveBeenCalledWith('default');
                expect(mockHookFunctions.logger?.info).toHaveBeenCalledWith(expect.stringContaining('Please delete the webhook'));
            });
        });
        describe('Setup Webhook Methods', () => {
            let mockHookFunctions;
            beforeEach(() => {
                mockHookFunctions = {};
            });
            it('should not check setup webhook existence', async () => {
                const result = await docusealTrigger.webhookMethods.setup.checkExists.call(mockHookFunctions);
                expect(result).toBe(false);
            });
            it('should create setup webhook', async () => {
                const result = await docusealTrigger.webhookMethods.setup.create.call(mockHookFunctions);
                expect(result).toBe(true);
            });
            it('should delete setup webhook', async () => {
                const result = await docusealTrigger.webhookMethods.setup.delete.call(mockHookFunctions);
                expect(result).toBe(true);
            });
        });
        it('should process webhook data correctly', async () => {
            const mockWebhookFunctions = {
                getWebhookName: jest.fn().mockReturnValue('default'),
                getBodyData: jest.fn().mockReturnValue({
                    event: 'submission.completed',
                    submission_id: 123,
                    data: {
                        id: 123,
                        status: 'completed',
                    },
                }),
                getNodeParameter: jest.fn().mockImplementation((param) => {
                    if (param === 'eventType') {
                        return 'all';
                    }
                    if (param === 'additionalFields') {
                        return {};
                    }
                    return null;
                }),
                helpers: {
                    returnJsonArray: jest
                        .fn()
                        .mockImplementation((data) => (Array.isArray(data) ? data : [data])),
                },
            };
            const result = await docusealTrigger.webhook.call(mockWebhookFunctions);
            expect(result).toBeDefined();
            expect(result.workflowData).toBeDefined();
            expect(mockWebhookFunctions.getBodyData).toHaveBeenCalled();
        });
        it('should handle setup webhook', async () => {
            const mockWebhookFunctions = {
                getWebhookName: jest.fn().mockReturnValue('setup'),
                getBodyData: jest.fn().mockReturnValue({}),
                getNodeParameter: jest.fn().mockReturnValue('all'),
                helpers: {
                    returnJsonArray: jest
                        .fn()
                        .mockImplementation((data) => (Array.isArray(data) ? data : [data])),
                },
            };
            const result = await docusealTrigger.webhook.call(mockWebhookFunctions);
            expect(result).toBeDefined();
            expect(result.webhookResponse).toBe('Webhook setup successful');
        });
        it('should filter events based on event type', async () => {
            const mockWebhookFunctions = {
                getWebhookName: jest.fn().mockReturnValue('default'),
                getBodyData: jest.fn().mockReturnValue({
                    event: 'submission.created',
                    submission_id: 123,
                }),
                getNodeParameter: jest.fn().mockImplementation((param) => {
                    if (param === 'eventType') {
                        return 'submission.completed';
                    }
                    if (param === 'additionalFields') {
                        return {};
                    }
                    return null;
                }),
            };
            const result = await docusealTrigger.webhook.call(mockWebhookFunctions);
            expect(result).toBeDefined();
            expect(result.noWebhookResponse).toBe(true);
        });
        it('should fetch additional submission data when requested', async () => {
            const mockSubmissionData = { id: 123, status: 'completed', submitters: [] };
            const mockWebhookFunctions = {
                getWebhookName: jest.fn().mockReturnValue('default'),
                getBodyData: jest.fn().mockReturnValue({
                    event: 'submission.completed',
                    submission_id: 123,
                }),
                getNodeParameter: jest.fn().mockImplementation((param, _defaultValue) => {
                    if (param === 'eventType') {
                        return 'all';
                    }
                    if (param === 'additionalFields') {
                        return { includeSubmissionData: true };
                    }
                    if (param === 'environment') {
                        return _defaultValue || 'production';
                    }
                    return null;
                }),
                getCredentials: jest.fn().mockResolvedValue({
                    productionApiKey: 'prod-key',
                    testApiKey: 'test-key',
                    baseUrl: 'https://api.docuseal.com',
                }),
                helpers: {
                    request: jest.fn().mockResolvedValue(mockSubmissionData),
                    returnJsonArray: jest
                        .fn()
                        .mockImplementation((data) => (Array.isArray(data) ? data : [data])),
                },
                logger: {
                    error: jest.fn(),
                },
            };
            const result = await docusealTrigger.webhook.call(mockWebhookFunctions);
            expect(result.workflowData).toBeDefined();
            expect(mockWebhookFunctions.getCredentials).toHaveBeenCalledWith('docusealApi');
            expect(mockWebhookFunctions.helpers.request).toHaveBeenCalledWith({
                method: 'GET',
                uri: 'https://api.docuseal.com/submissions/123',
                headers: {
                    'X-Auth-Token': 'prod-key',
                },
                json: true,
            });
        });
        it('should use test API key for test environment', async () => {
            const mockSubmissionData = { id: 123, status: 'completed' };
            const mockWebhookFunctions = {
                getWebhookName: jest.fn().mockReturnValue('default'),
                getBodyData: jest.fn().mockReturnValue({
                    event: 'submission.completed',
                    submission_id: 123,
                }),
                getNodeParameter: jest.fn().mockImplementation((param, _defaultValue) => {
                    if (param === 'eventType') {
                        return 'all';
                    }
                    if (param === 'additionalFields') {
                        return { includeSubmissionData: true };
                    }
                    if (param === 'environment') {
                        return 'test';
                    }
                    return null;
                }),
                getCredentials: jest.fn().mockResolvedValue({
                    productionApiKey: 'prod-key',
                    testApiKey: 'test-key',
                    baseUrl: 'https://api.docuseal.com',
                }),
                helpers: {
                    request: jest.fn().mockResolvedValue(mockSubmissionData),
                    returnJsonArray: jest
                        .fn()
                        .mockImplementation((data) => (Array.isArray(data) ? data : [data])),
                },
                logger: {
                    error: jest.fn(),
                },
            };
            void (await docusealTrigger.webhook.call(mockWebhookFunctions));
            expect(mockWebhookFunctions.helpers.request).toHaveBeenCalledWith(expect.objectContaining({
                headers: {
                    'X-Auth-Token': 'test-key',
                },
            }));
        });
        it('should handle API request errors gracefully', async () => {
            const mockWebhookFunctions = {
                getWebhookName: jest.fn().mockReturnValue('default'),
                getBodyData: jest.fn().mockReturnValue({
                    event: 'submission.completed',
                    submission_id: 123,
                }),
                getNodeParameter: jest.fn().mockImplementation((param, _defaultValue) => {
                    if (param === 'eventType') {
                        return 'all';
                    }
                    if (param === 'additionalFields') {
                        return { includeSubmissionData: true };
                    }
                    if (param === 'environment') {
                        return _defaultValue || 'production';
                    }
                    return null;
                }),
                getCredentials: jest.fn().mockResolvedValue({
                    productionApiKey: 'prod-key',
                    testApiKey: 'test-key',
                    baseUrl: 'https://api.docuseal.com',
                }),
                helpers: {
                    request: jest.fn().mockRejectedValue(new Error('API Error')),
                    returnJsonArray: jest
                        .fn()
                        .mockImplementation((data) => (Array.isArray(data) ? data : [data])),
                },
                logger: {
                    error: jest.fn(),
                },
            };
            const result = await docusealTrigger.webhook.call(mockWebhookFunctions);
            expect(result.workflowData).toBeDefined();
            expect(mockWebhookFunctions.logger.error).toHaveBeenCalledWith('Failed to fetch submission details', expect.objectContaining({ error: expect.any(Error) }));
        });
        it('should use default base URL when not provided', async () => {
            const mockSubmissionData = { id: 123, status: 'completed' };
            const mockWebhookFunctions = {
                getWebhookName: jest.fn().mockReturnValue('default'),
                getBodyData: jest.fn().mockReturnValue({
                    event: 'submission.completed',
                    submission_id: 123,
                }),
                getNodeParameter: jest.fn().mockImplementation((param, _defaultValue) => {
                    if (param === 'eventType') {
                        return 'all';
                    }
                    if (param === 'additionalFields') {
                        return { includeSubmissionData: true };
                    }
                    if (param === 'environment') {
                        return _defaultValue || 'production';
                    }
                    return null;
                }),
                getCredentials: jest.fn().mockResolvedValue({
                    productionApiKey: 'prod-key',
                    testApiKey: 'test-key',
                }),
                helpers: {
                    request: jest.fn().mockResolvedValue(mockSubmissionData),
                    returnJsonArray: jest
                        .fn()
                        .mockImplementation((data) => (Array.isArray(data) ? data : [data])),
                },
                logger: {
                    error: jest.fn(),
                },
            };
            void (await docusealTrigger.webhook.call(mockWebhookFunctions));
            expect(mockWebhookFunctions.helpers.request).toHaveBeenCalledWith(expect.objectContaining({
                uri: 'https://api.docuseal.com/submissions/123',
            }));
        });
        it('should not fetch additional data when submission_id is missing', async () => {
            const mockWebhookFunctions = {
                getWebhookName: jest.fn().mockReturnValue('default'),
                getBodyData: jest.fn().mockReturnValue({
                    event: 'submission.completed',
                }),
                getNodeParameter: jest.fn().mockImplementation((param, _defaultValue) => {
                    if (param === 'eventType') {
                        return 'all';
                    }
                    if (param === 'additionalFields') {
                        return { includeSubmissionData: true };
                    }
                    if (param === 'environment') {
                        return _defaultValue || 'production';
                    }
                    return null;
                }),
                helpers: {
                    returnJsonArray: jest
                        .fn()
                        .mockImplementation((data) => (Array.isArray(data) ? data : [data])),
                },
            };
            const result = await docusealTrigger.webhook.call(mockWebhookFunctions);
            expect(result.workflowData).toBeDefined();
            expect(mockWebhookFunctions.getCredentials).toBeUndefined();
        });
    });
    describe('Integration', () => {
        it('should be properly configured for n8n', () => {
            expect(docusealTrigger.description.displayName).toBeTruthy();
            expect(docusealTrigger.description.name).toBeTruthy();
            expect(docusealTrigger.description.icon).toBeTruthy();
            expect(docusealTrigger.description.group).toContain('trigger');
        });
        it('should have proper webhook configuration', () => {
            const webhook = docusealTrigger.description.webhooks?.[0];
            expect(webhook).toBeDefined();
            if (webhook) {
                expect(webhook.name).toBe('default');
                expect(webhook.httpMethod).toBe('POST');
                expect(webhook.responseMode).toBeDefined();
                expect(webhook.path).toBeDefined();
            }
        });
    });
});
//# sourceMappingURL=DocusealTrigger.node.test.js.map