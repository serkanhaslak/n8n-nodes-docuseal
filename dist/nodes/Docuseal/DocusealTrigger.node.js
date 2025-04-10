"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocusealTrigger = void 0;
class DocusealTrigger {
    constructor() {
        this.description = {
            displayName: 'DocuSeal Trigger',
            name: 'docusealTrigger',
            icon: 'file:docuseal.svg',
            group: ['trigger'],
            version: 1,
            description: 'Handle DocuSeal webhook events',
            defaults: {
                name: 'DocuSeal Trigger',
            },
            inputs: [],
            outputs: ["main"],
            credentials: [
                {
                    name: 'docusealApi',
                    required: true,
                },
            ],
            webhooks: [
                {
                    name: 'default',
                    httpMethod: 'POST',
                    responseMode: 'onReceived',
                    path: 'webhook',
                },
                {
                    name: 'setup',
                    httpMethod: 'GET',
                    responseMode: 'onReceived',
                    path: 'webhook',
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
                    displayName: 'Event Type',
                    name: 'eventType',
                    type: 'options',
                    required: true,
                    default: 'all',
                    options: [
                        {
                            name: 'All Events',
                            value: 'all',
                            description: 'Any event from DocuSeal',
                        },
                        {
                            name: 'Submission Completed',
                            value: 'submission.completed',
                            description: 'When a submission is completed',
                        },
                        {
                            name: 'Submission Created',
                            value: 'submission.created',
                            description: 'When a new submission is created',
                        },
                        {
                            name: 'Submitter Completed',
                            value: 'submitter.completed',
                            description: 'When a submitter completes their form',
                        },
                        {
                            name: 'Submitter Opened',
                            value: 'submitter.opened',
                            description: 'When a form is opened by a submitter',
                        },
                    ],
                    description: 'The event type to listen to',
                },
                {
                    displayName: 'Additional Fields',
                    name: 'additionalFields',
                    type: 'collection',
                    placeholder: 'Add Field',
                    default: {},
                    options: [
                        {
                            displayName: 'Include Full Submission Data',
                            name: 'includeSubmissionData',
                            type: 'boolean',
                            default: false,
                            description: 'Whether to fetch the full submission data when a submission event is received',
                        },
                    ],
                },
            ],
        };
        this.webhookMethods = {
            default: {
                async checkExists() {
                    return false;
                },
                async create() {
                    const webhookUrl = this.getNodeWebhookUrl('default');
                    const eventType = this.getNodeParameter('eventType');
                    const instructions = `### DocuSeal Webhook Setup

Please set up a webhook in your DocuSeal dashboard with the following URL:
\`${webhookUrl}\`

To complete the setup:
1. Log in to your DocuSeal account
2. Go to the settings section
3. Navigate to the Webhooks tab
4. Click "Add Webhook"
5. Enter the webhook URL: \`${webhookUrl}\`
6. Select the event type${eventType === 'all' ? 's you want to trigger this workflow' : ': ' + eventType}
7. Save the webhook configuration

For security purposes, DocuSeal may provide a signing secret for your webhook. 
If available, save this secret for future use with webhook validation.`;
                    this.logger.info(instructions);
                    return true;
                },
                async delete() {
                    const webhookUrl = this.getNodeWebhookUrl('default');
                    const instructions = `Please delete the webhook with URL "${webhookUrl}" from your DocuSeal dashboard:

1. Log in to your DocuSeal account
2. Go to the settings section
3. Navigate to the Webhooks tab
4. Find the webhook with URL: ${webhookUrl}
5. Click the delete button next to it
6. Confirm the deletion`;
                    this.logger.info(instructions);
                    return true;
                },
            },
            setup: {
                async checkExists() {
                    return false;
                },
                async create() {
                    return true;
                },
                async delete() {
                    return true;
                },
            },
        };
    }
    async webhook() {
        const webhookName = this.getWebhookName();
        if (webhookName === 'setup') {
            return {
                webhookResponse: 'Webhook setup successful',
            };
        }
        const bodyData = this.getBodyData();
        const eventType = this.getNodeParameter('eventType');
        const additionalFields = this.getNodeParameter('additionalFields', {});
        if (bodyData.event && eventType !== 'all' && bodyData.event !== eventType) {
            return {
                noWebhookResponse: true,
            };
        }
        let responseData = bodyData;
        if (additionalFields.includeSubmissionData === true && bodyData.submission_id) {
            try {
                const credentials = await this.getCredentials('docusealApi');
                const environment = this.getNodeParameter('environment', 'production');
                let apiKey = '';
                if (environment === 'production') {
                    apiKey = credentials.productionApiKey;
                }
                else {
                    apiKey = credentials.testApiKey;
                }
                const baseUrl = credentials.baseUrl || 'https://api.docuseal.com';
                const submissionData = await this.helpers.request({
                    method: 'GET',
                    uri: `${baseUrl}/submissions/${bodyData.submission_id}`,
                    headers: {
                        'X-Auth-Token': apiKey,
                    },
                    json: true,
                });
                responseData = {
                    ...bodyData,
                    submission_details: submissionData,
                };
            }
            catch (error) {
                this.logger.error('Failed to fetch submission details', { error });
            }
        }
        return {
            workflowData: [
                this.helpers.returnJsonArray(responseData),
            ],
        };
    }
}
exports.DocusealTrigger = DocusealTrigger;
//# sourceMappingURL=DocusealTrigger.node.js.map