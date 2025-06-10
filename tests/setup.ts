/**
 * Enhanced Jest setup file for n8n DocuSeal node tests
 * Provides comprehensive test utilities, mocks, and custom matchers
 */

// Make this file a module
export {};

// Extend Jest matchers
declare global {
	interface Matchers<R> {
		toBeValidEmail(): R;
		toBeValidUrl(): R;
		toBeValidApiResponse(): R;
		toHaveValidStructure(expected: object): R;
	}
}

declare global {
	const testUtils: {
		createWorkflowContext: () => any;
		createApiCredentials: () => any;
		createMockTemplate: (overrides?: object) => any;
		createMockSubmission: (overrides?: object) => any;
		createMockSubmitter: (overrides?: object) => any;
		createApiResponse: <T>(data: T, status?: number) => any;
		createApiError: (message: string, status?: number) => any;
		wait: (ms: number) => Promise<void>;
		random: {
			email: () => string;
			string: (length?: number) => string;
			number: (min?: number, max?: number) => number;
			boolean: () => boolean;
			date: () => string;
		};
	};
}

// Mock n8n workflow types and functions
jest.mock('n8n-workflow', () => ({
	NodeOperationError: class NodeOperationError extends Error {
		constructor(_node: any, error: string | Error) {
			super(typeof error === 'string' ? error : error.message);
			this.name = 'NodeOperationError';
		}
	},
	NodeApiError: class NodeApiError extends Error {
		constructor(_node: any, error: any) {
			super(error.message || 'API Error');
			this.name = 'NodeApiError';
		}
	},
	IExecuteFunctions: {},
	ICredentialsDecryptedDb: {},
	ICredentialTestFunctions: {},
	INodeExecutionData: {},
	INodeType: {},
	INodeTypeDescription: {},
	IWebhookFunctions: {},
	IHookFunctions: {},
}));

// Mock n8n-core
jest.mock('n8n-core', () => ({
	// Add any n8n-core mocks if needed
}));

// Global test configuration
const originalConsole = { ...console };

beforeAll(() => {
	// Mock console methods but allow them to be restored
	global.console = {
		...console,
		log: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
		info: jest.fn(),
		debug: jest.fn(),
	};
});

afterAll(() => {
	// Restore original console
	global.console = originalConsole;
});

// Global test utilities
(global as any).testUtils = {
	/**
	 * Create a mock n8n workflow context
	 */
	createWorkflowContext: () => ({
		getNodeParameter: jest.fn(),
		getCredentials: jest.fn(),
		getInputData: jest.fn(),
		helpers: {
			request: jest.fn(),
			requestWithAuthentication: jest.fn(),
			prepareBinaryData: jest.fn(),
		},
	}),

	/**
	 * Create mock DocuSeal API credentials
	 */
	createApiCredentials: () => ({
		productionApiKey: 'test-prod-key',
		testApiKey: 'test-dev-key',
		baseUrl: 'https://api.docuseal.co',
		environment: 'test' as const,
	}),

	/**
	 * Create mock template data
	 */
	createMockTemplate: (overrides = {}) => ({
		id: 1,
		name: 'Test Template',
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
		fields: [],
		documents: [],
		...overrides,
	}),

	/**
	 * Create mock submission data
	 */
	createMockSubmission: (overrides = {}) => ({
		id: 1,
		template_id: 1,
		status: 'pending' as const,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
		submitters: [],
		...overrides,
	}),

	/**
	 * Create mock submitter data
	 */
	createMockSubmitter: (overrides = {}) => ({
		id: 1,
		email: 'test@example.com',
		name: 'Test User',
		role: 'signer',
		completed: false,
		...overrides,
	}),

	/**
	 * Create mock API response
	 */
	createApiResponse: <T>(data: T, status = 200) => ({
		status,
		data,
		headers: {
			'content-type': 'application/json',
		},
	}),

	/**
	 * Create mock API error response
	 */
	createApiError: (message: string, status = 400) => {
		const error = new Error(message) as any;
		error.response = {
			status,
			data: { error: message },
		};
		return error;
	},

	/**
	 * Wait for a specified amount of time
	 */
	wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

	/**
	 * Generate random test data
	 */
	random: {
		email: () => `test${Math.random().toString(36).substr(2, 9)}@example.com`,
		string: (length = 10) => Math.random().toString(36).substr(2, length),
		number: (min = 1, max = 1000) => Math.floor(Math.random() * (max - min + 1)) + min,
		boolean: () => Math.random() > 0.5,
		date: () => new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
	},
};

// Custom Jest matchers
expect.extend({
	/**
	 * Check if a string is a valid email
	 */
	toBeValidEmail(received: string) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const pass = emailRegex.test(received);
		return {
			message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid email`,
			pass,
		};
	},

	/**
	 * Check if a string is a valid URL
	 */
	toBeValidUrl(received: string) {
		try {
			new URL(received);
			return {
				message: () => `expected ${received} not to be a valid URL`,
				pass: true,
			};
		} catch {
			return {
				message: () => `expected ${received} to be a valid URL`,
				pass: false,
			};
		}
	},

	/**
	 * Check if an object is a valid API response
	 */
	toBeValidApiResponse(received: any) {
		const hasStatus = typeof received?.status === 'number';
		const hasData = received?.data !== undefined;
		const pass = hasStatus && hasData;
		return {
			message: () =>
				`expected ${JSON.stringify(received)} ${pass ? 'not ' : ''}to be a valid API response`,
			pass,
		};
	},

	/**
	 * Check if an object has the expected structure
	 */
	toHaveValidStructure(received: any, expected: object) {
		const checkStructure = (obj: any, structure: any): boolean => {
			if (typeof structure !== 'object' || structure === null) {
				return typeof obj === typeof structure;
			}

			for (const key in structure) {
				if (!(key in obj)) {
					return false;
				}
				if (!checkStructure(obj[key], structure[key])) {
					return false;
				}
			}
			return true;
		};

		const pass = checkStructure(received, expected);
		return {
			message: () =>
				`expected ${JSON.stringify(received)} ${
					pass ? 'not ' : ''
				}to have structure ${JSON.stringify(expected)}`,
			pass,
		};
	},
});

// Set enhanced test timeout
jest.setTimeout(30000);

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DOCUSEAL_API_BASE_URL = 'https://api.docuseal.co';

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
	console.error('Uncaught Exception:', error);
});

// Enhanced cleanup after each test
afterEach(() => {
	// Clear all mocks
	jest.clearAllMocks();

	// Reset modules
	jest.resetModules();

	// Clear any timers
	jest.clearAllTimers();
});
