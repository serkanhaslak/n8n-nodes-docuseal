"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runtime_validation_1 = require("../../nodes/Docuseal/runtime-validation");
describe('runtime-validation', () => {
    describe('ValidationError', () => {
        it('should create error with message', () => {
            const error = new runtime_validation_1.ValidationError('Test error');
            expect(error.message).toBe('Test error');
            expect(error.name).toBe('ValidationError');
            expect(error.field).toBeUndefined();
            expect(error.value).toBeUndefined();
        });
        it('should create error with field and value', () => {
            const error = new runtime_validation_1.ValidationError('Test error', 'email', 'invalid@');
            expect(error.message).toBe('Test error');
            expect(error.field).toBe('email');
            expect(error.value).toBe('invalid@');
        });
    });
    describe('EmailValidator', () => {
        let validator;
        beforeEach(() => {
            validator = new runtime_validation_1.EmailValidator();
        });
        it('should validate correct email addresses', () => {
            expect(validator.validate('test@example.com')).toEqual({ isValid: true });
            expect(validator.validate('user.name+tag@domain.co.uk')).toEqual({ isValid: true });
        });
        it('should reject invalid email addresses', () => {
            const result = validator.validate('invalid-email');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Invalid email format');
        });
        it('should reject non-string values', () => {
            const result = validator.validate(123);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Email must be a string');
        });
    });
    describe('UrlValidator', () => {
        it('should validate correct URLs', () => {
            const validator = new runtime_validation_1.UrlValidator();
            expect(validator.validate('https://example.com')).toEqual({ isValid: true });
            expect(validator.validate('http://example.com')).toEqual({ isValid: true });
        });
        it('should require HTTPS when configured', () => {
            const validator = new runtime_validation_1.UrlValidator({ requireHttps: true });
            const result = validator.validate('http://example.com');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('HTTPS protocol');
        });
        it('should reject private IPs when configured', () => {
            const validator = new runtime_validation_1.UrlValidator({ allowPrivateIps: false });
            const result = validator.validate('https://192.168.1.1');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Private IP addresses');
        });
        it('should reject localhost when configured', () => {
            const validator = new runtime_validation_1.UrlValidator({ allowLocalhost: false });
            const result = validator.validate('https://localhost');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Localhost URLs');
        });
        it('should reject invalid URL format', () => {
            const validator = new runtime_validation_1.UrlValidator();
            const result = validator.validate('not-a-url');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Invalid URL format');
        });
    });
    describe('ApiCredentialsValidator', () => {
        let validator;
        beforeEach(() => {
            validator = new runtime_validation_1.ApiCredentialsValidator();
        });
        it('should validate correct credentials', () => {
            const credentials = {
                productionApiKey: 'prod-key',
                testApiKey: 'test-key',
                baseUrl: 'https://api.docuseal.com',
            };
            expect(validator.validate(credentials)).toEqual({ isValid: true });
        });
        it('should reject non-object values', () => {
            const result = validator.validate('not-an-object');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('must be an object');
        });
        it('should reject missing required fields', () => {
            const credentials = {
                productionApiKey: 'prod-key',
            };
            const result = validator.validate(credentials);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Missing required field');
        });
        it('should reject empty string fields', () => {
            const credentials = {
                productionApiKey: '',
                testApiKey: 'test-key',
                baseUrl: 'https://api.docuseal.com',
            };
            const result = validator.validate(credentials);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('cannot be empty');
        });
        it('should reject invalid base URL', () => {
            const credentials = {
                productionApiKey: 'prod-key',
                testApiKey: 'test-key',
                baseUrl: 'not-a-url',
            };
            const result = validator.validate(credentials);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Invalid base URL');
        });
    });
    describe('TemplateValidator', () => {
        let validator;
        beforeEach(() => {
            validator = new runtime_validation_1.TemplateValidator();
        });
        it('should validate correct template', () => {
            const template = {
                id: 1,
                name: 'Test Template',
                created_at: '2023-01-01T00:00:00Z',
                fields: [],
            };
            expect(validator.validate(template)).toEqual({ isValid: true });
        });
        it('should reject non-object values', () => {
            const result = validator.validate('not-an-object');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('must be an object');
        });
        it('should reject missing required fields', () => {
            const template = {
                name: 'Test Template',
            };
            const result = validator.validate(template);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('valid id');
        });
        it('should reject invalid field types', () => {
            const template = {
                id: 'not-a-number',
                name: 'Test Template',
                created_at: '2023-01-01T00:00:00Z',
            };
            const result = validator.validate(template);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('valid id');
        });
    });
    describe('SubmissionValidator', () => {
        let validator;
        beforeEach(() => {
            validator = new runtime_validation_1.SubmissionValidator();
        });
        it('should validate correct submission', () => {
            const submission = {
                id: 1,
                template_id: 2,
                status: 'pending',
                submitters: [],
            };
            expect(validator.validate(submission)).toEqual({ isValid: true });
        });
        it('should reject invalid status', () => {
            const submission = {
                id: 1,
                template_id: 2,
                status: 'invalid-status',
                submitters: [],
            };
            const result = validator.validate(submission);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Invalid status');
        });
        it('should accept valid statuses', () => {
            const statuses = ['pending', 'completed', 'expired', 'cancelled'];
            for (const status of statuses) {
                const submission = {
                    id: 1,
                    template_id: 2,
                    status,
                    submitters: [],
                };
                expect(validator.validate(submission)).toEqual({ isValid: true });
            }
        });
    });
    describe('SubmitterValidator', () => {
        let validator;
        beforeEach(() => {
            validator = new runtime_validation_1.SubmitterValidator();
        });
        it('should validate correct submitter', () => {
            const submitter = {
                email: 'test@example.com',
                role: 'signer',
                name: 'Test User',
                phone: '+1234567890',
                completed: false,
            };
            expect(validator.validate(submitter)).toEqual({ isValid: true });
        });
        it('should reject missing email', () => {
            const submitter = {
                role: 'signer',
            };
            const result = validator.validate(submitter);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('must have an email');
        });
        it('should reject invalid email', () => {
            const submitter = {
                email: 'invalid-email',
                role: 'signer',
            };
            const result = validator.validate(submitter);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Invalid email format');
        });
        it('should validate optional fields', () => {
            const submitter = {
                email: 'test@example.com',
                role: 'signer',
                name: 123,
            };
            const result = validator.validate(submitter);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('name must be a string');
        });
    });
    describe('FileValidator', () => {
        it('should validate correct buffer', () => {
            const validator = new runtime_validation_1.FileValidator({
                maxSize: 1024,
                requireSignature: false,
                allowedTypes: [],
            });
            const buffer = Buffer.from('test file content');
            expect(validator.validate(buffer)).toEqual({ isValid: true });
        });
        it('should reject files too large', () => {
            const validator = new runtime_validation_1.FileValidator({
                maxSize: 10,
                requireSignature: false,
                allowedTypes: [],
            });
            const buffer = Buffer.from('this is too large');
            const result = validator.validate(buffer);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('exceeds maximum');
        });
        it('should validate file signatures when required', () => {
            const validator = new runtime_validation_1.FileValidator({
                maxSize: 1024,
                requireSignature: true,
                allowedTypes: ['application/pdf'],
            });
            const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
            expect(validator.validate(pdfBuffer)).toEqual({ isValid: true });
        });
        it('should reject disallowed file types', () => {
            const validator = new runtime_validation_1.FileValidator({
                maxSize: 1024,
                requireSignature: true,
                allowedTypes: ['application/pdf'],
            });
            const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
            const result = validator.validate(jpegBuffer);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('File type not allowed');
        });
    });
    describe('ValidationFactory', () => {
        it('should create email validator', () => {
            const validator = runtime_validation_1.ValidationFactory.createEmailValidator();
            expect(validator).toBeInstanceOf(runtime_validation_1.EmailValidator);
        });
        it('should create URL validator with options', () => {
            const validator = runtime_validation_1.ValidationFactory.createUrlValidator({ requireHttps: true });
            expect(validator).toBeInstanceOf(runtime_validation_1.UrlValidator);
        });
        it('should create all validator types', () => {
            expect(runtime_validation_1.ValidationFactory.createApiCredentialsValidator()).toBeInstanceOf(runtime_validation_1.ApiCredentialsValidator);
            expect(runtime_validation_1.ValidationFactory.createTemplateValidator()).toBeInstanceOf(runtime_validation_1.TemplateValidator);
            expect(runtime_validation_1.ValidationFactory.createSubmissionValidator()).toBeInstanceOf(runtime_validation_1.SubmissionValidator);
            expect(runtime_validation_1.ValidationFactory.createSubmitterValidator()).toBeInstanceOf(runtime_validation_1.SubmitterValidator);
            expect(runtime_validation_1.ValidationFactory.createFileValidator({
                maxSize: 1024,
                requireSignature: false,
                allowedTypes: [],
            })).toBeInstanceOf(runtime_validation_1.FileValidator);
        });
    });
    describe('ValidationUtils', () => {
        it('should validate multiple values successfully', () => {
            const emailValidator = new runtime_validation_1.EmailValidator();
            const urlValidator = new runtime_validation_1.UrlValidator();
            const result = runtime_validation_1.ValidationUtils.validateMultiple([
                { value: 'test@example.com', validator: emailValidator, field: 'email' },
                { value: 'https://example.com', validator: urlValidator, field: 'url' },
            ]);
            expect(result).toEqual({ isValid: true });
        });
        it('should fail on first invalid value', () => {
            const emailValidator = new runtime_validation_1.EmailValidator();
            const urlValidator = new runtime_validation_1.UrlValidator();
            const result = runtime_validation_1.ValidationUtils.validateMultiple([
                { value: 'invalid-email', validator: emailValidator, field: 'email' },
                { value: 'https://example.com', validator: urlValidator, field: 'url' },
            ]);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('email:');
        });
        it('should assert valid values without throwing', () => {
            const emailValidator = new runtime_validation_1.EmailValidator();
            expect(() => {
                runtime_validation_1.ValidationUtils.assert('test@example.com', emailValidator, 'email');
            }).not.toThrow();
        });
        it('should throw ValidationError for invalid values', () => {
            const emailValidator = new runtime_validation_1.EmailValidator();
            expect(() => {
                runtime_validation_1.ValidationUtils.assert('invalid-email', emailValidator, 'email');
            }).toThrow(runtime_validation_1.ValidationError);
        });
        it('should check validity without throwing', () => {
            const emailValidator = new runtime_validation_1.EmailValidator();
            expect(runtime_validation_1.ValidationUtils.isValid('test@example.com', emailValidator)).toBe(true);
            expect(runtime_validation_1.ValidationUtils.isValid('invalid-email', emailValidator)).toBe(false);
        });
    });
});
//# sourceMappingURL=runtime-validation.test.js.map