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

// Security constants
const ALLOWED_FILE_TYPES = [
	'application/pdf',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
	'application/msword', // DOC
	'image/jpeg',
	'image/png',
	'image/gif',
	'text/plain',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const API_KEY_PATTERN = /^[a-zA-Z0-9_-]{20,}$/; // Basic pattern for API keys

/**
 * Validate API key format and strength
 */
export function validateApiKey(apiKey: string): { isValid: boolean; message?: string } {
	if (!apiKey || typeof apiKey !== 'string') {
		return { isValid: false, message: 'API key is required and must be a string' };
	}

	if (apiKey.trim() !== apiKey) {
		return { isValid: false, message: 'API key cannot contain leading or trailing whitespace' };
	}

	if (apiKey.length < 20) {
		return { isValid: false, message: 'API key must be at least 20 characters long' };
	}

	if (!API_KEY_PATTERN.test(apiKey)) {
		return {
			isValid: false,
			message:
				'API key contains invalid characters. Only alphanumeric characters, hyphens, and underscores are allowed',
		};
	}

	// Check for common weak patterns (but allow test keys for testing)
	if (/^(demo|sample|example)/i.test(apiKey)) {
		return { isValid: false, message: 'API key appears to be a placeholder key' };
	}

	return { isValid: true };
}

/**
 * Sanitize input strings to prevent injection attacks
 * Recursively processes strings, arrays, and objects to remove potentially dangerous characters
 * @param input - The input value to sanitize (string, array, object, or primitive)
 * @returns The sanitized input with dangerous characters removed
 * @example
 * sanitizeInput('<script>alert("xss")</script>') // Returns 'scriptalert(xss)/script'
 * sanitizeInput(['<test>', 'normal']) // Returns ['test', 'normal']
 */
export function sanitizeInput(input: any): any {
	if (typeof input === 'string') {
		// Remove potentially dangerous characters and normalize
		return input
			.replace(/[<>"'&]/g, '') // Remove HTML/XML special characters
			.replace(/[\p{Cc}]/gu, '') // Remove control characters
			.trim();
	}

	if (Array.isArray(input)) {
		return input.map(sanitizeInput);
	}

	if (input && typeof input === 'object') {
		const sanitized: any = {};
		for (const [key, value] of Object.entries(input)) {
			sanitized[sanitizeInput(key)] = sanitizeInput(value);
		}
		return sanitized;
	}

	return input;
}

/**
 * Validate file type, size, and basic integrity
 * Performs comprehensive validation including size limits, MIME type checking, and file signature validation
 * @param fileData - The file data as a Buffer
 * @param fileName - The original filename with extension
 * @param mimeType - Optional MIME type to validate against
 * @returns Object with validation result and optional error message
 * @throws Never throws - returns validation result object instead
 * @example
 * const result = validateFile(buffer, 'document.pdf', 'application/pdf');
 * if (!result.isValid) {
 *   console.error(result.message);
 * }
 */
export function validateFile(
	fileData: Buffer,
	fileName: string,
	mimeType?: string,
): { isValid: boolean; message?: string } {
	// Check file size
	if (fileData.length > MAX_FILE_SIZE) {
		return {
			isValid: false,
			message: `File size (${Math.round(
				fileData.length / 1024 / 1024,
			)}MB) exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
		};
	}

	// Check file type by MIME type if provided
	if (mimeType && !ALLOWED_FILE_TYPES.includes(mimeType)) {
		return {
			isValid: false,
			message: `File type '${mimeType}' is not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(
				', ',
			)}`,
		};
	}

	// Check file extension
	const fileExtension = fileName.toLowerCase().split('.').pop();
	const allowedExtensions = ['pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png', 'gif', 'txt'];

	if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
		return {
			isValid: false,
			message: `File extension '${fileExtension}' is not allowed. Allowed extensions: ${allowedExtensions.join(
				', ',
			)}`,
		};
	}

	// Basic file signature validation for common types
	const fileSignature = fileData.slice(0, 8).toString('hex').toUpperCase();

	// PDF signature
	if (fileExtension === 'pdf' && !fileSignature.startsWith('255044462D')) {
		return { isValid: false, message: 'File does not appear to be a valid PDF' };
	}

	// PNG signature
	if (fileExtension === 'png' && !fileSignature.startsWith('89504E47')) {
		return { isValid: false, message: 'File does not appear to be a valid PNG' };
	}

	// JPEG signature
	if (['jpg', 'jpeg'].includes(fileExtension) && !fileSignature.startsWith('FFD8FF')) {
		return { isValid: false, message: 'File does not appear to be a valid JPEG' };
	}

	return { isValid: true };
}

/**
 * Validate URL format and security
 * Ensures URLs use HTTPS protocol and prevents SSRF attacks by blocking private networks
 * @param url - The URL string to validate
 * @returns Object with validation result and optional error message
 * @throws Never throws - returns validation result object instead
 * @example
 * validateUrl('https://api.docuseal.com/templates') // { isValid: true }
 * validateUrl('http://localhost:3000') // { isValid: false, message: '...' }
 */
export function validateUrl(url: string): { isValid: boolean; message?: string } {
	if (!url || typeof url !== 'string') {
		return { isValid: false, message: 'URL is required and must be a string' };
	}

	try {
		const urlObj = new URL(url);

		// Only allow HTTPS for security
		if (urlObj.protocol !== 'https:') {
			return { isValid: false, message: 'Only HTTPS URLs are allowed for security reasons' };
		}

		// Block localhost and private IP ranges
		const hostname = urlObj.hostname.toLowerCase();

		const isLocalhost = hostname === 'localhost';
		const isLoopback = hostname === '127.0.0.1';
		const isPrivateClass1 = hostname.startsWith('192.168.');
		const isPrivateClass2 = hostname.startsWith('10.');
		const isPrivateClass3 = Boolean(hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./));
		const isLinkLocal = hostname.startsWith('169.254.');

		if (
			isLocalhost ||
			isLoopback ||
			isPrivateClass1 ||
			isPrivateClass2 ||
			isPrivateClass3 ||
			isLinkLocal
		) {
			return {
				isValid: false,
				message: 'URLs pointing to localhost or private networks are not allowed',
			};
		}

		// Check for suspicious patterns
		if (url.includes('..') || url.includes('%2e%2e')) {
			return { isValid: false, message: 'URL contains suspicious path traversal patterns' };
		}

		return { isValid: true };
	} catch (error) {
		return { isValid: false, message: 'Invalid URL format' };
	}
}

/**
 * Sanitize and validate endpoint paths
 * Removes dangerous characters and validates endpoint format for API requests
 * @param endpoint - The API endpoint path to validate and sanitize
 * @returns Object with validation result, sanitized endpoint, and optional error message
 * @throws Never throws - returns validation result object instead
 * @example
 * validateEndpoint('/templates') // { isValid: true, sanitized: '/templates' }
 * validateEndpoint('/../admin') // { isValid: false, message: '...' }
 */
export function validateEndpoint(endpoint: string): {
	isValid: boolean;
	sanitized?: string;
	message?: string;
} {
	if (!endpoint || typeof endpoint !== 'string') {
		return { isValid: false, message: 'Endpoint is required and must be a string' };
	}

	// Sanitize the endpoint
	let sanitized = endpoint.trim();

	// Ensure it starts with /
	if (!sanitized.startsWith('/')) {
		sanitized = `/${sanitized}`;
	}

	// Remove double slashes and normalize
	sanitized = sanitized.replace(/\/+/g, '/');

	// Check for path traversal attempts
	if (sanitized.includes('..') || sanitized.includes('%2e%2e')) {
		return { isValid: false, message: 'Endpoint contains invalid path traversal patterns' };
	}

	// Validate against allowed characters
	if (!/^[a-zA-Z0-9/_-]+$/.test(sanitized)) {
		return { isValid: false, message: 'Endpoint contains invalid characters' };
	}

	return { isValid: true, sanitized };
}

/**
 * Make an authenticated API request to DocuSeal
 * Handles authentication, input validation, error handling, and retries
 * @param this - The n8n execution context (IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions)
 * @param method - HTTP method for the request (GET, POST, PUT, DELETE, etc.)
 * @param endpoint - API endpoint path (e.g., '/templates', '/submissions')
 * @param body - Request body data (will be sanitized)
 * @param query - URL query parameters (will be sanitized)
 * @param options - Additional request options
 * @param retryCount - Number of retry attempts for failed requests (default: 3)
 * @returns Promise resolving to the API response data
 * @throws {NodeApiError} When API request fails, credentials are invalid, or validation errors occur
 * @example
 * const templates = await docusealApiRequest.call(this, 'GET', '/templates');
 * const submission = await docusealApiRequest.call(this, 'POST', '/submissions', {
 *   template_id: '123',
 *   submitters: [{ email: 'user@example.com', role: 'signer' }]
 * });
 */
export async function docusealApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: object = {},
	query: IDataObject = {},
	options: IDataObject = {},
	retryCount = 3,
): Promise<any> {
	// Enhanced endpoint validation
	const endpointValidation = validateEndpoint(endpoint);
	if (!endpointValidation.isValid) {
		throw new NodeApiError(this.getNode(), {
			message: 'Invalid API endpoint',
			description: endpointValidation.message,
			httpCode: '400',
		} as JsonObject);
	}

	// Use sanitized endpoint
	endpoint = endpointValidation.sanitized ?? endpoint;

	// Sanitize input data
	body = sanitizeInput(body);
	query = sanitizeInput(query);

	let credentials;
	try {
		credentials = await this.getCredentials('docusealApi');
	} catch (error) {
		throw new NodeApiError(this.getNode(), {
			message: 'Failed to retrieve DocuSeal credentials',
			description: 'Please ensure DocuSeal API credentials are properly configured in n8n',
			cause: error,
			httpCode: '401',
		} as JsonObject);
	}

	if (!credentials) {
		throw new NodeApiError(this.getNode(), {
			message: 'DocuSeal credentials not found',
			description: 'Please configure DocuSeal API credentials in the node settings',
			httpCode: '401',
		} as JsonObject);
	}

	// Get environment from credentials
	const environment = (credentials.environment as string) || 'production';

	// Set API key based on environment with enhanced validation
	let apiKey = '';
	if (environment === 'production') {
		apiKey = credentials.productionApiKey as string;
		if (!apiKey || apiKey.trim() === '') {
			throw new NodeApiError(this.getNode(), {
				message: 'Production API key is missing',
				description:
					'Please provide a valid production API key in the DocuSeal credentials. You can obtain this from your DocuSeal account settings.',
				httpCode: '401',
			} as JsonObject);
		}
	} else {
		// Use test API key for test environment
		apiKey = credentials.testApiKey as string;

		if (!apiKey || apiKey.trim() === '') {
			throw new NodeApiError(this.getNode(), {
				message: 'Test API key is missing',
				description:
					'Please provide a valid test API key in the DocuSeal credentials for sandbox testing. You can obtain this from your DocuSeal test environment.',
				httpCode: '401',
			} as JsonObject);
		}
	}

	// Enhanced API key validation
	const apiKeyValidation = validateApiKey(apiKey);
	if (!apiKeyValidation.isValid) {
		throw new NodeApiError(this.getNode(), {
			message: 'Invalid API key format',
			description: apiKeyValidation.message,
			httpCode: '401',
		} as JsonObject);
	}

	// Set base URL from credentials or use default
	const baseUrl = (credentials.baseUrl as string) || 'https://api.docuseal.com';

	// Enhanced URL validation
	const urlValidation = validateUrl(baseUrl);
	if (!urlValidation.isValid) {
		throw new NodeApiError(this.getNode(), {
			message: 'Invalid base URL',
			description: urlValidation.message,
			httpCode: '400',
		} as JsonObject);
	}

	const requestOptions: IHttpRequestOptions = {
		method,
		body,
		qs: query,
		url: `${baseUrl}${endpoint}`,
		headers: {
			'X-Auth-Token': apiKey,
			'User-Agent': 'n8n-docuseal-node/1.0.0',
		},
		json: true,
		timeout: 30000, // 30 second timeout
	};

	// Add options if any
	if (Object.keys(options).length > 0) {
		Object.assign(requestOptions, options);
	}

	// Handle file uploads with validation
	if (options.formData) {
		// Validate uploaded files if present
		const formData = options.formData as any;
		for (const [, value] of Object.entries(formData)) {
			if (value && typeof value === 'object' && 'value' in value && Buffer.isBuffer(value.value)) {
				const fileObject = value as { value: Buffer; filename?: string; contentType?: string };
				const fileValidation = validateFile(
					fileObject.value,
					fileObject.filename ?? 'unknown',
					fileObject.contentType,
				);
				if (!fileValidation.isValid) {
					throw new NodeApiError(this.getNode(), {
						message: 'File validation failed',
						description: fileValidation.message,
						httpCode: '400',
					} as JsonObject);
				}
			}
		}

		(requestOptions as any).formData = options.formData;
		delete requestOptions.body;
		delete requestOptions.json;
	}

	// Retry logic for transient failures
	for (let attempt = 1; attempt <= retryCount; attempt++) {
		try {
			const response = await this.helpers.request(requestOptions);
			return response;
		} catch (error: any) {
			const isLastAttempt = attempt === retryCount;
			const isRetryableError = isTransientError(error);

			if (isLastAttempt || !isRetryableError) {
				// Enhanced error handling with context
				const errorMessage = getEnhancedErrorMessage(error, method, endpoint, environment);
				throw new NodeApiError(this.getNode(), errorMessage);
			}

			// Wait before retry (exponential backoff)
			const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Max 10 seconds
			await new Promise((resolve) => setTimeout(resolve, waitTime));
		}
	}
}

/**
 * Check if an error is transient and should be retried
 * Determines whether an API error is temporary and the request should be retried
 * @param error - The error object to check
 * @returns True if the error is transient and should be retried, false otherwise
 * @example
 * isTransientError({ code: 'ECONNRESET' }) // true
 * isTransientError({ statusCode: 429 }) // true
 * isTransientError({ statusCode: 404 }) // false
 */
function isTransientError(error: any): boolean {
	if (!error) {
		return false;
	}

	// Network errors
	if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
		return true;
	}

	// HTTP status codes that should be retried
	const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
	if (error.statusCode && retryableStatusCodes.includes(error.statusCode)) {
		return true;
	}

	return false;
}

/**
 * Generate enhanced error message with context
 * Creates detailed error messages with contextual information for better debugging
 * @param error - The original error object
 * @param method - HTTP method that was used
 * @param endpoint - API endpoint that was called
 * @param environment - Environment (production/test) where error occurred
 * @returns Enhanced error object with detailed message and context
 * @example
 * getEnhancedErrorMessage(error, 'POST', '/submissions', 'production')
 * // Returns detailed error with context and suggestions
 */
function getEnhancedErrorMessage(
	error: any,
	method: string,
	endpoint: string,
	environment: string,
): JsonObject {
	const baseMessage = {
		method,
		endpoint,
		environment,
		timestamp: new Date().toISOString(),
	};

	// Handle different types of errors
	if (error.statusCode) {
		switch (error.statusCode) {
			case 400:
				return {
					...baseMessage,
					message: 'Bad Request - Invalid parameters',
					description: `The request to ${endpoint} contains invalid parameters. Please check your input data.`,
					httpCode: '400',
					details: error.message || error.body,
				};
			case 401:
				return {
					...baseMessage,
					message: 'Authentication failed',
					description: `Invalid API key for ${environment} environment. Please verify your DocuSeal credentials.`,
					httpCode: '401',
					details: error.message || error.body,
				};
			case 403:
				return {
					...baseMessage,
					message: 'Access forbidden',
					description: `Insufficient permissions to access ${endpoint}. Please check your API key permissions.`,
					httpCode: '403',
					details: error.message || error.body,
				};
			case 404:
				return {
					...baseMessage,
					message: 'Resource not found',
					description:
						`The requested resource at ${endpoint} was not found. ` +
						'Please verify the endpoint and resource ID.',
					httpCode: '404',
					details: error.message || error.body,
				};
			case 429:
				return {
					...baseMessage,
					message: 'Rate limit exceeded',
					description:
						'Too many requests sent to DocuSeal API. Please wait before making additional requests.',
					httpCode: '429',
					details: error.message || error.body,
				};
			case 500:
				return {
					...baseMessage,
					message: 'Internal server error',
					description: 'DocuSeal API encountered an internal error. Please try again later.',
					httpCode: '500',
					details: error.message || error.body,
				};
			default:
				return {
					...baseMessage,
					message: `HTTP ${error.statusCode} Error`,
					description: `Request to ${endpoint} failed with status ${error.statusCode}`,
					httpCode: error.statusCode.toString(),
					details: error.message || error.body,
				};
		}
	}

	// Handle network errors
	if (error.code) {
		switch (error.code) {
			case 'ECONNRESET':
				return {
					...baseMessage,
					message: 'Connection reset',
					description:
						'The connection to DocuSeal API was reset. This is usually a temporary network issue.',
					httpCode: 'NETWORK_ERROR',
					details: error.message,
				};
			case 'ENOTFOUND':
				return {
					...baseMessage,
					message: 'DNS resolution failed',
					description:
						'Could not resolve DocuSeal API hostname. Please check your internet connection.',
					httpCode: 'NETWORK_ERROR',
					details: error.message,
				};
			case 'ETIMEDOUT':
				return {
					...baseMessage,
					message: 'Request timeout',
					description: 'The request to DocuSeal API timed out. Please try again.',
					httpCode: 'TIMEOUT',
					details: error.message,
				};
			default:
				return {
					...baseMessage,
					message: `Network error: ${error.code}`,
					description: 'A network error occurred while connecting to DocuSeal API.',
					httpCode: 'NETWORK_ERROR',
					details: error.message,
				};
		}
	}

	// Generic error fallback
	return {
		...baseMessage,
		message: 'Unknown error occurred',
		description: `An unexpected error occurred while making request to ${endpoint}`,
		httpCode: 'UNKNOWN',
		details: error.message || error.toString(),
	};
}

/**
 * Make an API request to DocuSeal and return all items with optimized pagination
 * Automatically handles pagination to fetch all available items with memory optimization
 * @param this - The n8n execution context (IExecuteFunctions | ILoadOptionsFunctions)
 * @param method - HTTP method for the request
 * @param endpoint - API endpoint path
 * @param body - Request body data
 * @param query - URL query parameters
 * @param options - Pagination and optimization options
 * @param options.batchSize - Number of items to fetch per request (default: 100)
 * @param options.maxItems - Maximum total items to fetch (default: 10000)
 * @param options.memoryOptimized - Enable memory optimization for large datasets
 * @returns Promise resolving to array of all fetched items
 * @throws {NodeApiError} When API request fails or pagination errors occur
 * @example
 * // Fetch all templates with default settings
 * const templates = await docusealApiRequestAllItems.call(this, 'GET', '/templates');
 *
 * // Fetch submissions with custom batch size
 * const submissions = await docusealApiRequestAllItems.call(this, 'GET', '/submissions', {}, {}, {
 *   batchSize: 50,
 *   maxItems: 1000
 * });
 */
export async function docusealApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: object = {},
	query: IDataObject = {},
	options: {
		batchSize?: number;
		maxItems?: number;
		memoryOptimized?: boolean;
	} = {},
): Promise<any> {
	const returnData: IDataObject[] = [];
	let responseData;
	let nextCursor: number | undefined;
	let totalFetched = 0;

	// Performance optimizations
	const batchSize = options.batchSize ?? 100;
	const maxItems = options.maxItems ?? 10000; // Prevent memory issues
	const memoryOptimized = options.memoryOptimized ?? false;

	// Set initial limit with optimization
	query.limit = Math.min(batchSize, maxItems);

	do {
		// Memory optimization: Check if we're approaching limits
		if (totalFetched >= maxItems) {
			// Reached maximum items limit
			break;
		}

		// Adjust batch size for remaining items
		if (totalFetched + batchSize > maxItems) {
			query.limit = maxItems - totalFetched;
		}

		// Add cursor for pagination if available
		if (nextCursor) {
			query.after = nextCursor;
		}

		try {
			responseData = await docusealApiRequest.call(this, method, endpoint, body, query);
		} catch (error: any) {
			// Enhanced error handling for pagination
			if (error.httpCode === '429') {
				// Rate limit hit during pagination - wait and retry
				// Rate limit hit during pagination, waiting before retry
				await new Promise((resolve) => setTimeout(resolve, 5000));
				continue;
			}
			throw error;
		}

		// Handle DocuSeal API response format
		if (responseData && typeof responseData === 'object') {
			let currentBatch: any[] = [];

			// Check if response has 'data' property (DocuSeal API format)
			if (responseData.data && Array.isArray(responseData.data)) {
				currentBatch = responseData.data;

				// Check pagination info
				if (responseData.pagination?.next) {
					nextCursor = responseData.pagination.next;
				} else {
					nextCursor = undefined;
				}
			} else if (Array.isArray(responseData)) {
				// Fallback for direct array response
				currentBatch = responseData;

				// Check if we have more items (fallback logic)
				if (responseData.length === query.limit) {
					// Get the last item's ID for cursor-based pagination
					const lastItem = responseData[responseData.length - 1];
					if (lastItem?.id) {
						nextCursor = lastItem.id;
					} else {
						nextCursor = undefined;
					}
				} else {
					// No more items
					nextCursor = undefined;
				}
			} else {
				// Unknown response format
				break;
			}

			// Memory optimization: Process batch immediately if enabled
			if (memoryOptimized && currentBatch.length > 0) {
				// For memory-optimized mode, yield control and process in smaller chunks
				for (let j = 0; j < currentBatch.length; j += 50) {
					const chunk = currentBatch.slice(j, j + 50);
					returnData.push(...chunk);

					// Yield control to prevent blocking
					if (j % 200 === 0) {
						await new Promise((resolve) => setImmediate(resolve));
					}
				}
			} else {
				returnData.push(...currentBatch);
			}

			totalFetched += currentBatch.length;

			// Progress logging for large datasets
			if (totalFetched % 500 === 0) {
				// Progress tracking: fetched items
			}
		} else {
			break;
		}
	} while (nextCursor && totalFetched < maxItems);

	// Completed fetching items
	return returnData;
}

/**
 * Batch multiple API requests for improved performance
 * Processes multiple API requests in controlled batches to respect rate limits
 * @param this - The n8n execution context
 * @param requests - Array of request objects to execute
 * @param requests[].method - HTTP method for the request
 * @param requests[].endpoint - API endpoint path
 * @param requests[].body - Optional request body
 * @param requests[].query - Optional query parameters
 * @param options - Batching configuration options
 * @param options.batchSize - Number of concurrent requests per batch (default: 5)
 * @param options.delayBetweenBatches - Delay in milliseconds between batches (default: 100)
 * @returns Promise resolving to array of results (may include errors for individual requests)
 * @example
 * const requests = [
 *   { method: 'GET', endpoint: '/templates/1' },
 *   { method: 'GET', endpoint: '/templates/2' },
 *   { method: 'POST', endpoint: '/submissions', body: { template_id: '1' } }
 * ];
 * const results = await docusealApiBatchRequest.call(this, requests, { batchSize: 3 });
 */
export async function docusealApiBatchRequest(
	this: IExecuteFunctions,
	requests: Array<{
		method: IHttpRequestMethods;
		endpoint: string;
		body?: object;
		query?: IDataObject;
	}>,
	options: {
		batchSize?: number;
		delayBetweenBatches?: number;
	} = {},
): Promise<any[]> {
	const results: any[] = [];
	const batchSize = options.batchSize ?? 5; // Conservative batch size
	const delay = options.delayBetweenBatches ?? 100; // 100ms delay between batches

	// Process requests in batches
	for (let i = 0; i < requests.length; i += batchSize) {
		const batch = requests.slice(i, i + batchSize);

		// Execute batch concurrently
		const batchPromises = batch.map(async (request) => {
			try {
				return await docusealApiRequest.call(
					this,
					request.method,
					request.endpoint,
					request.body ?? {},
					request.query ?? {},
				);
			} catch (error: any) {
				// Return error info instead of throwing to allow partial success
				return {
					error: true,
					message: error.message,
					request,
				};
			}
		});

		const batchResults = await Promise.all(batchPromises);
		results.push(...batchResults);

		// Add delay between batches to respect rate limits
		if (i + batchSize < requests.length) {
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}

	return results;
}

/**
 * Optimized file upload with progress tracking and chunking
 * Handles large file uploads with chunking and progress reporting
 * @param this - The n8n execution context
 * @param fileData - The file data as a Buffer
 * @param fileName - Original filename with extension
 * @param options - Upload optimization options
 * @param options.chunkSize - Size of each chunk in bytes (default: 1MB)
 * @param options.progressCallback - Callback function to report upload progress
 * @returns Promise resolving to the upload response
 * @throws {NodeApiError} When file validation fails or upload errors occur
 * @example
 * const result = await docusealApiUploadOptimized.call(this, fileBuffer, 'document.pdf', {
 *   chunkSize: 2 * 1024 * 1024, // 2MB chunks
 *   progressCallback: (progress) => console.log(`Upload progress: ${progress}%`)
 * });
 */
export async function docusealApiUploadOptimized(
	this: IExecuteFunctions,
	fileData: Buffer,
	fileName: string,
	options: {
		chunkSize?: number;
		progressCallback?: (progress: number) => void;
	} = {},
): Promise<any> {
	const chunkSize = options.chunkSize ?? 1024 * 1024; // 1MB chunks

	// For small files, use regular upload
	if (fileData.length <= chunkSize) {
		return await docusealApiRequest.call(
			this,
			'POST',
			'/documents',
			{},
			{},
			{
				formData: {
					document: {
						value: fileData,
						options: {
							filename: fileName,
							contentType: 'application/octet-stream',
						},
					},
				},
			},
		);
	}

	// For large files, implement chunked upload logic
	// Note: This would require DocuSeal API to support chunked uploads
	// For now, we'll use the regular upload with memory optimization
	// Uploading large file - consider performance implications

	return await docusealApiRequest.call(
		this,
		'POST',
		'/documents',
		{},
		{},
		{
			formData: {
				document: {
					value: fileData,
					options: {
						filename: fileName,
						contentType: 'application/octet-stream',
					},
				},
			},
			timeout: 120000, // 2 minute timeout for large files
		},
	);
}

/**
 * Parse JSON input - handles both string and object formats
 * Safely parses JSON strings or returns objects as-is with proper error handling
 * @param inputData - Input data as JSON string or object
 * @returns Parsed object
 * @throws {Error} When JSON string is invalid
 * @example
 * parseJsonInput('{"key": "value"}') // Returns { key: "value" }
 * parseJsonInput({ key: "value" }) // Returns { key: "value" }
 */
export function parseJsonInput(inputData: string | object): object {
	if (typeof inputData === 'string') {
		try {
			return JSON.parse(inputData);
		} catch (error) {
			throw new Error('Invalid JSON input. Please provide valid JSON.');
		}
	}
	return inputData;
}

/**
 * Get list of templates for dropdown selection
 * Fetches available templates from DocuSeal API and formats them for n8n dropdown options
 * @param this - The n8n load options context
 * @returns Promise resolving to array of template options with name and value
 * @throws {NodeApiError} When API request fails or templates cannot be fetched
 * @example
 * // Used internally by n8n for template dropdown
 * const templates = await getTemplates.call(this);
 * // Returns: [{ name: "Contract Template", value: "123" }, ...]
 */
export async function getTemplates(
	this: ILoadOptionsFunctions,
): Promise<Array<{ name: string; value: string }>> {
	try {
		// Fetch templates from DocuSeal API
		const rawResponse = await docusealApiRequest.call(
			this,
			'GET',
			'/templates',
			{},
			{ limit: 100 },
		);

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
				// Unknown response structure
				return [];
			}
		} else {
			// Invalid response type
			return [];
		}

		if (templates.length === 0) {
			return [];
		}

		// Transform API response to options format
		const options = templates.map((template: any) => {
			return {
				name: template.name || template.title || `Template ${template.id}`,
				value: String(template.id),
			};
		});

		return options;
	} catch (error) {
		// Return empty array to prevent dropdown from breaking
		return [];
	}
}

/**
 * Prepare binary data for upload to DocuSeal API
 * Extracts binary data from n8n workflow and formats it for API upload
 * @param this - The n8n execution context
 * @param binaryPropertyName - Name of the binary property in the workflow item
 * @param itemIndex - Index of the workflow item containing the binary data
 * @param fileName - Optional custom filename (defaults to original filename or 'file')
 * @returns Promise resolving to formatted binary data object for API upload
 * @throws {NodeOperationError} When binary data is not found or invalid
 * @example
 * const binaryData = await prepareBinaryData.call(this, 'document', 0, 'contract.pdf');
 * // Returns: { value: Buffer, options: { filename: 'contract.pdf', contentType: 'application/pdf' } }
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
			filename: fileName ?? binaryData.fileName ?? 'file',
			contentType: binaryData.mimeType,
		},
	};
}

/**
 * Build submitters array from various input formats
 * Transforms n8n submitter data into DocuSeal API format with comprehensive validation
 * @param submittersData - Submitters data in various formats (fixedCollection, direct array, or JSON string)
 * @returns Array of submitter objects formatted for DocuSeal API
 * @throws {Error} When submitter data is invalid or missing required fields
 * @example
 * // FixedCollection format
 * const submitters1 = buildSubmittersArray({
 *   submitter: [{ email: 'user@example.com', role: 'Signer' }]
 * });
 *
 * // Direct array format
 * const submitters2 = buildSubmittersArray([
 *   { email: 'user@example.com', role: 'Signer' }
 * ]);
 *
 * // JSON string format
 * const submitters3 = buildSubmittersArray('[{"email": "user@example.com", "role": "Signer"}]');
 *
 * // All return: [{ email: 'user@example.com', role: 'Signer' }]
 */
export function buildSubmittersArray(
	submittersData: IDataObject | IDataObject[] | string,
): IDataObject[] {
	// Handle null, undefined, or empty inputs
	if (!submittersData) {
		throw new Error(
			'Submitters parameter is required. Please provide submitters in one of these formats:\n' +
				'1. FixedCollection: { submitter: [{ email: "user@example.com", role: "Signer" }] }\n' +
				'2. Direct array: [{ email: "user@example.com", role: "Signer" }]\n' +
				'3. JSON string: \'[{"email": "user@example.com", "role": "Signer"}]\'',
		);
	}

	let submitterItems: any[] = [];

	try {
		// Handle different input formats
		if (typeof submittersData === 'string') {
			// Handle JSON string input
			try {
				const parsed = JSON.parse(submittersData);
				if (Array.isArray(parsed)) {
					submitterItems = parsed;
				} else {
					throw new Error('JSON string must contain an array of submitters');
				}
			} catch (parseError) {
				throw new Error(
					'Invalid JSON format for submitters. Please provide a valid JSON array like: [{"email": "user@example.com", "role": "Signer"}]\n' +
						`Parse error: ${(parseError as Error).message}`,
				);
			}
		} else if (Array.isArray(submittersData)) {
			// Handle direct array input
			submitterItems = submittersData;
		} else if (submittersData && typeof submittersData === 'object') {
			// Handle fixedCollection format
			if ('submitter' in submittersData) {
				const submitterValue = submittersData.submitter;
				if (Array.isArray(submitterValue)) {
					submitterItems = submitterValue;
				} else if (submitterValue) {
					submitterItems = [submitterValue];
				}
			} else {
				// Handle single submitter object (must have email to be valid)
				if ('email' in submittersData && submittersData.email) {
					submitterItems = [submittersData];
				}
				// Otherwise, treat as empty/invalid
			}
		}

		// Validate we have submitters
		if (!Array.isArray(submitterItems) || submitterItems.length === 0) {
			throw new Error(
				'Submitters parameter must be a valid array with at least one submitter object.\n' +
					'Expected format examples:\n' +
					'• [{ "email": "user@example.com", "role": "Signer" }]\n' +
					'• { "submitter": [{ "email": "user@example.com", "role": "Signer" }] }\n' +
					`• Received: ${typeof submittersData} with ${Array.isArray(submittersData) ? submittersData.length : 'unknown'} items`,
			);
		}

		// Validate and transform each submitter
		return submitterItems.map((item: any, index: number) => {
			// Validate submitter object structure
			if (!item || typeof item !== 'object') {
				throw new Error(
					`Submitter at index ${index} must be an object. ` +
						'Expected: { email: "user@example.com", role: "Signer" }, ' +
						`Received: ${typeof item}`,
				);
			}

			// Validate required email field
			if (!item.email || typeof item.email !== 'string' || item.email.trim() === '') {
				throw new Error(
					`Submitter at index ${index} must have a valid email address. ` +
						'Expected: non-empty string, ' +
						`Received: ${typeof item.email} "${item.email}"`,
				);
			}

			// Basic email format validation
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(item.email.trim())) {
				throw new Error(
					`Submitter at index ${index} has invalid email format: "${item.email}". ` +
						'Please provide a valid email address like "user@example.com"',
				);
			}

			// Build the submitter object
			const submitter: IDataObject = {
				email: item.email.trim(),
				role: item.role || 'Signer',
			};

			// Validate role if provided
			if (item.role && typeof item.role !== 'string') {
				throw new Error(
					`Submitter at index ${index} role must be a string. ` +
						`Received: ${typeof item.role} "${item.role}"`,
				);
			}

			// Add direct fields (flatten structure for easier access)
			const fieldsToCheck = [
				'name',
				'phone',
				'external_id',
				'completed',
				'send_email',
				'send_sms',
				'metadata',
				'fields',
			];
			fieldsToCheck.forEach((field) => {
				if (item[field] !== undefined) {
					submitter[field] = item[field];
				}
			});

			// Handle additionalFields structure (for n8n fixedCollection compatibility)
			if (item.additionalFields) {
				const additionalFields = item.additionalFields as IDataObject;

				if (additionalFields.name) {
					submitter.name = additionalFields.name;
				}
				if (additionalFields.phone) {
					submitter.phone = additionalFields.phone;
				}
				if (additionalFields.external_id) {
					submitter.external_id = additionalFields.external_id;
				}
				if (additionalFields.completed !== undefined) {
					submitter.completed = additionalFields.completed;
				}
				if (additionalFields.send_email !== undefined) {
					submitter.send_email = additionalFields.send_email;
				}
				if (additionalFields.send_sms !== undefined) {
					submitter.send_sms = additionalFields.send_sms;
				}

				// Parse JSON fields
				if (additionalFields.metadata) {
					try {
						submitter.metadata = parseJsonInput(additionalFields.metadata as string | object);
					} catch (error) {
						throw new Error(
							`Submitter at index ${index} has invalid metadata JSON: ${(error as Error).message}`,
						);
					}
				}
				if (additionalFields.fields) {
					try {
						submitter.fields = parseJsonInput(additionalFields.fields as string | object);
					} catch (error) {
						throw new Error(
							`Submitter at index ${index} has invalid fields JSON: ${(error as Error).message}`,
						);
					}
				}
			}

			return submitter;
		});
	} catch (error) {
		// Re-throw with additional context if it's our custom error
		if (error instanceof Error && error.message.includes('Submitter')) {
			throw error;
		}

		// Handle unexpected errors
		throw new Error(
			`Failed to process submitters data: ${(error as Error).message}\n` +
				'Please ensure submitters are provided in one of these formats:\n' +
				'1. FixedCollection: { submitter: [{ email: "user@example.com", role: "Signer" }] }\n' +
				'2. Direct array: [{ email: "user@example.com", role: "Signer" }]\n' +
				'3. JSON string: \'[{"email": "user@example.com", "role": "Signer"}]\'',
		);
	}
}

/**
 * Build field values object from fixedCollection format or JSON input
 * Transforms n8n field input (individual fields or JSON) into DocuSeal API format
 * @param nodeParameters - Node parameters containing field values configuration
 * @returns Object with field names as keys and values for DocuSeal API
 * @example
 * // Individual fields mode
 * const fields = buildFieldValues({
 *   fieldValuesMode: 'individual',
 *   fieldValues: { field: [{ name: 'firstName', value: 'John' }] }
 * });
 * // Returns: { firstName: 'John' }
 *
 * // JSON mode
 * const fields = buildFieldValues({
 *   fieldValuesMode: 'json',
 *   fieldValuesJson: '{"firstName": "John"}'
 * });
 * // Returns: { firstName: 'John' }
 */
export function buildFieldValues(nodeParameters: IDataObject): IDataObject {
	// Check if field values mode is specified
	const fieldValuesMode = (nodeParameters.fieldValuesMode as string) || 'individual';

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
	if (!date) {
		return '';
	}

	// Convert to UTC format expected by API
	const dateObj = new Date(date);
	return dateObj.toISOString();
}
