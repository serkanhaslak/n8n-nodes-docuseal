/**
 * Tests for GenericFunctions
 */

import type { IExecuteFunctions, ICredentialsDecrypted } from 'n8n-workflow';
import {
	docusealApiRequest,
	buildSubmittersArray,
	validateUrl,
	validateApiKey,
	sanitizeInput,
	parseJsonInput,
	formatDate,
	validateFile,
} from '../../nodes/Docuseal/GenericFunctions';

describe('GenericFunctions', () => {
	describe('docusealApiRequest', () => {
		let mockExecuteFunctions: IExecuteFunctions;
		let mockCredentials: ICredentialsDecrypted;

		beforeEach(() => {
			mockCredentials = {
				environment: 'production',
				productionApiKey: 'test-api-key-production-12345',
				testApiKey: 'test-api-key-sandbox-67890',
				baseUrl: 'https://api.docuseal.com',
			} as any;

			mockExecuteFunctions = {
				getCredentials: jest.fn().mockResolvedValue(mockCredentials),
				helpers: {
					request: jest.fn(),
				},
			} as any;
		});

		it('should use production API key for production environment', async () => {
			const mockRequest = jest.fn().mockResolvedValue({ success: true });
			mockExecuteFunctions.helpers.request = mockRequest;

			await docusealApiRequest.call(mockExecuteFunctions, 'GET', '/templates');

			expect(mockRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					headers: expect.objectContaining({
						'X-Auth-Token': 'test-api-key-production-12345',
					}),
				}),
			);
		});

		it('should use test API key for test environment', async () => {
			(mockCredentials as any).environment = 'test';
			const mockRequest = jest.fn().mockResolvedValue({ success: true });
			mockExecuteFunctions.helpers.request = mockRequest;

			await docusealApiRequest.call(mockExecuteFunctions, 'GET', '/templates');

			expect(mockRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					headers: expect.objectContaining({
						'X-Auth-Token': 'test-api-key-sandbox-67890',
					}),
				}),
			);
		});

		it('should throw error when test API key is missing for test environment', async () => {
			(mockCredentials as any).environment = 'test';
			(mockCredentials as any).testApiKey = '';

			await expect(
				docusealApiRequest.call(mockExecuteFunctions, 'GET', '/templates'),
			).rejects.toThrow();
		});

		it('should construct correct URL for production environment', async () => {
			const mockRequest = jest.fn().mockResolvedValue({ success: true });
			mockExecuteFunctions.helpers.request = mockRequest;

			await docusealApiRequest.call(mockExecuteFunctions, 'GET', '/templates');

			expect(mockRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					url: 'https://api.docuseal.com/templates',
				}),
			);
		});

		it('should construct correct URL for test environment', async () => {
			(mockCredentials as any).environment = 'test';
			(mockCredentials as any).baseUrl = 'https://api.docuseal.dev';
			const mockRequest = jest.fn().mockResolvedValue({ success: true });
			mockExecuteFunctions.helpers.request = mockRequest;

			await docusealApiRequest.call(mockExecuteFunctions, 'GET', '/templates');

			expect(mockRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					url: 'https://api.docuseal.dev/templates',
				}),
			);
		});

		it('should handle API errors properly', async () => {
			const mockRequest = jest.fn().mockRejectedValue({
				statusCode: 401,
				message: 'Unauthorized',
			});
			mockExecuteFunctions.helpers.request = mockRequest;

			await expect(
				docusealApiRequest.call(mockExecuteFunctions, 'GET', '/templates'),
			).rejects.toThrow();
		});

		it('should sanitize request data', async () => {
			const mockRequest = jest.fn().mockResolvedValue({ success: true });
			mockExecuteFunctions.helpers.request = mockRequest;

			const bodyData = {
				name: 'Test <script>alert("xss")</script>',
				description: 'Safe content',
			};

			await docusealApiRequest.call(mockExecuteFunctions, 'POST', '/templates', bodyData);

			const requestCall = mockRequest.mock.calls[0][0];
			expect(requestCall.body.name).not.toContain('<script>');
		});
	});

	describe('buildSubmittersArray', () => {
		it('should build submitters array correctly', () => {
			const submittersData = {
				submitter: [
					{ email: 'test1@example.com', role: 'Signer' },
					{ email: 'test2@example.com', role: 'Viewer' },
				],
			};

			const result = buildSubmittersArray(submittersData);

			expect(result).toEqual([
				{ email: 'test1@example.com', role: 'Signer' },
				{ email: 'test2@example.com', role: 'Viewer' },
			]);
		});

		it('should return empty array when no submitters provided', () => {
			const submittersData = {};
			const result = buildSubmittersArray(submittersData);
			expect(result).toEqual([]);
		});

		it('should handle single submitter object', () => {
			const submittersData = {
				submitter: { email: 'single@example.com', role: 'Signer' },
			};

			const result = buildSubmittersArray(submittersData);

			expect(result).toEqual([{ email: 'single@example.com', role: 'Signer' }]);
		});
	});

	describe('validateUrl', () => {
		it('should validate correct HTTPS URLs', () => {
			const result = validateUrl('https://example.com/file.pdf');
			expect(result.isValid).toBe(true);
		});

		it('should reject HTTP URLs', () => {
			const result = validateUrl('http://example.com/file.pdf');
			expect(result.isValid).toBe(false);
			expect(result.message).toContain('HTTPS');
		});

		it('should reject localhost URLs', () => {
			const result = validateUrl('https://localhost/file.pdf');
			expect(result.isValid).toBe(false);
			expect(result.message).toContain('localhost');
		});

		it('should reject private network URLs', () => {
			const result = validateUrl('https://192.168.1.1/file.pdf');
			expect(result.isValid).toBe(false);
			expect(result.message).toContain('private networks');
		});

		it('should reject URLs with suspicious patterns', () => {
			const result = validateUrl('https://example.com/../../../etc/passwd');
			expect(result.isValid).toBe(false);
			expect(result.message).toContain('suspicious');
		});

		it('should reject invalid URLs', () => {
			const result = validateUrl('not-a-url');
			expect(result.isValid).toBe(false);
		});
	});

	describe('validateApiKey', () => {
		it('should validate correct API keys', () => {
			const result = validateApiKey('valid-api-key-12345678901234567890');
			expect(result.isValid).toBe(true);
		});

		it('should reject short API keys', () => {
			const result = validateApiKey('short');
			expect(result.isValid).toBe(false);
			expect(result.message).toContain('at least 20 characters');
		});

		it('should reject empty API keys', () => {
			const result = validateApiKey('');
			expect(result.isValid).toBe(false);
			expect(result.message).toContain('required');
		});

		it('should reject API keys with invalid characters', () => {
			const result = validateApiKey('invalid@key#with$symbols!12345');
			expect(result.isValid).toBe(false);
			expect(result.message).toContain('invalid characters');
		});

		it('should reject API keys with whitespace', () => {
			const result = validateApiKey(' valid-api-key-12345678901234567890 ');
			expect(result.isValid).toBe(false);
			expect(result.message).toContain('whitespace');
		});
	});

	describe('validateFile', () => {
		it('should validate allowed file types', () => {
			const pdfBuffer = Buffer.from('%PDF-1.4');
			const result = validateFile(pdfBuffer, 'document.pdf', 'application/pdf');
			expect(result.isValid).toBe(true);
		});

		it('should reject files that are too large', () => {
			const largeBuffer = Buffer.alloc(60 * 1024 * 1024); // 60MB buffer
			const result = validateFile(largeBuffer, 'document.pdf', 'application/pdf');
			expect(result.isValid).toBe(false);
			expect(result.message).toContain('exceeds maximum');
		});

		it('should reject disallowed file types', () => {
			const result = validateFile(Buffer.from('test'), 'script.exe', 'application/x-executable');
			expect(result.isValid).toBe(false);
			expect(result.message).toContain('not allowed');
		});

		it('should validate file size limits', () => {
			const result = validateFile(Buffer.from('test'), 'document.txt', 'text/plain');
			expect(result.isValid).toBe(true);
		});
	});

	describe('sanitizeInput', () => {
		it('should sanitize object inputs', () => {
			const input = {
				name: 'Test Document',
				description: 'A test document with <script>alert("xss")</script>',
				nested: {
					value: 'Nested <b>content</b>',
				},
			};

			const result = sanitizeInput(input);

			expect(result.description).not.toContain('<script>');
			expect(result.nested.value).not.toContain('<b>');
		});

		it('should sanitize string inputs', () => {
			const input = 'Test <script>alert("xss")</script> content';
			const result = sanitizeInput(input);
			expect(result).not.toContain('<script>');
		});

		it('should handle null and undefined inputs', () => {
			expect(sanitizeInput(null)).toBe(null);
			expect(sanitizeInput(undefined)).toBe(undefined);
		});

		it('should preserve non-string, non-object types', () => {
			expect(sanitizeInput(123)).toBe(123);
			expect(sanitizeInput(true)).toBe(true);
			expect(sanitizeInput(['item1', 'item2'])).toEqual(['item1', 'item2']);
		});
	});

	describe('parseJsonInput', () => {
		it('should parse valid JSON strings', () => {
			const jsonString = '{"name": "test", "value": 123}';
			const result = parseJsonInput(jsonString);
			expect(result).toEqual({ name: 'test', value: 123 });
		});

		it('should return object as-is if already an object', () => {
			const obj = { name: 'test', value: 123 };
			const result = parseJsonInput(obj);
			expect(result).toBe(obj);
		});

		it('should throw error for invalid JSON', () => {
			const invalidJson = '{"name": test, "value": }';
			expect(() => parseJsonInput(invalidJson)).toThrow('Invalid JSON');
		});
	});

	describe('formatDate', () => {
		it('should format ISO date strings to ISO format', () => {
			const result = formatDate('2023-12-25T10:30:00Z');
			expect(result).toBe('2023-12-25T10:30:00.000Z');
		});

		it('should handle date objects', () => {
			const date = new Date('2023-12-25T10:30:00Z');
			const result = formatDate(date.toISOString());
			expect(result).toBe('2023-12-25T10:30:00.000Z');
		});

		it('should handle MM/DD/YYYY format', () => {
			const result = formatDate('12/25/2023');
			// The date gets converted to ISO format but may have timezone offset
			expect(result).toMatch(/2023-12-2[45]T\d{2}:00:00\.000Z/);
		});

		it('should return ISO format for already formatted dates', () => {
			const result = formatDate('2023-12-25');
			// The date gets converted to ISO format but may have timezone offset
			expect(result).toMatch(/2023-12-2[45]T\d{2}:00:00\.000Z/);
		});
	});

	// Skipping getTemplates tests as they depend on complex mocking of internal functions
	// TODO: Add proper mocking for getTemplates function tests

	// Skipping docusealApiRequestAllItems tests as they depend on complex mocking of internal functions
	// TODO: Add proper mocking for docusealApiRequestAllItems function tests
});