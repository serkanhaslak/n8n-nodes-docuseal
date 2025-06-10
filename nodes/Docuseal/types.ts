/**
 * Type definitions for DocuSeal API integration
 * Provides comprehensive type safety for all DocuSeal operations
 */

import type { IDataObject } from 'n8n-workflow';

// Base interfaces
export interface DocusealApiCredentials {
	productionApiKey: string;
	testApiKey: string;
	baseUrl: string;
}

export interface DocusealEnvironment {
	environment: 'production' | 'test';
}

// Template interfaces
export interface DocusealTemplate {
	id: number;
	name: string;
	created_at: string;
	updated_at: string;
	fields?: DocusealTemplateField[];
	submissions_count?: number;
	archived?: boolean;
}

export interface DocusealTemplateField {
	name: string;
	type: 'text' | 'signature' | 'date' | 'checkbox' | 'radio' | 'select' | 'file';
	required: boolean;
	default_value?: string;
	options?: string[];
}

export interface CreateTemplateFromPdfParams {
	name: string;
	pdf_file: Buffer | string;
	fields?: DocusealTemplateField[];
}

// Submission interfaces
export interface DocusealSubmission {
	id: number;
	template_id: number;
	status: 'pending' | 'completed' | 'expired' | 'cancelled';
	created_at: string;
	updated_at: string;
	completed_at?: string;
	expired_at?: string;
	submitters: DocusealSubmitter[];
	audit_trail?: DocusealAuditEvent[];
	documents?: DocusealDocument[];
}

export interface CreateSubmissionParams {
	template_id: number;
	submitters: DocusealSubmitter[];
	send_email?: boolean;
	send_sms?: boolean;
	expired_at?: string;
	message?: string;
	field_values?: Record<string, unknown>;
	metadata?: Record<string, unknown>;
}

// Submitter interfaces
export interface DocusealSubmitter {
	id?: number;
	email: string;
	role: string;
	name?: string;
	phone?: string;
	external_id?: string;
	completed?: boolean;
	send_email?: boolean;
	send_sms?: boolean;
	metadata?: Record<string, unknown>;
	fields?: Record<string, unknown>;
	status?: 'pending' | 'opened' | 'completed';
	completed_at?: string;
	opened_at?: string;
	submission_id?: number;
}

export interface UpdateSubmitterParams {
	name?: string;
	phone?: string;
	external_id?: string;
	metadata?: Record<string, unknown>;
	fields?: Record<string, unknown>;
}

// Document interfaces
export interface DocusealDocument {
	id: number;
	filename: string;
	content_type: string;
	size: number;
	url: string;
	created_at: string;
}

// Form interfaces
export interface DocusealForm {
	id: number;
	name: string;
	slug: string;
	template_id: number;
	status: 'active' | 'inactive';
	created_at: string;
	updated_at: string;
	url: string;
	submissions_count: number;
}

// Webhook interfaces
export interface DocusealWebhookEvent {
	event: 'submission.created' | 'submission.completed' | 'submitter.opened' | 'submitter.completed';
	data: DocusealSubmission | DocusealSubmitter;
	timestamp: string;
	submission_id?: number;
	submitter_id?: number;
}

// Audit trail interfaces
export interface DocusealAuditEvent {
	id: number;
	action: string;
	user_email?: string;
	ip_address: string;
	user_agent: string;
	created_at: string;
	metadata?: Record<string, unknown>;
}

// API response interfaces
export interface DocusealApiResponse<T = unknown> {
	data?: T;
	message?: string;
	error?: string;
	status?: number;
}

export interface DocusealPaginatedResponse<T = unknown> {
	data: T[];
	meta: {
		current_page: number;
		total_pages: number;
		total_count: number;
		per_page: number;
	};
}

// Error interfaces
export interface DocusealApiError {
	message: string;
	status: number;
	code?: string;
	details?: Record<string, unknown>;
}

// Validation interfaces
export interface ValidationResult {
	isValid: boolean;
	error?: string;
	details?: Record<string, unknown> | undefined;
}

export interface FileValidationOptions {
	allowedTypes: string[];
	maxSize: number;
	requireSignature?: boolean;
}

export interface UrlValidationOptions {
	requireHttps?: boolean;
	allowPrivateIps?: boolean;
	allowLocalhost?: boolean;
}

// Performance and optimization interfaces
export interface PerformanceOptions {
	batchSize?: number;
	maxItems?: number;
	memoryOptimized?: boolean;
	retryAttempts?: number;
	retryDelay?: number;
}

export interface BatchRequestOptions extends PerformanceOptions {
	delayBetweenBatches?: number;
	progressCallback?: (processed: number, total: number) => void;
}

export interface UploadOptions {
	chunkSize?: number;
	timeout?: number;
	progressCallback?: (uploaded: number, total: number) => void;
}

// Utility type helpers
export type DocusealResource = 'template' | 'submission' | 'submitter' | 'form';
export type DocusealOperation = 'get' | 'getMany' | 'create' | 'update' | 'delete';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Node parameter interfaces
export interface NodeParameters extends IDataObject {
	resource: DocusealResource;
	operation: DocusealOperation;
	environment?: 'production' | 'test';
	returnAll?: boolean;
	limit?: number;
	filters?: IDataObject;
	additionalFields?: IDataObject;
}

// Field collection interfaces
export interface FieldCollection {
	field: FieldItem[];
}

export interface FieldItem {
	name: string;
	value: unknown;
}

export interface SubmitterCollection {
	submitter: SubmitterItem[];
}

export interface SubmitterItem {
	email: string;
	role: string;
	additionalFields?: {
		name?: string;
		phone?: string;
		external_id?: string;
		completed?: boolean;
		send_email?: boolean;
		send_sms?: boolean;
		metadata?: string | Record<string, unknown>;
		fields?: string | Record<string, unknown>;
	};
}

// Type guards
export function isDocusealTemplate(obj: unknown): obj is DocusealTemplate {
	return typeof obj === 'object' && obj !== null && 'id' in obj && 'name' in obj;
}

export function isDocusealSubmission(obj: unknown): obj is DocusealSubmission {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		'id' in obj &&
		'template_id' in obj &&
		'status' in obj
	);
}

export function isDocusealSubmitter(obj: unknown): obj is DocusealSubmitter {
	return typeof obj === 'object' && obj !== null && 'email' in obj && 'role' in obj;
}

export function isDocusealApiError(obj: unknown): obj is DocusealApiError {
	return typeof obj === 'object' && obj !== null && 'message' in obj && 'status' in obj;
}

// Constants
export const DOCUSEAL_API_ENDPOINTS = {
	TEMPLATES: '/templates',
	SUBMISSIONS: '/submissions',
	SUBMITTERS: '/submitters',
	FORMS: '/forms',
	DOCUMENTS: '/documents',
} as const;

export const DOCUSEAL_EVENT_TYPES = {
	SUBMISSION_CREATED: 'submission.created',
	SUBMISSION_COMPLETED: 'submission.completed',
	SUBMITTER_OPENED: 'submitter.opened',
	SUBMITTER_COMPLETED: 'submitter.completed',
} as const;

export const DOCUSEAL_STATUSES = {
	PENDING: 'pending',
	COMPLETED: 'completed',
	EXPIRED: 'expired',
	CANCELLED: 'cancelled',
	OPENED: 'opened',
} as const;
