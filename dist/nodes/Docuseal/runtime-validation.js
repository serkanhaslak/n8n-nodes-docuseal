"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationUtils = exports.ValidationFactory = exports.FileValidator = exports.SubmitterValidator = exports.SubmissionValidator = exports.TemplateValidator = exports.ApiCredentialsValidator = exports.UrlValidator = exports.EmailValidator = exports.BaseValidator = exports.ValidationError = void 0;
class ValidationError extends Error {
    constructor(message, field, value) {
        super(message);
        Object.defineProperty(this, "field", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: field
        });
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: value
        });
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class BaseValidator {
    createError(message, field, value) {
        return {
            isValid: false,
            error: message,
            details: { field, value },
        };
    }
    createSuccess() {
        return { isValid: true };
    }
    isString(value) {
        return typeof value === 'string';
    }
    isNumber(value) {
        return typeof value === 'number' && !isNaN(value);
    }
    isBoolean(value) {
        return typeof value === 'boolean';
    }
    isObject(value) {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    }
    isArray(value) {
        return Array.isArray(value);
    }
    hasProperty(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }
}
exports.BaseValidator = BaseValidator;
class EmailValidator extends BaseValidator {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "emailRegex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        });
    }
    validate(value) {
        if (!this.isString(value)) {
            return this.createError('Email must be a string', 'email', value);
        }
        if (!this.emailRegex.test(value)) {
            return this.createError('Invalid email format', 'email', value);
        }
        return this.createSuccess();
    }
}
exports.EmailValidator = EmailValidator;
class UrlValidator extends BaseValidator {
    constructor(options = {}) {
        super();
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: options
        });
    }
    validate(value) {
        if (!this.isString(value)) {
            return this.createError('URL must be a string', 'url', value);
        }
        try {
            const url = new URL(value);
            if (this.options.requireHttps && url.protocol !== 'https:') {
                return this.createError('URL must use HTTPS protocol', 'url', value);
            }
            if (!this.options.allowPrivateIps && this.isPrivateIp(url.hostname)) {
                return this.createError('Private IP addresses are not allowed', 'url', value);
            }
            if (!this.options.allowLocalhost && this.isLocalhost(url.hostname)) {
                return this.createError('Localhost URLs are not allowed', 'url', value);
            }
            return this.createSuccess();
        }
        catch {
            return this.createError('Invalid URL format', 'url', value);
        }
    }
    isPrivateIp(hostname) {
        const privateRanges = [
            /^10\./,
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
            /^192\.168\./,
            /^127\./,
            /^169\.254\./,
        ];
        return privateRanges.some((range) => range.test(hostname));
    }
    isLocalhost(hostname) {
        return ['localhost', '127.0.0.1', '::1'].includes(hostname);
    }
}
exports.UrlValidator = UrlValidator;
class ApiCredentialsValidator extends BaseValidator {
    validate(value) {
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
            if (value[field].trim() === '') {
                return this.createError(`Field ${field} cannot be empty`, field, value[field]);
            }
        }
        const urlValidator = new UrlValidator({ requireHttps: true });
        const urlResult = urlValidator.validate(value.baseUrl);
        if (!urlResult.isValid) {
            return this.createError(`Invalid base URL: ${urlResult.error}`, 'baseUrl', value.baseUrl);
        }
        return this.createSuccess();
    }
}
exports.ApiCredentialsValidator = ApiCredentialsValidator;
class TemplateValidator extends BaseValidator {
    validate(value) {
        if (!this.isObject(value)) {
            return this.createError('Template must be an object', 'template', value);
        }
        if (!this.hasProperty(value, 'id') || !this.isNumber(value.id)) {
            return this.createError('Template must have a valid id', 'id', value.id);
        }
        if (!this.hasProperty(value, 'name') || !this.isString(value.name)) {
            return this.createError('Template must have a valid name', 'name', value.name);
        }
        if (!this.hasProperty(value, 'created_at') || !this.isString(value.created_at)) {
            return this.createError('Template must have a valid created_at', 'created_at', value.created_at);
        }
        if (this.hasProperty(value, 'fields') && !this.isArray(value.fields)) {
            return this.createError('Template fields must be an array', 'fields', value.fields);
        }
        return this.createSuccess();
    }
}
exports.TemplateValidator = TemplateValidator;
class SubmissionValidator extends BaseValidator {
    validate(value) {
        if (!this.isObject(value)) {
            return this.createError('Submission must be an object', 'submission', value);
        }
        if (!this.hasProperty(value, 'id') || !this.isNumber(value.id)) {
            return this.createError('Submission must have a valid id', 'id', value.id);
        }
        if (!this.hasProperty(value, 'template_id') || !this.isNumber(value.template_id)) {
            return this.createError('Submission must have a valid template_id', 'template_id', value.template_id);
        }
        if (!this.hasProperty(value, 'status') || !this.isString(value.status)) {
            return this.createError('Submission must have a valid status', 'status', value.status);
        }
        const validStatuses = ['pending', 'completed', 'expired', 'cancelled'];
        if (!validStatuses.includes(value.status)) {
            return this.createError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 'status', value.status);
        }
        if (!this.hasProperty(value, 'submitters') || !this.isArray(value.submitters)) {
            return this.createError('Submission must have a valid submitters array', 'submitters', value.submitters);
        }
        return this.createSuccess();
    }
}
exports.SubmissionValidator = SubmissionValidator;
class SubmitterValidator extends BaseValidator {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "emailValidator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new EmailValidator()
        });
    }
    validate(value) {
        if (!this.isObject(value)) {
            return this.createError('Submitter must be an object', 'submitter', value);
        }
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
        if (this.hasProperty(value, 'name') && !this.isString(value.name)) {
            return this.createError('Submitter name must be a string', 'name', value.name);
        }
        if (this.hasProperty(value, 'phone') && !this.isString(value.phone)) {
            return this.createError('Submitter phone must be a string', 'phone', value.phone);
        }
        if (this.hasProperty(value, 'completed') && !this.isBoolean(value.completed)) {
            return this.createError('Submitter completed must be a boolean', 'completed', value.completed);
        }
        return this.createSuccess();
    }
}
exports.SubmitterValidator = SubmitterValidator;
class FileValidator extends BaseValidator {
    constructor(options) {
        super();
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: options
        });
    }
    validate(value) {
        if (!Buffer.isBuffer(value) && !this.isString(value)) {
            return this.createError('File must be a Buffer or string', 'file', typeof value);
        }
        const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value, 'base64');
        if (buffer.length > this.options.maxSize) {
            return this.createError(`File size ${buffer.length} exceeds maximum ${this.options.maxSize}`, 'fileSize', buffer.length);
        }
        if (this.options.requireSignature) {
            const signature = this.getFileSignature(buffer);
            if (!this.isAllowedType(signature)) {
                return this.createError(`File type not allowed. Detected: ${signature}`, 'fileType', signature);
            }
        }
        return this.createSuccess();
    }
    getFileSignature(buffer) {
        const signatures = {
            'application/pdf': [0x25, 0x50, 0x44, 0x46],
            'image/jpeg': [0xff, 0xd8, 0xff],
            'image/png': [0x89, 0x50, 0x4e, 0x47],
            'application/zip': [0x50, 0x4b, 0x03, 0x04],
            'text/plain': [],
        };
        for (const [mimeType, sig] of Object.entries(signatures)) {
            if (sig.length === 0) {
                continue;
            }
            if (this.matchesSignature(buffer, sig)) {
                return mimeType;
            }
        }
        return 'unknown';
    }
    matchesSignature(buffer, signature) {
        if (buffer.length < signature.length) {
            return false;
        }
        return signature.every((byte, index) => buffer[index] === byte);
    }
    isAllowedType(signature) {
        return this.options.allowedTypes.includes(signature);
    }
}
exports.FileValidator = FileValidator;
class ValidationFactory {
    static createEmailValidator() {
        return new EmailValidator();
    }
    static createUrlValidator(options) {
        return new UrlValidator(options);
    }
    static createApiCredentialsValidator() {
        return new ApiCredentialsValidator();
    }
    static createTemplateValidator() {
        return new TemplateValidator();
    }
    static createSubmissionValidator() {
        return new SubmissionValidator();
    }
    static createSubmitterValidator() {
        return new SubmitterValidator();
    }
    static createFileValidator(options) {
        return new FileValidator(options);
    }
}
exports.ValidationFactory = ValidationFactory;
exports.ValidationUtils = {
    validateMultiple(validations) {
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
    assert(value, validator, field) {
        const result = validator.validate(value);
        if (!result.isValid) {
            throw new ValidationError(result.error ?? 'Validation failed', field, value);
        }
    },
    isValid(value, validator) {
        return validator.validate(value).isValid;
    },
};
//# sourceMappingURL=runtime-validation.js.map