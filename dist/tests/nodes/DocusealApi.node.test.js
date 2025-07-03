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
            expect(resourceProperty.options).toHaveLength(5);
            const resourceValues = resourceProperty.options.map((opt) => opt.value);
            expect(['aiTool', 'form', 'submission', 'submitter', 'template']).toEqual(expect.arrayContaining(resourceValues));
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
        it('should get many templates with limit', async () => {
            const mockDocusealApiRequest = jest
                .spyOn(GenericFunctions, 'docusealApiRequest')
                .mockResolvedValue([
                { id: 1, name: 'Template 1' },
                { id: 2, name: 'Template 2' },
            ]);
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('template')
                .mockReturnValueOnce('getMany')
                .mockReturnValueOnce({})
                .mockReturnValueOnce(50);
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(mockDocusealApiRequest).toHaveBeenCalledWith('GET', '/templates', {}, { limit: 50 });
            expect(result[0]).toHaveLength(2);
            expect(result[0]?.[0]?.json).toEqual({ id: 1, name: 'Template 1' });
            expect(result[0]?.[1]?.json).toEqual({ id: 2, name: 'Template 2' });
        });
        it('should create template from PDF with binary data', async () => {
            const mockDocusealApiRequest = jest
                .spyOn(GenericFunctions, 'docusealApiRequest')
                .mockResolvedValue({ id: 1, name: 'PDF Template' });
            const mockPrepareBinaryData = jest
                .spyOn(GenericFunctions, 'prepareBinaryData')
                .mockResolvedValue(Buffer.from('pdf data'));
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('template')
                .mockReturnValueOnce('createFromPdf')
                .mockReturnValueOnce('Test PDF Template')
                .mockReturnValueOnce('binary')
                .mockReturnValueOnce({})
                .mockReturnValueOnce('data');
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(mockPrepareBinaryData).toHaveBeenCalledWith('data', 0);
            expect(mockDocusealApiRequest).toHaveBeenCalledWith('POST', '/templates/pdf', {}, {}, expect.objectContaining({ formData: expect.any(Object) }));
            expect(result[0]?.[0]?.json).toEqual({ id: 1, name: 'PDF Template' });
        });
        it('should create template from PDF with URL', async () => {
            const mockDocusealApiRequest = jest
                .spyOn(GenericFunctions, 'docusealApiRequest')
                .mockResolvedValue({ id: 1, name: 'PDF Template' });
            const mockValidateUrl = jest
                .spyOn(GenericFunctions, 'validateUrl')
                .mockReturnValue({ isValid: true });
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('template')
                .mockReturnValueOnce('createFromPdf')
                .mockReturnValueOnce('Test PDF Template')
                .mockReturnValueOnce('url')
                .mockReturnValueOnce({})
                .mockReturnValueOnce('https://example.com/test.pdf');
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(mockValidateUrl).toHaveBeenCalledWith('https://example.com/test.pdf');
            expect(mockDocusealApiRequest).toHaveBeenCalledWith('POST', '/templates/pdf', {}, {}, expect.objectContaining({ formData: expect.any(Object) }));
            expect(result[0]?.[0]?.json).toEqual({ id: 1, name: 'PDF Template' });
        });
        it('should create template from HTML', async () => {
            const mockDocusealApiRequest = jest
                .spyOn(GenericFunctions, 'docusealApiRequest')
                .mockResolvedValue({ id: 1, name: 'HTML Template' });
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('template')
                .mockReturnValueOnce('createFromHtml')
                .mockReturnValueOnce('Test HTML Template')
                .mockReturnValueOnce('<html><body>Test</body></html>')
                .mockReturnValueOnce({});
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(mockDocusealApiRequest).toHaveBeenCalledWith('POST', '/templates/html', expect.objectContaining({
                name: 'Test HTML Template',
                html: '<html><body>Test</body></html>',
            }));
            expect(result[0]?.[0]?.json).toEqual({ id: 1, name: 'HTML Template' });
        });
        it('should clone template', async () => {
            const mockDocusealApiRequest = jest
                .spyOn(GenericFunctions, 'docusealApiRequest')
                .mockResolvedValue({ id: 2, name: 'Cloned Template' });
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('template')
                .mockReturnValueOnce('clone')
                .mockReturnValueOnce(1)
                .mockReturnValueOnce('Cloned Template')
                .mockReturnValueOnce({});
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(mockDocusealApiRequest).toHaveBeenCalledWith('POST', '/templates/1/clone', expect.objectContaining({ name: 'Cloned Template' }));
            expect(result[0]?.[0]?.json).toEqual({ id: 2, name: 'Cloned Template' });
        });
        it('should merge templates', async () => {
            const mockDocusealApiRequest = jest
                .spyOn(GenericFunctions, 'docusealApiRequest')
                .mockResolvedValue({ id: 3, name: 'Merged Template' });
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('template')
                .mockReturnValueOnce('merge')
                .mockReturnValueOnce('1,2')
                .mockReturnValueOnce('Merged Template');
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(mockDocusealApiRequest).toHaveBeenCalledWith('POST', '/templates/merge', expect.objectContaining({
                template_ids: [1, 2],
                name: 'Merged Template',
            }));
            expect(result[0]?.[0]?.json).toEqual({ id: 3, name: 'Merged Template' });
        });
        it('should update template', async () => {
            const mockDocusealApiRequest = jest
                .spyOn(GenericFunctions, 'docusealApiRequest')
                .mockResolvedValue({ id: 1, name: 'Updated Template' });
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('template')
                .mockReturnValueOnce('update')
                .mockReturnValueOnce(1)
                .mockReturnValueOnce({ name: 'Updated Template' });
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(mockDocusealApiRequest).toHaveBeenCalledWith('PUT', '/templates/1', expect.objectContaining({ name: 'Updated Template' }));
            expect(result[0]?.[0]?.json).toEqual({ id: 1, name: 'Updated Template' });
        });
        it('should archive template', async () => {
            const mockDocusealApiRequest = jest
                .spyOn(GenericFunctions, 'docusealApiRequest')
                .mockResolvedValue({ success: true });
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('template')
                .mockReturnValueOnce('archive')
                .mockReturnValueOnce(1);
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(mockDocusealApiRequest).toHaveBeenCalledWith('DELETE', '/templates/1');
            expect(result[0]?.[0]?.json).toEqual({ success: true });
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
        it('should get submission documents', async () => {
            const mockDocusealApiRequest = jest
                .spyOn(GenericFunctions, 'docusealApiRequest')
                .mockResolvedValue([{ id: 1, filename: 'document.pdf' }]);
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('submission')
                .mockReturnValueOnce('getDocuments')
                .mockReturnValueOnce(1);
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(mockDocusealApiRequest).toHaveBeenCalledWith('GET', '/submissions/1/documents');
            expect(result[0]?.[0]?.json).toEqual({ id: 1, filename: 'document.pdf' });
        });
        it('should get many submissions with filters', async () => {
            const mockDocusealApiRequest = jest
                .spyOn(GenericFunctions, 'docusealApiRequest')
                .mockResolvedValue([
                { id: 1, status: 'completed' },
                { id: 2, status: 'pending' },
            ]);
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('submission')
                .mockReturnValueOnce('getMany')
                .mockReturnValueOnce({ status: ['completed', 'pending'] })
                .mockReturnValueOnce(50);
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(mockDocusealApiRequest).toHaveBeenCalledWith('GET', '/submissions', {}, expect.objectContaining({
                status: 'completed,pending',
                limit: 50,
            }));
            expect(result[0]).toHaveLength(2);
        });
        it('should create submission from PDF', async () => {
            const mockDocusealApiRequest = jest
                .spyOn(GenericFunctions, 'docusealApiRequest')
                .mockResolvedValue({ id: 1, status: 'pending' });
            const mockBuildSubmittersArray = jest
                .spyOn(GenericFunctions, 'buildSubmittersArray')
                .mockReturnValue([{ email: 'test@example.com' }]);
            const mockPrepareBinaryData = jest
                .spyOn(GenericFunctions, 'prepareBinaryData')
                .mockResolvedValue(Buffer.from('pdf data'));
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('submission')
                .mockReturnValueOnce('createFromPdf')
                .mockReturnValueOnce('binary')
                .mockReturnValueOnce([{ email: 'test@example.com' }])
                .mockReturnValueOnce({})
                .mockReturnValueOnce('data');
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(mockBuildSubmittersArray).toHaveBeenCalled();
            expect(mockPrepareBinaryData).toHaveBeenCalledWith('data', 0);
            expect(mockDocusealApiRequest).toHaveBeenCalledWith('POST', '/submissions/pdf', {}, {}, expect.objectContaining({ formData: expect.any(Object) }));
            expect(result[0]?.[0]?.json).toEqual({ id: 1, status: 'pending' });
        });
        it('should create submission from HTML', async () => {
            const mockDocusealApiRequest = jest
                .spyOn(GenericFunctions, 'docusealApiRequest')
                .mockResolvedValue({ id: 1, status: 'pending' });
            const mockBuildSubmittersArray = jest
                .spyOn(GenericFunctions, 'buildSubmittersArray')
                .mockReturnValue([{ email: 'test@example.com' }]);
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('submission')
                .mockReturnValueOnce('createFromHtml')
                .mockReturnValueOnce('<html><body>Document</body></html>')
                .mockReturnValueOnce([{ email: 'test@example.com' }])
                .mockReturnValueOnce({});
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(mockBuildSubmittersArray).toHaveBeenCalled();
            expect(mockDocusealApiRequest).toHaveBeenCalledWith('POST', '/submissions/html', expect.objectContaining({
                html: '<html><body>Document</body></html>',
                submitters: [{ email: 'test@example.com' }],
            }));
            expect(result[0]?.[0]?.json).toEqual({ id: 1, status: 'pending' });
        });
        it('should archive submission', async () => {
            const mockDocusealApiRequest = jest
                .spyOn(GenericFunctions, 'docusealApiRequest')
                .mockResolvedValue({ success: true });
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('submission')
                .mockReturnValueOnce('archive')
                .mockReturnValueOnce(1);
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(mockDocusealApiRequest).toHaveBeenCalledWith('DELETE', '/submissions/1');
            expect(result[0]?.[0]?.json).toEqual({ success: true });
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
        it('should get many submitters with filters', async () => {
            const mockDocusealApiRequest = jest
                .spyOn(GenericFunctions, 'docusealApiRequest')
                .mockResolvedValue([
                { id: 1, email: 'user1@example.com' },
                { id: 2, email: 'user2@example.com' },
            ]);
            const mockFormatDate = jest
                .spyOn(GenericFunctions, 'formatDate')
                .mockReturnValue('2023-01-01T00:00:00Z');
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('submitter')
                .mockReturnValueOnce('getMany')
                .mockReturnValueOnce({ completed_after: '2023-01-01' })
                .mockReturnValueOnce(50);
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(mockFormatDate).toHaveBeenCalledWith('2023-01-01');
            expect(mockDocusealApiRequest).toHaveBeenCalledWith('GET', '/submitters', {}, expect.objectContaining({
                completed_after: '2023-01-01T00:00:00Z',
                limit: 50,
            }));
            expect(result[0]).toHaveLength(2);
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
        it('should get form viewed events', async () => {
            const mockDocusealApiRequest = jest
                .spyOn(GenericFunctions, 'docusealApiRequest')
                .mockResolvedValue([{ id: 1, event: 'form_viewed', timestamp: '2023-01-01T00:00:00Z' }]);
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('form')
                .mockReturnValueOnce('getViewed')
                .mockReturnValueOnce(1);
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(mockDocusealApiRequest).toHaveBeenCalledWith('GET', '/submitters/1/form_viewed');
            expect(result).toHaveLength(1);
            expect(result[0]).toHaveLength(1);
            expect(result[0]?.[0]?.json).toEqual({
                id: 1,
                event: 'form_viewed',
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
        it('should handle continueOnFail errors', async () => {
            jest.spyOn(GenericFunctions, 'docusealApiRequest').mockRejectedValue(new Error('API Error'));
            mockExecuteFunctions.continueOnFail.mockReturnValue(true);
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('template')
                .mockReturnValueOnce('get')
                .mockReturnValueOnce(1);
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(result[0]).toHaveLength(1);
            expect(result[0]?.[0]?.json).toEqual({ error: 'API Error' });
        });
        it('should validate URL for template creation', async () => {
            const mockValidateUrl = jest
                .spyOn(GenericFunctions, 'validateUrl')
                .mockReturnValue({ isValid: false, message: 'Invalid URL format' });
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('template')
                .mockReturnValueOnce('createFromPdf')
                .mockReturnValueOnce('Test Template')
                .mockReturnValueOnce('url')
                .mockReturnValueOnce({})
                .mockReturnValueOnce('invalid-url');
            await expect(docusealApi.execute.call(mockExecuteFunctions)).rejects.toThrow('Invalid file URL: Invalid URL format');
            expect(mockValidateUrl).toHaveBeenCalledWith('invalid-url');
        });
        it('should handle template update with no fields', async () => {
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('template')
                .mockReturnValueOnce('update')
                .mockReturnValueOnce(1)
                .mockReturnValueOnce({});
            await expect(docusealApi.execute.call(mockExecuteFunctions)).rejects.toThrow('At least one field must be updated');
        });
        it('should handle submitter update with no fields', async () => {
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('submitter')
                .mockReturnValueOnce('update')
                .mockReturnValueOnce(1)
                .mockReturnValueOnce({})
                .mockReturnValueOnce({})
                .mockReturnValueOnce({});
            await expect(docusealApi.execute.call(mockExecuteFunctions)).rejects.toThrow('At least one field must be updated');
        });
        it('should handle submission creation with no submitters', async () => {
            const mockBuildSubmittersArray = jest
                .spyOn(GenericFunctions, 'buildSubmittersArray')
                .mockReturnValue([]);
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('submission')
                .mockReturnValueOnce('create')
                .mockReturnValueOnce(1)
                .mockReturnValueOnce({})
                .mockReturnValueOnce({});
            await expect(docusealApi.execute.call(mockExecuteFunctions)).rejects.toThrow('At least one submitter is required');
            expect(mockBuildSubmittersArray).toHaveBeenCalled();
        });
    });
    describe('Additional Coverage Tests', () => {
        it('should handle submission creation with all options', async () => {
            const mockDocusealApiRequest = jest
                .spyOn(GenericFunctions, 'docusealApiRequest')
                .mockResolvedValue({ id: 1, status: 'pending' });
            const mockBuildSubmittersArray = jest
                .spyOn(GenericFunctions, 'buildSubmittersArray')
                .mockReturnValue([{ email: 'test@example.com' }]);
            const mockBuildFieldValues = jest
                .spyOn(GenericFunctions, 'buildFieldValues')
                .mockReturnValue({ field1: 'value1' });
            const mockParseJsonInput = jest
                .spyOn(GenericFunctions, 'parseJsonInput')
                .mockReturnValue({ meta: 'data' });
            const mockFormatDate = jest
                .spyOn(GenericFunctions, 'formatDate')
                .mockReturnValue('2023-12-31T23:59:59Z');
            mockExecuteFunctions.getNodeParameter
                .mockReturnValueOnce('submission')
                .mockReturnValueOnce('create')
                .mockReturnValueOnce(1)
                .mockReturnValueOnce([{ email: 'test@example.com' }])
                .mockReturnValueOnce({
                bcc_completed: 'admin@example.com',
                reply_to: 'noreply@example.com',
                completed_redirect_url: 'https://example.com/completed',
                expire_at: '2023-12-31',
                external_id: 'ext123',
                message: { messageFields: { subject: 'Please sign' } },
                metadata: '{"key": "value"}',
                order: 'sequential',
                send_email: true,
                send_sms: false,
            })
                .mockReturnValue({});
            const result = await docusealApi.execute.call(mockExecuteFunctions);
            expect(mockBuildSubmittersArray).toHaveBeenCalled();
            expect(mockBuildFieldValues).toHaveBeenCalled();
            expect(mockParseJsonInput).toHaveBeenCalledWith('{"key": "value"}');
            expect(mockFormatDate).toHaveBeenCalledWith('2023-12-31');
            expect(mockDocusealApiRequest).toHaveBeenCalledWith('POST', '/submissions', expect.objectContaining({
                template_id: 1,
                submitters: [{ email: 'test@example.com' }],
                values: { field1: 'value1' },
                preferences: {
                    bcc_completed: 'admin@example.com',
                    reply_to: 'noreply@example.com',
                },
                completed_redirect_url: 'https://example.com/completed',
                expire_at: '2023-12-31T23:59:59Z',
                external_id: 'ext123',
                message: { subject: 'Please sign' },
                metadata: { meta: 'data' },
                order: 'sequential',
                send_email: true,
                send_sms: false,
            }));
            expect(result[0]?.[0]?.json).toEqual({ id: 1, status: 'pending' });
        });
    });
});
//# sourceMappingURL=DocusealApi.node.test.js.map