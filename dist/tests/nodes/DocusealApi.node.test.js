"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const DocusealApi_node_1 = require("../../nodes/Docuseal/DocusealApi.node");
const GenericFunctions = __importStar(require("../../nodes/Docuseal/GenericFunctions"));
jest.mock('../../nodes/Docuseal/GenericFunctions');
describe('DocusealApi.node', () => {
    let docusealApi;
    let mockExecuteFunctions;
    let mockLoadOptionsFunctions;
    beforeEach(() => {
        docusealApi = new DocusealApi_node_1.DocusealApi();
        mockExecuteFunctions = {
            getInputData: jest.fn().mockReturnValue([{ json: {} }]),
            getNodeParameter: jest.fn(),
            getCredentials: jest.fn().mockResolvedValue({
                environment: 'production',
                productionApiKey: 'test-api-key',
                testApiKey: 'test-api-key-sandbox',
                baseUrl: 'https://api.docuseal.com',
            }),
            getNode: jest.fn().mockReturnValue({ name: 'DocuSeal Test' }),
            continueOnFail: jest.fn().mockReturnValue(false),
            helpers: {
                request: jest.fn().mockResolvedValue({ success: true }),
                returnJsonArray: jest
                    .fn()
                    .mockImplementation((data) => (Array.isArray(data) ? data : [data])),
                constructExecutionMetaData: jest
                    .fn()
                    .mockImplementation((data, _metadata) => data.map ? data.map((item) => ({ json: item })) : [{ json: data }]),
            },
        };
        mockLoadOptionsFunctions = {
            getCredentials: jest.fn().mockResolvedValue({
                environment: 'production',
                productionApiKey: 'test-api-key',
                testApiKey: 'test-api-key-sandbox',
                baseUrl: 'https://api.docuseal.com',
            }),
            getNode: jest.fn().mockReturnValue({ name: 'DocuSeal Test' }),
            helpers: {
                request: jest.fn().mockResolvedValue({ success: true }),
                returnJsonArray: jest
                    .fn()
                    .mockImplementation((data) => (Array.isArray(data) ? data : [data])),
                constructExecutionMetaData: jest
                    .fn()
                    .mockImplementation((data, _metadata) => data.map ? data.map((item) => ({ json: item })) : [{ json: data }]),
            },
        };
        jest.clearAllMocks();
    });
    describe('Node Description', () => {
        it('should have correct basic properties', () => {
            expect(docusealApi.description.displayName).toBe('DocuSeal');
            expect(docusealApi.description.name).toBe('docusealApi');
            expect(docusealApi.description.group).toEqual(['transform']);
            expect(docusealApi.description.version).toBe(1);
        });
        it('should have correct credentials configuration', () => {
            expect(docusealApi.description.credentials).toEqual([
                {
                    name: 'docusealApi',
                    required: true,
                },
            ]);
        });
        it('should have all required resources', () => {
            const resourceProperty = docusealApi.description.properties?.find((prop) => prop.name === 'resource');
            expect(resourceProperty).toBeDefined();
            expect(resourceProperty.options).toHaveLength(4);
            const resourceValues = resourceProperty.options.map((opt) => opt.value);
            expect(['form', 'submission', 'submitter', 'template']).toEqual(expect.arrayContaining(resourceValues));
        });
    });
    describe('Load Options Methods', () => {
        it('should have getTemplates method', () => {
            expect(docusealApi.methods?.loadOptions?.getTemplates).toBeDefined();
            expect(typeof docusealApi.methods?.loadOptions?.getTemplates).toBe('function');
        });
        it('should call getTemplates from GenericFunctions', async () => {
            const mockGetTemplates = jest
                .spyOn(GenericFunctions, 'getTemplates')
                .mockResolvedValue([{ name: 'Template 1', value: '1' }]);
            const result = await docusealApi.methods?.loadOptions?.getTemplates?.call(mockLoadOptionsFunctions);
            expect(mockGetTemplates).toHaveBeenCalled();
            expect(result).toEqual([{ name: 'Template 1', value: '1' }]);
        });
        it('should return empty array on error', async () => {
            jest.spyOn(GenericFunctions, 'getTemplates').mockRejectedValue(new Error('API Error'));
            const result = await docusealApi.methods?.loadOptions?.getTemplates?.call(mockLoadOptionsFunctions);
            expect(result).toEqual([]);
        });
    });
    describe('Execute Method - Template Operations', () => {
        it('should get template by ID', async () => {
            const mockDocusealApiRequest = jest
                .spyOn(GenericFunctions, 'docusealApiRequest')
                .mockResolvedValue({ id: 1, name: 'Test Template' });
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('template')
                .mockReturnValueOnce('get')
                .mockReturnValueOnce(1);
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(mockDocusealApiRequest).toHaveBeenCalledWith('GET', '/templates/1');
            expect(result[0]).toHaveLength(1);
            expect(result[0]?.[0]?.json).toEqual({ id: 1, name: 'Test Template' });
        });
        it('should get many templates with returnAll', async () => {
            const mockDocusealApiRequestAllItems = jest
                .spyOn(GenericFunctions, 'docusealApiRequestAllItems')
                .mockResolvedValue([
                { id: 1, name: 'Template 1' },
                { id: 2, name: 'Template 2' },
            ]);
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('template')
                .mockReturnValueOnce('getMany')
                .mockReturnValueOnce(true)
                .mockReturnValueOnce({})
                .mockReturnValueOnce({});
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(mockDocusealApiRequestAllItems).toHaveBeenCalledWith('GET', '/templates', {}, {}, {
                batchSize: 100,
                maxItems: 10000,
                memoryOptimized: false,
            });
            expect(result[0]).toHaveLength(2);
            expect(result[0]?.[0]?.json).toEqual({ id: 1, name: 'Template 1' });
            expect(result[0]?.[1]?.json).toEqual({ id: 2, name: 'Template 2' });
        });
        it('should get limited templates without returnAll', async () => {
            const mockDocusealApiRequest = jest
                .spyOn(GenericFunctions, 'docusealApiRequest')
                .mockResolvedValue([{ id: 1, name: 'Template 1' }]);
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('template')
                .mockReturnValueOnce('getMany')
                .mockReturnValueOnce(false)
                .mockReturnValueOnce({})
                .mockReturnValueOnce(10);
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(mockDocusealApiRequest).toHaveBeenCalledWith('GET', '/templates', {}, { limit: 10 });
            expect(result[0]).toHaveLength(1);
        });
    });
    describe('Execute Method - Submission Operations', () => {
        it('should create submission', async () => {
            const mockDocusealApiRequest = jest
                .spyOn(GenericFunctions, 'docusealApiRequest')
                .mockResolvedValue({ id: 1, status: 'pending' });
            const mockBuildSubmittersArray = jest
                .spyOn(GenericFunctions, 'buildSubmittersArray')
                .mockReturnValue([{ email: 'test@example.com' }]);
            const mockBuildFieldValues = jest
                .spyOn(GenericFunctions, 'buildFieldValues')
                .mockReturnValue({});
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('submission')
                .mockReturnValueOnce('create')
                .mockReturnValueOnce(1)
                .mockReturnValueOnce([{ email: 'test@example.com' }])
                .mockReturnValueOnce({})
                .mockReturnValue({});
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(mockBuildSubmittersArray).toHaveBeenCalled();
            expect(mockBuildFieldValues).toHaveBeenCalled();
            expect(mockDocusealApiRequest).toHaveBeenCalledWith('POST', '/submissions', expect.objectContaining({
                template_id: 1,
                submitters: [{ email: 'test@example.com' }],
            }));
            expect(result[0]?.[0]?.json).toEqual({ id: 1, status: 'pending' });
        });
        it('should get submission by ID', async () => {
            const mockDocusealApiRequest = jest
                .spyOn(GenericFunctions, 'docusealApiRequest')
                .mockResolvedValue({ id: 1, status: 'completed' });
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('submission')
                .mockReturnValueOnce('get')
                .mockReturnValueOnce(1);
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(mockDocusealApiRequest).toHaveBeenCalledWith('GET', '/submissions/1');
            expect(result[0]?.[0]?.json).toEqual({ id: 1, status: 'completed' });
        });
    });
    describe('Execute Method - Submitter Operations', () => {
        it('should get submitter by ID', async () => {
            const mockDocusealApiRequest = jest
                .spyOn(GenericFunctions, 'docusealApiRequest')
                .mockResolvedValue({ id: 1, email: 'test@example.com' });
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('submitter')
                .mockReturnValueOnce('get')
                .mockReturnValueOnce(1);
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(mockDocusealApiRequest).toHaveBeenCalledWith('GET', '/submitters/1');
            expect(result[0]?.[0]?.json).toEqual({ id: 1, email: 'test@example.com' });
        });
        it('should update submitter', async () => {
            const mockDocusealApiRequest = jest
                .spyOn(GenericFunctions, 'docusealApiRequest')
                .mockResolvedValue({ id: 1, email: 'updated@example.com' });
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('submitter')
                .mockReturnValueOnce('update')
                .mockReturnValueOnce(1)
                .mockReturnValueOnce({ email: 'updated@example.com' })
                .mockReturnValueOnce({})
                .mockReturnValueOnce({});
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(mockDocusealApiRequest).toHaveBeenCalledWith('PUT', '/submitters/1', {
                email: 'updated@example.com',
            });
            expect(result[0]?.[0]?.json).toEqual({ id: 1, email: 'updated@example.com' });
        });
    });
    describe('Execute Method - Form Operations', () => {
        it('should get form started events', async () => {
            const mockDocusealApiRequest = jest
                .spyOn(GenericFunctions, 'docusealApiRequest')
                .mockResolvedValue([{ id: 1, event: 'form_started', timestamp: '2023-01-01T00:00:00Z' }]);
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('form')
                .mockReturnValueOnce('getStarted')
                .mockReturnValueOnce(1);
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(mockDocusealApiRequest).toHaveBeenCalledWith('GET', '/submitters/1/form_started');
            expect(result).toHaveLength(1);
            expect(result[0]).toHaveLength(1);
            expect(result[0]?.[0]).toHaveProperty('json');
            expect(result[0]?.[0]?.json).toEqual({
                id: 1,
                event: 'form_started',
                timestamp: '2023-01-01T00:00:00Z',
            });
        });
    });
    describe('Error Handling', () => {
        it('should handle errors gracefully', async () => {
            jest.spyOn(GenericFunctions, 'docusealApiRequest').mockRejectedValue(new Error('API Error'));
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('template')
                .mockReturnValueOnce('get')
                .mockReturnValueOnce(1);
            await expect(docusealApi.execute.call(mockExecuteFunctions)).rejects.toThrow('API Error');
        });
        it('should handle multiple items', async () => {
            jest
                .spyOn(GenericFunctions, 'docusealApiRequest')
                .mockResolvedValueOnce({ id: 1, name: 'Template 1' })
                .mockResolvedValueOnce({ id: 2, name: 'Template 2' });
            mockExecuteFunctions.getInputData.mockReturnValue([
                { json: {} },
                { json: {} },
            ]);
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('template')
                .mockReturnValueOnce('get')
                .mockReturnValueOnce(1)
                .mockReturnValueOnce('template')
                .mockReturnValueOnce('get')
                .mockReturnValueOnce(2);
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(result[0]).toHaveLength(2);
            expect(result[0]?.[0]?.json).toEqual({ id: 1, name: 'Template 1' });
            expect(result[0]?.[1]?.json).toEqual({ id: 2, name: 'Template 2' });
        });
    });
});
//# sourceMappingURL=DocusealApi.node.test.js.map