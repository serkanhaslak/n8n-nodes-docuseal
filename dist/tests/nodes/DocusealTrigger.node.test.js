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