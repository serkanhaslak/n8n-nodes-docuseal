import {
	IHookFunctions,
	IWebhookFunctions,
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeConnectionType,
} from 'n8n-workflow';

export class DocusealTrigger implements INodeType {
	description: INodeTypeDescription = {
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
		outputs: [NodeConnectionType.Main],
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
		],
		properties: [
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
		],
	};

	// @ts-ignore
	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				// Not needed for DocuSeal as webhooks are set up in the DocuSeal dashboard
				return false;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				// Return info to user about how to set up webhook in DocuSeal
				const webhookUrl = this.getNodeWebhookUrl('default');
				const eventType = this.getNodeParameter('eventType') as string;

				// Provide instructions to manually set up webhook in DocuSeal
				const instructions = `Please set up a webhook in your DocuSeal dashboard with the following URL: ${webhookUrl}
To complete the setup:
1. Log in to your DocuSeal account
2. Go to the settings section
3. Navigate to the Webhooks tab
4. Click "Add Webhook"
5. Enter the webhook URL: ${webhookUrl}
6. Select the event type${eventType === 'all' ? 's you want to trigger this workflow' : ': ' + eventType}
7. Save the webhook configuration`;

				this.logger.info(instructions);
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				// Provide instructions to delete webhook
				const webhookUrl = this.getNodeWebhookUrl('default');
				const instructions = `Please delete the webhook with URL "${webhookUrl}" from your DocuSeal dashboard.`;
				this.logger.info(instructions);
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData() as IDataObject;
		// We get header data, but we're not using it currently for DocuSeal
		// If DocuSeal adds webhook signature validation in the future, we'll use this
		// const headerData = this.getHeaderData() as IDataObject;
		const eventType = this.getNodeParameter('eventType') as string;

		// Validate webhook signature if available
		// DocuSeal documentation doesn't mention a signature validation method, 
		// but if it becomes available, we can implement it here

		if (bodyData.event && eventType !== 'all' && bodyData.event !== eventType) {
			// If event type doesn't match, ignore this webhook call
			return { 
				noWebhookResponse: true,
			};
		}

		// Return the data to be used in the workflow
		return {
			workflowData: [
				this.helpers.returnJsonArray(bodyData),
			],
		};
	}
}
