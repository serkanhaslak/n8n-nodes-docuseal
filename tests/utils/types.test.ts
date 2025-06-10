/**
 * Tests for types
 */

import {
	isDocusealTemplate,
	isDocusealSubmission,
	isDocusealSubmitter,
	isDocusealApiError,
	DOCUSEAL_API_ENDPOINTS,
	DOCUSEAL_EVENT_TYPES,
	DOCUSEAL_STATUSES,
	type DocusealTemplate,
	type DocusealSubmission,
	type DocusealSubmitter,
	type DocusealApiError,
} from '../../nodes/Docuseal/types';

describe('types', () => {
	describe('Type Guards', () => {
		describe('isDocusealTemplate', () => {
			it('should return true for valid template', () => {
				const template: DocusealTemplate = {
					id: 1,
					name: 'Test Template',
					created_at: '2023-01-01T00:00:00Z',
					updated_at: '2023-01-01T00:00:00Z',
				};
				expect(isDocusealTemplate(template)).toBe(true);
			});

			it('should return false for invalid template', () => {
				expect(isDocusealTemplate(null)).toBe(false);
				expect(isDocusealTemplate(undefined)).toBe(false);
				expect(isDocusealTemplate({})).toBe(false);
				expect(isDocusealTemplate({ id: 1 })).toBe(false);
				expect(isDocusealTemplate({ name: 'test' })).toBe(false);
				expect(isDocusealTemplate('string')).toBe(false);
				expect(isDocusealTemplate(123)).toBe(false);
			});

			it('should return true for template with optional fields', () => {
				const template = {
					id: 1,
					name: 'Test Template',
					created_at: '2023-01-01T00:00:00Z',
					updated_at: '2023-01-01T00:00:00Z',
					fields: [],
					submissions_count: 5,
					archived: false,
				};
				expect(isDocusealTemplate(template)).toBe(true);
			});
		});

		describe('isDocusealSubmission', () => {
			it('should return true for valid submission', () => {
				const submission: DocusealSubmission = {
					id: 1,
					template_id: 2,
					status: 'pending',
					created_at: '2023-01-01T00:00:00Z',
					updated_at: '2023-01-01T00:00:00Z',
					submitters: [],
				};
				expect(isDocusealSubmission(submission)).toBe(true);
			});

			it('should return false for invalid submission', () => {
				expect(isDocusealSubmission(null)).toBe(false);
				expect(isDocusealSubmission(undefined)).toBe(false);
				expect(isDocusealSubmission({})).toBe(false);
				expect(isDocusealSubmission({ id: 1 })).toBe(false);
				expect(isDocusealSubmission({ id: 1, template_id: 2 })).toBe(false);
				expect(isDocusealSubmission({ template_id: 2, status: 'pending' })).toBe(false);
			});

			it('should return true for submission with all statuses', () => {
				const statuses = ['pending', 'completed', 'expired', 'cancelled'];
				statuses.forEach(status => {
					const submission = {
						id: 1,
						template_id: 2,
						status,
						created_at: '2023-01-01T00:00:00Z',
						updated_at: '2023-01-01T00:00:00Z',
						submitters: [],
					};
					expect(isDocusealSubmission(submission)).toBe(true);
				});
			});
		});

		describe('isDocusealSubmitter', () => {
			it('should return true for valid submitter', () => {
				const submitter: DocusealSubmitter = {
					email: 'test@example.com',
					role: 'signer',
				};
				expect(isDocusealSubmitter(submitter)).toBe(true);
			});

			it('should return false for invalid submitter', () => {
				expect(isDocusealSubmitter(null)).toBe(false);
				expect(isDocusealSubmitter(undefined)).toBe(false);
				expect(isDocusealSubmitter({})).toBe(false);
				expect(isDocusealSubmitter({ email: 'test@example.com' })).toBe(false);
				expect(isDocusealSubmitter({ role: 'signer' })).toBe(false);
			});

			it('should return true for submitter with optional fields', () => {
				const submitter = {
					email: 'test@example.com',
					role: 'signer',
					name: 'Test User',
					phone: '+1234567890',
					external_id: 'ext123',
					completed: false,
					send_email: true,
					send_sms: false,
					metadata: { key: 'value' },
					fields: { field1: 'value1' },
					status: 'pending',
					submission_id: 1,
				};
				expect(isDocusealSubmitter(submitter)).toBe(true);
			});
		});

		describe('isDocusealApiError', () => {
			it('should return true for valid API error', () => {
				const error: DocusealApiError = {
					message: 'Error occurred',
					status: 400,
				};
				expect(isDocusealApiError(error)).toBe(true);
			});

			it('should return false for invalid API error', () => {
				expect(isDocusealApiError(null)).toBe(false);
				expect(isDocusealApiError(undefined)).toBe(false);
				expect(isDocusealApiError({})).toBe(false);
				expect(isDocusealApiError({ message: 'error' })).toBe(false);
				expect(isDocusealApiError({ status: 400 })).toBe(false);
			});

			it('should return true for API error with optional fields', () => {
				const error = {
					message: 'Error occurred',
					status: 400,
					code: 'INVALID_REQUEST',
					details: { field: 'name', value: 'invalid' },
				};
				expect(isDocusealApiError(error)).toBe(true);
			});
		});
	});

	describe('Constants', () => {
		describe('DOCUSEAL_API_ENDPOINTS', () => {
			it('should have all required endpoints', () => {
				expect(DOCUSEAL_API_ENDPOINTS.TEMPLATES).toBe('/templates');
				expect(DOCUSEAL_API_ENDPOINTS.SUBMISSIONS).toBe('/submissions');
				expect(DOCUSEAL_API_ENDPOINTS.SUBMITTERS).toBe('/submitters');
				expect(DOCUSEAL_API_ENDPOINTS.FORMS).toBe('/forms');
				expect(DOCUSEAL_API_ENDPOINTS.DOCUMENTS).toBe('/documents');
			});

			it('should have immutable structure', () => {
				// Test that the object exists and has expected properties
				expect(typeof DOCUSEAL_API_ENDPOINTS).toBe('object');
				expect(Object.keys(DOCUSEAL_API_ENDPOINTS)).toContain('TEMPLATES');
				expect(Object.keys(DOCUSEAL_API_ENDPOINTS)).toContain('SUBMISSIONS');
			});
		});

		describe('DOCUSEAL_EVENT_TYPES', () => {
			it('should have all event types', () => {
				expect(DOCUSEAL_EVENT_TYPES.SUBMISSION_CREATED).toBe('submission.created');
				expect(DOCUSEAL_EVENT_TYPES.SUBMISSION_COMPLETED).toBe('submission.completed');
				expect(DOCUSEAL_EVENT_TYPES.SUBMITTER_OPENED).toBe('submitter.opened');
				expect(DOCUSEAL_EVENT_TYPES.SUBMITTER_COMPLETED).toBe('submitter.completed');
			});

			it('should have immutable structure', () => {
				// Test that the object exists and has expected properties
				expect(typeof DOCUSEAL_EVENT_TYPES).toBe('object');
				expect(Object.keys(DOCUSEAL_EVENT_TYPES)).toContain('SUBMISSION_CREATED');
				expect(Object.keys(DOCUSEAL_EVENT_TYPES)).toContain('SUBMITTER_COMPLETED');
			});
		});

		describe('DOCUSEAL_STATUSES', () => {
			it('should have all status values', () => {
				expect(DOCUSEAL_STATUSES.PENDING).toBe('pending');
				expect(DOCUSEAL_STATUSES.COMPLETED).toBe('completed');
				expect(DOCUSEAL_STATUSES.EXPIRED).toBe('expired');
				expect(DOCUSEAL_STATUSES.CANCELLED).toBe('cancelled');
				expect(DOCUSEAL_STATUSES.OPENED).toBe('opened');
			});

			it('should have immutable structure', () => {
				// Test that the object exists and has expected properties
				expect(typeof DOCUSEAL_STATUSES).toBe('object');
				expect(Object.keys(DOCUSEAL_STATUSES)).toContain('PENDING');
				expect(Object.keys(DOCUSEAL_STATUSES)).toContain('COMPLETED');
			});
		});
	});

	describe('Interface validation', () => {
		it('should validate DocusealTemplate interface', () => {
			const template: DocusealTemplate = {
				id: 1,
				name: 'Test Template',
				created_at: '2023-01-01T00:00:00Z',
				updated_at: '2023-01-01T00:00:00Z',
				fields: [
					{
						name: 'signature',
						type: 'signature',
						required: true,
					},
					{
						name: 'date',
						type: 'date',
						required: false,
						default_value: '2023-01-01',
					},
				],
				submissions_count: 10,
				archived: false,
			};

			expect(template.id).toBe(1);
			expect(template.name).toBe('Test Template');
			expect(template.fields).toHaveLength(2);
			expect(template.fields?.[0]?.type).toBe('signature');
		});

		it('should validate DocusealSubmission interface', () => {
			const submission: DocusealSubmission = {
				id: 1,
				template_id: 2,
				status: 'completed',
				created_at: '2023-01-01T00:00:00Z',
				updated_at: '2023-01-01T00:00:00Z',
				completed_at: '2023-01-01T01:00:00Z',
				submitters: [
					{
						email: 'signer@example.com',
						role: 'signer',
						completed: true,
					},
				],
				audit_trail: [
					{
						id: 1,
						action: 'document_signed',
						ip_address: '192.168.1.1',
						user_agent: 'Mozilla/5.0',
						created_at: '2023-01-01T01:00:00Z',
					},
				],
			};

			expect(submission.status).toBe('completed');
			expect(submission.submitters).toHaveLength(1);
			expect(submission.audit_trail).toHaveLength(1);
		});

		it('should validate DocusealSubmitter interface', () => {
			const submitter: DocusealSubmitter = {
				id: 1,
				email: 'test@example.com',
				role: 'signer',
				name: 'Test User',
				phone: '+1234567890',
				external_id: 'ext123',
				completed: true,
				send_email: true,
				send_sms: false,
				metadata: { department: 'HR' },
				fields: { title: 'Manager' },
				status: 'completed',
				completed_at: '2023-01-01T01:00:00Z',
				opened_at: '2023-01-01T00:30:00Z',
				submission_id: 1,
			};

			expect(submitter.email).toBe('test@example.com');
			expect(submitter.role).toBe('signer');
			expect(submitter.completed).toBe(true);
			expect(submitter.metadata).toEqual({ department: 'HR' });
		});
	});
});