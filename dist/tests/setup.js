"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('n8n-workflow', () => ({
    NodeOperationError: class NodeOperationError extends Error {
        constructor(_node, error) {
            super(typeof error === 'string' ? error : error.message);
            this.name = 'NodeOperationError';
        }
    },
    NodeApiError: class NodeApiError extends Error {
        constructor(_node, error) {
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
jest.mock('n8n-core', () => ({}));
const originalConsole = { ...console };
beforeAll(() => {
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
    global.console = originalConsole;
});
global.testUtils = {
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
    createApiCredentials: () => ({
        productionApiKey: 'test-prod-key',
        testApiKey: 'test-dev-key',
        baseUrl: 'https://api.docuseal.co',
        environment: 'test',
    }),
    createMockTemplate: (overrides = {}) => ({
        id: 1,
        name: 'Test Template',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        fields: [],
        documents: [],
        ...overrides,
    }),
    createMockSubmission: (overrides = {}) => ({
        id: 1,
        template_id: 1,
        status: 'pending',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        submitters: [],
        ...overrides,
    }),
    createMockSubmitter: (overrides = {}) => ({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'signer',
        completed: false,
        ...overrides,
    }),
    createApiResponse: (data, status = 200) => ({
        status,
        data,
        headers: {
            'content-type': 'application/json',
        },
    }),
    createApiError: (message, status = 400) => {
        const error = new Error(message);
        error.response = {
            status,
            data: { error: message },
        };
        return error;
    },
    wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    random: {
        email: () => `test${Math.random().toString(36).substr(2, 9)}@example.com`,
        string: (length = 10) => Math.random().toString(36).substr(2, length),
        number: (min = 1, max = 1000) => Math.floor(Math.random() * (max - min + 1)) + min,
        boolean: () => Math.random() > 0.5,
        date: () => new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
};
expect.extend({
    toBeValidEmail(received) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const pass = emailRegex.test(received);
        return {
            message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid email`,
            pass,
        };
    },
    toBeValidUrl(received) {
        try {
            new URL(received);
            return {
                message: () => `expected ${received} not to be a valid URL`,
                pass: true,
            };
        }
        catch {
            return {
                message: () => `expected ${received} to be a valid URL`,
                pass: false,
            };
        }
    },
    toBeValidApiResponse(received) {
        const hasStatus = typeof received?.status === 'number';
        const hasData = received?.data !== undefined;
        const pass = hasStatus && hasData;
        return {
            message: () => `expected ${JSON.stringify(received)} ${pass ? 'not ' : ''}to be a valid API response`,
            pass,
        };
    },
    toHaveValidStructure(received, expected) {
        const checkStructure = (obj, structure) => {
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
            message: () => `expected ${JSON.stringify(received)} ${pass ? 'not ' : ''}to have structure ${JSON.stringify(expected)}`,
            pass,
        };
    },
});
jest.setTimeout(30000);
process.env.NODE_ENV = 'test';
process.env.DOCUSEAL_API_BASE_URL = 'https://api.docuseal.co';
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});
afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.clearAllTimers();
});
//# sourceMappingURL=setup.js.map