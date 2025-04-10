import type {
	IExecuteFunctions,
	IHookFunctions,
	IDataObject,
	ILoadOptionsFunctions,
	JsonObject,
	IHttpRequestMethods,
	IRequestOptions,
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

	// Get environment (production or test)
	let environment: string;
	
	try {
		// First try to get the environment parameter from the node
		environment = this.getNodeParameter('environment', 0) as string;
	} catch (error) {
		// If there's an error (e.g., in load options where parameters might not be accessible)
		// Default to production
		environment = 'production';
	}
	
	// Set API key based on environment
	let apiKey = '';
	if (environment === 'production') {
		apiKey = credentials.productionApiKey as string;
	} else {
		// Use test API key for test environment
		apiKey = credentials.testApiKey as string;
		
		if (!apiKey) {
			throw new Error('Test API key is required for test environment');
		}
	}
	
	// Set base URL from credentials or use default
	const baseUrl = credentials.baseUrl as string || 'https://api.docuseal.com';

	const requestOptions: IRequestOptions = {
		method,
		body,
		qs: query,
		uri: `${baseUrl}${endpoint}`,
		headers: {
			'X-Auth-Token': apiKey,
		},
		json: true,
	};

	// Add options if any
	if (Object.keys(options).length > 0) {
		Object.assign(requestOptions, options);
	}

	try {
		return await this.helpers.request(requestOptions);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Make an API request to DocuSeal and return all items
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
	
	// We'll implement proper pagination in the future
	// For now we're just returning all items in a single request
	query.limit = 100;

	responseData = await docusealApiRequest.call(this, method, endpoint, body, query);

	if (Array.isArray(responseData)) {
		returnData.push(...responseData);
	}

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
	// Make request to get templates - docusealApiRequest will handle the environment selection
	const templates = await docusealApiRequest.call(this, 'GET', '/templates', {}, {});
	
	if (!Array.isArray(templates)) {
		return [];
	}
	
	// Transform API response to options format
	return templates.map((template: any) => ({
		name: template.name,
		value: template.id,
	}));
}
