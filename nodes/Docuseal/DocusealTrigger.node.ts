import type {
	IHookFunctions,
	IWebhookFunctions,
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';

/**
 * DocuSeal Trigger Node for n8n
 * Handles webhook events from DocuSeal platform
 * Supports various event types like submission completion, form opening, etc.
 * @implements {INodeType}
 */
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
		outputs: [{ type: 'main' as any }],
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
						description:
							'Whether to fetch the full submission data when a submission event is received',
					},
				],
			},
		],
	};

	/**
	 * Webhook methods for managing DocuSeal webhook lifecycle
	 * Handles creation, deletion, and verification of webhooks
	 */
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

				// Provide detailed instructions to manually set up webhook in DocuSeal
				const instructions = `### DocuSeal Webhook Setup

Please set up a webhook in your DocuSeal dashboard with the following URL:
\`${webhookUrl}\`

To complete the setup:
1. Log in to your DocuSeal account
2. Go to the settings section
3. Navigate to the Webhooks tab
4. Click "Add Webhook"
5. Enter the webhook URL: \`${webhookUrl}\`
6. Select the event type${
	eventType === 'all' ? 's you want to trigger this workflow' : `: ${eventType}`
}
7. Save the webhook configuration

For security purposes, DocuSeal may provide a signing secret for your webhook. 
If available, save this secret for future use with webhook validation.`;

				this.logger.info(instructions);
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				// Provide instructions to delete webhook
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
			// This is a verification endpoint that can be used by DocuSeal to verify the webhook
			async checkExists(this: IHookFunctions): Promise<boolean> {
				return false;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				return true;
			},
		},
	};

	/**
	 * Webhook handler method - processes incoming DocuSeal webhook events
	 * Validates event types, optionally fetches additional data, and returns processed data
	 * @param this - The n8n webhook execution context
	 * @returns Promise resolving to webhook response data for the workflow
	 */
	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const webhookName = this.getWebhookName();

		// Handle setup/verification requests
		if (webhookName === 'setup') {
			// Return an OK status for setup/verification
			return {
				webhookResponse: 'Webhook setup successful',
			};
		}

		// Process the webhook data
		const bodyData = this.getBodyData() ;
		const eventType = this.getNodeParameter('eventType') as string;
		const additionalFields = this.getNodeParameter('additionalFields', {}) as IDataObject;

		// Validate webhook signature if available
		// DocuSeal documentation doesn't mention a signature validation method,
		// but if it becomes available, we'll implement it here
		/*
		const headerData = this.getHeaderData() as IDataObject;
		if (headerData['x-docuseal-signature']) {
			// Check signature validity
			// const signature = headerData['x-docuseal-signature'] as string;
			// Implement signature validation logic when DocuSeal provides it
		}
		*/

		// Check if the event type matches what we're listening for
		if (bodyData.event && eventType !== 'all' && bodyData.event !== eventType) {
			// If event type doesn't match, ignore this webhook call
			return {
				noWebhookResponse: true,
			};
		}

		// Prepare the data to return
		let responseData: IDataObject | IDataObject[] = bodyData;

		// Optionally fetch additional data
		if (additionalFields.includeSubmissionData === true && bodyData.submission_id) {
			try {
				// Get the credentials
				const credentials = await this.getCredentials('docusealApi');

				// Get environment setting (production or test)
				const environment = this.getNodeParameter('environment', 'production') as string;

				// Determine which API key to use
				let apiKey = '';
				if (environment === 'production') {
					apiKey = credentials.productionApiKey as string;
				} else {
					apiKey = credentials.testApiKey as string;
				}

				// Set base URL
				const baseUrl = (credentials.baseUrl as string) || 'https://api.docuseal.com';

				// Make API request directly since we can't use docusealApiRequest here
				const submissionData = await this.helpers.request({
					method: 'GET',
					uri: `${baseUrl}/submissions/${bodyData.submission_id}`,
					headers: {
						'X-Auth-Token': apiKey,
					},
					json: true,
				});

				// Merge with existing webhook data
				responseData = {
					...bodyData,
					submission_details: submissionData,
				};
			} catch (error) {
				// If we can't get the submission data, just continue with the webhook data
				this.logger.error('Failed to fetch submission details', { error });
			}
		}

		// Return the data to be used in the workflow
		return {
			workflowData: [this.helpers.returnJsonArray(responseData)],
		};
	}
}
