import type { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import { DocusealApi } from '../../nodes/Docuseal/DocusealApi.node';
import * as GenericFunctions from '../../nodes/Docuseal/GenericFunctions';

// Mock the GenericFunctions module
jest.mock('../../nodes/Docuseal/GenericFunctions');

describe('DocusealApi.node', () => {
	let docusealApi: DocusealApi;
	let mockExecuteFunctions: Partial<IExecuteFunctions>;
	let mockLoadOptionsFunctions: Partial<ILoadOptionsFunctions>;

	beforeEach(() => {
		docusealApi = new DocusealApi();

		// Mock IExecuteFunctions
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
					.mockImplementation((data: any, _metadata: any) =>
						data.map ? data.map((item: any) => ({ json: item })) : [{ json: data }],
					),
			},
		} as any;

		// Mock ILoadOptionsFunctions
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
					.mockImplementation((data: any, _metadata: any) =>
						data.map ? data.map((item: any) => ({ json: item })) : [{ json: data }],
					),
			},
		} as any;

		// Reset all mocks
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
			const resourceProperty = docusealApi.description.properties?.find(
				(prop: any) => prop.name === 'resource',
			) as any;

			expect(resourceProperty).toBeDefined();
			expect(resourceProperty.options).toHaveLength(4);

			const resourceValues = resourceProperty.options.map((opt: any) => opt.value);
			expect(['form', 'submission', 'submitter', 'template']).toEqual(
				expect.arrayContaining(resourceValues),
			);
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

			const result = await docusealApi.methods?.loadOptions?.getTemplates?.call(
				mockLoadOptionsFunctions as ILoadOptionsFunctions,
			);

			expect(mockGetTemplates).toHaveBeenCalled();
			expect(result).toEqual([{ name: 'Template 1', value: '1' }]);
		});

		it('should return empty array on error', async () => {
			jest.spyOn(GenericFunctions, 'getTemplates').mockRejectedValue(new Error('API Error'));

			const result = await docusealApi.methods?.loadOptions?.getTemplates?.call(
				mockLoadOptionsFunctions as ILoadOptionsFunctions,
			);

			expect(result).toEqual([]);
		});
	});

	describe('Execute Method - Template Operations', () => {
		it('should get template by ID', async () => {
			const mockDocusealApiRequest = jest
				.spyOn(GenericFunctions, 'docusealApiRequest')
				.mockResolvedValue({ id: 1, name: 'Test Template' });

			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('template') // resource
				.mockReturnValueOnce('get') // operation
				.mockReturnValueOnce(1); // templateId

			const result = await docusealApi.execute.call(mockExecuteFunctions as IExecuteFunctions);

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

			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('template') // resource
				.mockReturnValueOnce('getMany') // operation
				.mockReturnValueOnce(true) // returnAll
				.mockReturnValueOnce({}) // filters
				.mockReturnValueOnce({}); // additionalFields

			const result = await docusealApi.execute.call(mockExecuteFunctions as IExecuteFunctions);

			expect(mockDocusealApiRequestAllItems).toHaveBeenCalledWith(
				'GET',
				'/templates',
				{},
				{},
				{
					batchSize: 100,
					maxItems: 10000,
					memoryOptimized: false,
				},
			);
			expect(result[0]).toHaveLength(2);
			expect(result[0]?.[0]?.json).toEqual({ id: 1, name: 'Template 1' });
			expect(result[0]?.[1]?.json).toEqual({ id: 2, name: 'Template 2' });
		});

		it('should get limited templates without returnAll', async () => {
			const mockDocusealApiRequest = jest
				.spyOn(GenericFunctions, 'docusealApiRequest')
				.mockResolvedValue([{ id: 1, name: 'Template 1' }]);

			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('template') // resource
				.mockReturnValueOnce('getMany') // operation
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce({}) // filters
				.mockReturnValueOnce(10); // limit

			const result = await docusealApi.execute.call(mockExecuteFunctions as IExecuteFunctions);

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

			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('submission') // resource
				.mockReturnValueOnce('create') // operation
				.mockReturnValueOnce(1) // templateId
				.mockReturnValueOnce([{ email: 'test@example.com' }]) // submitters
				.mockReturnValueOnce({}) // additionalOptions
				.mockReturnValue({}); // for buildFieldValues call

			const result = await docusealApi.execute.call(mockExecuteFunctions as IExecuteFunctions);

			expect(mockBuildSubmittersArray).toHaveBeenCalled();
			expect(mockBuildFieldValues).toHaveBeenCalled();
			expect(mockDocusealApiRequest).toHaveBeenCalledWith(
				'POST',
				'/submissions',
				expect.objectContaining({
					template_id: 1,
					submitters: [{ email: 'test@example.com' }],
				}),
			);
			expect(result[0]?.[0]?.json).toEqual({ id: 1, status: 'pending' });
		});

		it('should get submission by ID', async () => {
			const mockDocusealApiRequest = jest
				.spyOn(GenericFunctions, 'docusealApiRequest')
				.mockResolvedValue({ id: 1, status: 'completed' });

			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('submission') // resource
				.mockReturnValueOnce('get') // operation
				.mockReturnValueOnce(1); // submissionId

			const result = await docusealApi.execute.call(mockExecuteFunctions as IExecuteFunctions);

			expect(mockDocusealApiRequest).toHaveBeenCalledWith('GET', '/submissions/1');
			expect(result[0]?.[0]?.json).toEqual({ id: 1, status: 'completed' });
		});
	});

	describe('Execute Method - Submitter Operations', () => {
		it('should get submitter by ID', async () => {
			const mockDocusealApiRequest = jest
				.spyOn(GenericFunctions, 'docusealApiRequest')
				.mockResolvedValue({ id: 1, email: 'test@example.com' });

			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('submitter') // resource
				.mockReturnValueOnce('get') // operation
				.mockReturnValueOnce(1); // submitterId

			const result = await docusealApi.execute.call(mockExecuteFunctions as IExecuteFunctions);

			expect(mockDocusealApiRequest).toHaveBeenCalledWith('GET', '/submitters/1');
			expect(result[0]?.[0]?.json).toEqual({ id: 1, email: 'test@example.com' });
		});

		it('should update submitter', async () => {
			const mockDocusealApiRequest = jest
				.spyOn(GenericFunctions, 'docusealApiRequest')
				.mockResolvedValue({ id: 1, email: 'updated@example.com' });

			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('submitter') // resource
				.mockReturnValueOnce('update') // operation
				.mockReturnValueOnce(1) // submitterId
				.mockReturnValueOnce({ email: 'updated@example.com' }) // updateFields
				.mockReturnValueOnce({}) // fields
				.mockReturnValueOnce({}); // values

			const result = await docusealApi.execute.call(mockExecuteFunctions as IExecuteFunctions);

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

			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('form') // resource
				.mockReturnValueOnce('getStarted') // operation
				.mockReturnValueOnce(1); // submitterId

			const result = await docusealApi.execute.call(mockExecuteFunctions as IExecuteFunctions);

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

			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('template') // resource
				.mockReturnValueOnce('get') // operation
				.mockReturnValueOnce(1); // templateId

			await expect(
				docusealApi.execute.call(mockExecuteFunctions as IExecuteFunctions),
			).rejects.toThrow('API Error');
		});

		it('should handle multiple items', async () => {
			jest
				.spyOn(GenericFunctions, 'docusealApiRequest')
				.mockResolvedValueOnce({ id: 1, name: 'Template 1' })
				.mockResolvedValueOnce({ id: 2, name: 'Template 2' });

			(mockExecuteFunctions.getInputData as jest.Mock).mockReturnValue([
				{ json: {} },
				{ json: {} },
			]);

			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('template') // resource for item 1
				.mockReturnValueOnce('get') // operation for item 1
				.mockReturnValueOnce(1) // templateId for item 1
				.mockReturnValueOnce('template') // resource for item 2
				.mockReturnValueOnce('get') // operation for item 2
				.mockReturnValueOnce(2); // templateId for item 2

			const result = await docusealApi.execute.call(mockExecuteFunctions as IExecuteFunctions);

			expect(result[0]).toHaveLength(2);
			expect(result[0]?.[0]?.json).toEqual({ id: 1, name: 'Template 1' });
			expect(result[0]?.[1]?.json).toEqual({ id: 2, name: 'Template 2' });
		});
	});
});
