import type {
	IExecuteFunctions,
	IHookFunctions,
	IDataObject,
	ILoadOptionsFunctions,
	JsonObject,
	IHttpRequestMethods,
	IHttpRequestOptions,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

/**
 * Make an API request to DocuSeal
 */
export async function docusealApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: object = {},
	query: IDataObject = {},
	options: IDataObject = {},
): Promise<any> {
	const credentials = await this.getCredentials('docusealApi');
	if (!credentials) {
		throw new Error('No credentials provided!');
	}

	// Get environment from credentials
	const environment = (credentials.environment as string) || 'production';
	
	// Set API key based on environment
	let apiKey = '';
	if (environment === 'production') {
		apiKey = credentials.productionApiKey as string;
		if (!apiKey) {
			throw new Error('Production API key is required for production environment');
		}
	} else {
		// Use test API key for test environment
		apiKey = credentials.testApiKey as string;
		
		if (!apiKey) {
			throw new Error('Test API key is required for test environment');
		}
	}
	
	// Set base URL from credentials or use default
	const baseUrl = credentials.baseUrl as string || 'https://api.docuseal.com';

	const requestOptions: IHttpRequestOptions = {
		method,
		body,
		qs: query,
		url: `${baseUrl}${endpoint}`,
		headers: {
			'X-Auth-Token': apiKey,
		},
		json: true,
	};

	// Add options if any
	if (Object.keys(options).length > 0) {
		Object.assign(requestOptions, options);
	}

	// Handle file uploads
	if (options.formData) {
		(requestOptions as any).formData = options.formData;
		delete requestOptions.body;
		delete requestOptions.json;
	}

	try {
		return await this.helpers.request(requestOptions);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Make an API request to DocuSeal and return all items with proper pagination
 */
export async function docusealApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: object = {},
	query: IDataObject = {},
): Promise<any> {
	const returnData: IDataObject[] = [];
	let responseData;
	let nextCursor: number | undefined;
	
	// Set initial limit
	query.limit = 100;

	do {
		// Add cursor for pagination if available
		if (nextCursor) {
			query.after = nextCursor;
		}

		responseData = await docusealApiRequest.call(this, method, endpoint, body, query);

		if (Array.isArray(responseData)) {
			returnData.push(...responseData);
			
			// Check if we have more items
			if (responseData.length === query.limit) {
				// Get the last item's ID for cursor-based pagination
				const lastItem = responseData[responseData.length - 1];
				nextCursor = lastItem.id;
			} else {
				// No more items
				nextCursor = undefined;
			}
		} else {
			break;
		}
	} while (nextCursor);

	return returnData;
}

/**
 * Parse JSON input - handles both string and object formats
 */
export function parseJsonInput(inputData: string | object): object {
	if (typeof inputData === 'string') {
		try {
			return JSON.parse(inputData);
		} catch (error) {
			throw new Error('Invalid JSON input. Please provide valid JSON.');
		}
	}
	return inputData as object;
}

/**
 * Get list of templates for dropdown
 */
export async function getTemplates(
	this: ILoadOptionsFunctions,
): Promise<Array<{ name: string; value: number }>> {
	try {
		console.log('getTemplates: Starting to fetch templates...');
		
		// First try with docusealApiRequest to see the raw response
		const rawResponse = await docusealApiRequest.call(
			this,
			'GET',
			'/templates',
			{},
			{ limit: 100 }
		);
		
		console.log('getTemplates: Raw API response:', {
			responseType: typeof rawResponse,
			isArray: Array.isArray(rawResponse),
			responseKeys: rawResponse && typeof rawResponse === 'object' ? Object.keys(rawResponse) : null,
			rawResponse: rawResponse
		});
		
		// Handle different response structures
		let templates: any[];
		if (Array.isArray(rawResponse)) {
			// Direct array response
			templates = rawResponse;
		} else if (rawResponse && typeof rawResponse === 'object') {
			// Check for common pagination patterns
			if (rawResponse.data && Array.isArray(rawResponse.data)) {
				templates = rawResponse.data;
			} else if (rawResponse.templates && Array.isArray(rawResponse.templates)) {
				templates = rawResponse.templates;
			} else if (rawResponse.results && Array.isArray(rawResponse.results)) {
				templates = rawResponse.results;
			} else {
				console.error('getTemplates: Unknown response structure:', rawResponse);
				return [];
			}
		} else {
			console.error('getTemplates: Invalid response type:', typeof rawResponse);
			return [];
		}
		
		console.log('getTemplates: Extracted templates:', {
			templatesCount: templates.length,
			firstTemplate: templates.length > 0 ? templates[0] : null
		});
		
		if (templates.length === 0) {
			console.log('getTemplates: No templates found');
			return [];
		}
		
		// Transform API response to options format
		const options = templates.map((template: any) => {
			const option = {
				name: template.name || template.title || `Template ${template.id}`,
				value: template.id,
			};
			console.log('getTemplates: Mapping template:', { id: template.id, name: template.name, option });
			return option;
		});
		
		console.log('getTemplates: Final options array:', options);
		return options;
	} catch (error) {
		console.error('getTemplates: Error occurred:', {
			errorMessage: error instanceof Error ? error.message : String(error),
			errorStack: error instanceof Error ? error.stack : undefined,
			errorType: typeof error,
			fullError: error
		});
		
		// Return empty array to prevent dropdown from breaking
		return [];
	}
}

/**
 * Prepare binary data for upload
 */
export async function prepareBinaryData(
	this: IExecuteFunctions,
	binaryPropertyName: string,
	itemIndex: number,
	fileName?: string,
): Promise<IDataObject> {
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

/**
 * Build submitters array from fixedCollection format
 */
export function buildSubmittersArray(submittersData: IDataObject): IDataObject[] {
	if (!submittersData.submitter) {
		return [];
	}

	const submitterItems = Array.isArray(submittersData.submitter) 
		? submittersData.submitter 
		: [submittersData.submitter];

	return submitterItems.map((item: any) => {
		const submitter: IDataObject = {
			email: item.email,
			role: item.role || 'Signer',
		};

		// Add additional fields if present
		if (item.additionalFields) {
			const additionalFields = item.additionalFields as IDataObject;
			
			if (additionalFields.name) submitter.name = additionalFields.name;
			if (additionalFields.phone) submitter.phone = additionalFields.phone;
			if (additionalFields.external_id) submitter.external_id = additionalFields.external_id;
			if (additionalFields.completed !== undefined) submitter.completed = additionalFields.completed;
			if (additionalFields.send_email !== undefined) submitter.send_email = additionalFields.send_email;
			if (additionalFields.send_sms !== undefined) submitter.send_sms = additionalFields.send_sms;
			
			// Parse JSON fields
			if (additionalFields.metadata) {
				submitter.metadata = parseJsonInput(additionalFields.metadata as string | object);
			}
			if (additionalFields.values) {
				submitter.values = parseJsonInput(additionalFields.values as string | object);
			}
		}

		return submitter;
	});
}

/**
 * Build field values object from fixedCollection format or JSON input
 */
export function buildFieldValues(nodeParameters: IDataObject): IDataObject {
	// Check if field values mode is specified
	const fieldValuesMode = nodeParameters.fieldValuesMode as string || 'individual';
	
	if (fieldValuesMode === 'json') {
		// Handle JSON input mode
		const fieldValuesJson = nodeParameters.fieldValuesJson as string;
		if (fieldValuesJson) {
			return parseJsonInput(fieldValuesJson) as IDataObject;
		}
		return {};
	} else {
		// Handle individual fields mode
		const fieldValues = nodeParameters.fieldValues as IDataObject;
		if (!fieldValues || !fieldValues.field) {
			return {};
		}

		const fields = fieldValues.field as IDataObject[];
		const result: IDataObject = {};

		for (const field of fields) {
			if (field.name && field.value !== undefined) {
				result[field.name as string] = field.value;
			}
		}

		return result;
	}
}

/**
 * Format date for API
 */
export function formatDate(date: string): string {
	if (!date) return '';
	
	// Convert to UTC format expected by API
	const dateObj = new Date(date);
	return dateObj.toISOString();
}