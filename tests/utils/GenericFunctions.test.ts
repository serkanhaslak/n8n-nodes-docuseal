/**
 * Tests for GenericFunctions
 */

import type { IExecuteFunctions, ICredentialsDecrypted } from 'n8n-workflow';
import { docusealApiRequest, buildSubmittersArray } from '../../nodes/Docuseal/GenericFunctions';

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
	});
});
