import type { ValidationResult, FileValidationOptions, UrlValidationOptions } from './types';
export declare class ValidationError extends Error {
    readonly field?: string | undefined;
    readonly value?: unknown;
    constructor(message: string, field?: string | undefined, value?: unknown);
}
export declare abstract class BaseValidator {
    abstract validate(value: unknown): ValidationResult;
    protected createError(message: string, field?: string, value?: unknown): ValidationResult;
    protected createSuccess(): ValidationResult;
    protected isString(value: unknown): value is string;
    protected isNumber(value: unknown): value is number;
    protected isBoolean(value: unknown): value is boolean;
    protected isObject(value: unknown): value is Record<string, unknown>;
    protected isArray(value: unknown): value is unknown[];
    protected hasProperty(obj: Record<string, unknown>, prop: string): boolean;
}
export declare class EmailValidator extends BaseValidator {
    private readonly emailRegex;
    validate(value: unknown): ValidationResult;
}
export declare class UrlValidator extends BaseValidator {
    private readonly options;
    constructor(options?: UrlValidationOptions);
    validate(value: unknown): ValidationResult;
    private isPrivateIp;
    private isLocalhost;
}
export declare class ApiCredentialsValidator extends BaseValidator {
    validate(value: unknown): ValidationResult;
}
export declare class TemplateValidator extends BaseValidator {
    validate(value: unknown): ValidationResult;
}
export declare class SubmissionValidator extends BaseValidator {
    validate(value: unknown): ValidationResult;
}
export declare class SubmitterValidator extends BaseValidator {
    private readonly emailValidator;
    validate(value: unknown): ValidationResult;
}
export declare class FileValidator extends BaseValidator {
    private readonly options;
    constructor(options: FileValidationOptions);
    validate(value: unknown): ValidationResult;
    private getFileSignature;
    private matchesSignature;
    private isAllowedType;
}
export declare class ValidationFactory {
    static createEmailValidator(): EmailValidator;
    static createUrlValidator(options?: UrlValidationOptions): UrlValidator;
    static createApiCredentialsValidator(): ApiCredentialsValidator;
    static createTemplateValidator(): TemplateValidator;
    static createSubmissionValidator(): SubmissionValidator;
    static createSubmitterValidator(): SubmitterValidator;
    static createFileValidator(options: FileValidationOptions): FileValidator;
}
export declare const ValidationUtils: {
    validateMultiple(validations: Array<{
        value: unknown;
        validator: BaseValidator;
        field?: string;
    }>): ValidationResult;
    assert(value: unknown, validator: BaseValidator, field?: string): void;
    isValid(value: unknown, validator: BaseValidator): boolean;
};
//# sourceMappingURL=runtime-validation.d.ts.map