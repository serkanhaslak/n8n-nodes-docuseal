/**
 * Runtime type validation utilities for DocuSeal API integration
 * Provides runtime type checking to complement TypeScript compile-time checks
 */

import type { ValidationResult, FileValidationOptions, UrlValidationOptions } from './types';

/**
 * Runtime validation error class
 */
export class ValidationError extends Error {
	constructor(
		message: string,
		public readonly field?: string,
		public readonly value?: unknown,
	) {
		super(message);
		this.name = 'ValidationError';
	}
}

/**
 * Base validator class
 */
export abstract class BaseValidator {
	abstract validate(value: unknown): ValidationResult;

	protected createError(message: string, field?: string, value?: unknown): ValidationResult {
		return {
			isValid: false,
			error: message,
			details: { field, value },
		};
	}

	protected createSuccess(): ValidationResult {
		return { isValid: true };
	}

	protected isString(value: unknown): value is string {
		return typeof value === 'string';
	}

	protected isNumber(value: unknown): value is number {
		return typeof value === 'number' && !isNaN(value);
	}

	protected isBoolean(value: unknown): value is boolean {
		return typeof value === 'boolean';
	}

	protected isObject(value: unknown): value is Record<string, unknown> {
		return typeof value === 'object' && value !== null && !Array.isArray(value);
	}

	protected isArray(value: unknown): value is unknown[] {
		return Array.isArray(value);
	}

	protected hasProperty(obj: Record<string, unknown>, prop: string): boolean {
		return Object.prototype.hasOwnProperty.call(obj, prop);
	}
}

/**
 * Email validator
 */
export class EmailValidator extends BaseValidator {
	private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	validate(value: unknown): ValidationResult {
		if (!this.isString(value)) {
			return this.createError('Email must be a string', 'email', value);
		}

		if (!this.emailRegex.test(value)) {
			return this.createError('Invalid email format', 'email', value);
		}

		return this.createSuccess();
	}
}

/**
 * URL validator
 */
export class UrlValidator extends BaseValidator {
	constructor(private readonly options: UrlValidationOptions = {}) {
		super();
	}

	validate(value: unknown): ValidationResult {
		if (!this.isString(value)) {
			return this.createError('URL must be a string', 'url', value);
		}

		try {
			const url = new URL(value);

			// Check HTTPS requirement
			if (this.options.requireHttps && url.protocol !== 'https:') {
				return this.createError('URL must use HTTPS protocol', 'url', value);
			}

			// Check private IPs
			if (!this.options.allowPrivateIps && this.isPrivateIp(url.hostname)) {
				return this.createError('Private IP addresses are not allowed', 'url', value);
			}

			// Check localhost
			if (!this.options.allowLocalhost && this.isLocalhost(url.hostname)) {
				return this.createError('Localhost URLs are not allowed', 'url', value);
			}

			return this.createSuccess();
		} catch {
			return this.createError('Invalid URL format', 'url', value);
		}
	}

	private isPrivateIp(hostname: string): boolean {
		const privateRanges = [
			/^10\./,
			/^172\.(1[6-9]|2[0-9]|3[0-1])\./,
			/^192\.168\./,
			/^127\./,
			/^169\.254\./,
		];

		return privateRanges.some((range) => range.test(hostname));
	}

	private isLocalhost(hostname: string): boolean {
		return ['localhost', '127.0.0.1', '::1'].includes(hostname);
	}
}

/**
 * API credentials validator
 */
export class ApiCredentialsValidator extends BaseValidator {
	validate(value: unknown): ValidationResult {
		if (!this.isObject(value)) {
			return this.createError('Credentials must be an object', 'credentials', value);
		}

		const required = ['productionApiKey', 'testApiKey', 'baseUrl'];
		for (const field of required) {
			if (!this.hasProperty(value, field)) {
				return this.createError(`Missing required field: ${field}`, field, value);
			}

			if (!this.isString(value[field])) {
				return this.createError(`Field ${field} must be a string`, field, value[field]);
			}

			if ((value[field] as string).trim() === '') {
				return this.createError(`Field ${field} cannot be empty`, field, value[field]);
			}
		}

		// Validate base URL format
		const urlValidator = new UrlValidator({ requireHttps: true });
		const urlResult = urlValidator.validate(value.baseUrl);
		if (!urlResult.isValid) {
			return this.createError(`Invalid base URL: ${urlResult.error}`, 'baseUrl', value.baseUrl);
		}

		return this.createSuccess();
	}
}

/**
 * Template validator
 */
export class TemplateValidator extends BaseValidator {
	validate(value: unknown): ValidationResult {
		if (!this.isObject(value)) {
			return this.createError('Template must be an object', 'template', value);
		}

		// Check required fields
		if (!this.hasProperty(value, 'id') || !this.isNumber(value.id)) {
			return this.createError('Template must have a valid id', 'id', value.id);
		}

		if (!this.hasProperty(value, 'name') || !this.isString(value.name)) {
			return this.createError('Template must have a valid name', 'name', value.name);
		}

		if (!this.hasProperty(value, 'created_at') || !this.isString(value.created_at)) {
			return this.createError(
				'Template must have a valid created_at',
				'created_at',
				value.created_at,
			);
		}

		// Validate optional fields if present
		if (this.hasProperty(value, 'fields') && !this.isArray(value.fields)) {
			return this.createError('Template fields must be an array', 'fields', value.fields);
		}

		return this.createSuccess();
	}
}

/**
 * Submission validator
 */
export class SubmissionValidator extends BaseValidator {
	validate(value: unknown): ValidationResult {
		if (!this.isObject(value)) {
			return this.createError('Submission must be an object', 'submission', value);
		}

		// Check required fields
		if (!this.hasProperty(value, 'id') || !this.isNumber(value.id)) {
			return this.createError('Submission must have a valid id', 'id', value.id);
		}

		if (!this.hasProperty(value, 'template_id') || !this.isNumber(value.template_id)) {
			return this.createError(
				'Submission must have a valid template_id',
				'template_id',
				value.template_id,
			);
		}

		if (!this.hasProperty(value, 'status') || !this.isString(value.status)) {
			return this.createError('Submission must have a valid status', 'status', value.status);
		}

		const validStatuses = ['pending', 'completed', 'expired', 'cancelled'];
		if (!validStatuses.includes(value.status)) {
			return this.createError(
				`Invalid status. Must be one of: ${validStatuses.join(', ')}`,
				'status',
				value.status,
			);
		}

		if (!this.hasProperty(value, 'submitters') || !this.isArray(value.submitters)) {
			return this.createError(
				'Submission must have a valid submitters array',
				'submitters',
				value.submitters,
			);
		}

		return this.createSuccess();
	}
}

/**
 * Submitter validator
 */
export class SubmitterValidator extends BaseValidator {
	private readonly emailValidator = new EmailValidator();

	validate(value: unknown): ValidationResult {
		if (!this.isObject(value)) {
			return this.createError('Submitter must be an object', 'submitter', value);
		}

		// Check required fields
		if (!this.hasProperty(value, 'email')) {
			return this.createError('Submitter must have an email', 'email', value);
		}

		const emailResult = this.emailValidator.validate(value.email);
		if (!emailResult.isValid) {
			return emailResult;
		}

		if (!this.hasProperty(value, 'role') || !this.isString(value.role)) {
			return this.createError('Submitter must have a valid role', 'role', value.role);
		}

		// Validate optional fields if present
		if (this.hasProperty(value, 'name') && !this.isString(value.name)) {
			return this.createError('Submitter name must be a string', 'name', value.name);
		}

		if (this.hasProperty(value, 'phone') && !this.isString(value.phone)) {
			return this.createError('Submitter phone must be a string', 'phone', value.phone);
		}

		if (this.hasProperty(value, 'completed') && !this.isBoolean(value.completed)) {
			return this.createError(
				'Submitter completed must be a boolean',
				'completed',
				value.completed,
			);
		}

		return this.createSuccess();
	}
}

/**
 * File validator
 */
export class FileValidator extends BaseValidator {
	constructor(private readonly options: FileValidationOptions) {
		super();
	}

	validate(value: unknown): ValidationResult {
		if (!Buffer.isBuffer(value) && !this.isString(value)) {
			return this.createError('File must be a Buffer or string', 'file', typeof value);
		}

		const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value, 'base64');

		// Check file size
		if (buffer.length > this.options.maxSize) {
			return this.createError(
				`File size ${buffer.length} exceeds maximum ${this.options.maxSize}`,
				'fileSize',
				buffer.length,
			);
		}

		// Check file type by signature
		if (this.options.requireSignature) {
			const signature = this.getFileSignature(buffer);
			if (!this.isAllowedType(signature)) {
				return this.createError(
					`File type not allowed. Detected: ${signature}`,
					'fileType',
					signature,
				);
			}
		}

		return this.createSuccess();
	}

	private getFileSignature(buffer: Buffer): string {
		const signatures: Record<string, number[]> = {
			'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
			'image/jpeg': [0xff, 0xd8, 0xff],
			'image/png': [0x89, 0x50, 0x4e, 0x47],
			'application/zip': [0x50, 0x4b, 0x03, 0x04],
			'text/plain': [], // No specific signature
		};

		for (const [mimeType, sig] of Object.entries(signatures)) {
			if (sig.length === 0) {
				continue;
			} // Skip text/plain
			if (this.matchesSignature(buffer, sig)) {
				return mimeType;
			}
		}

		return 'unknown';
	}

	private matchesSignature(buffer: Buffer, signature: number[]): boolean {
		if (buffer.length < signature.length) {
			return false;
		}
		return signature.every((byte, index) => buffer[index] === byte);
	}

	private isAllowedType(signature: string): boolean {
		return this.options.allowedTypes.includes(signature);
	}
}

/**
 * Validation factory for creating validators
 */
export class ValidationFactory {
	static createEmailValidator(): EmailValidator {
		return new EmailValidator();
	}

	static createUrlValidator(options?: UrlValidationOptions): UrlValidator {
		return new UrlValidator(options);
	}

	static createApiCredentialsValidator(): ApiCredentialsValidator {
		return new ApiCredentialsValidator();
	}

	static createTemplateValidator(): TemplateValidator {
		return new TemplateValidator();
	}

	static createSubmissionValidator(): SubmissionValidator {
		return new SubmissionValidator();
	}

	static createSubmitterValidator(): SubmitterValidator {
		return new SubmitterValidator();
	}

	static createFileValidator(options: FileValidationOptions): FileValidator {
		return new FileValidator(options);
	}
}

/**
 * Utility functions for common validations
 */
export const ValidationUtils = {
	/**
	 * Validate multiple values with their respective validators
	 */
	validateMultiple(
		validations: Array<{ value: unknown; validator: BaseValidator; field?: string }>,
	): ValidationResult {
		for (const { value, validator, field } of validations) {
			const result = validator.validate(value);
			if (!result.isValid) {
				return {
					isValid: false,
					error: `${field ? `${field}: ` : ''}${result.error}`,
					details: result.details,
				};
			}
		}
		return { isValid: true };
	},

	/**
	 * Assert that a value passes validation, throwing an error if not
	 */
	assert(value: unknown, validator: BaseValidator, field?: string): void {
		const result = validator.validate(value);
		if (!result.isValid) {
			throw new ValidationError(result.error ?? 'Validation failed', field, value);
		}
	},

	/**
	 * Check if a value is valid without throwing
	 */
	isValid(value: unknown, validator: BaseValidator): boolean {
		return validator.validate(value).isValid;
	},
};
