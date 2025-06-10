/// <reference types="node" />
/// <reference types="node" />
import type { IDataObject } from 'n8n-workflow';
export interface DocusealApiCredentials {
    productionApiKey: string;
    testApiKey: string;
    baseUrl: string;
}
export interface DocusealEnvironment {
    environment: 'production' | 'test';
}
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
export interface DocusealDocument {
    id: number;
    filename: string;
    content_type: string;
    size: number;
    url: string;
    created_at: string;
}
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
export interface DocusealWebhookEvent {
    event: 'submission.created' | 'submission.completed' | 'submitter.opened' | 'submitter.completed';
    data: DocusealSubmission | DocusealSubmitter;
    timestamp: string;
    submission_id?: number;
    submitter_id?: number;
}
export interface DocusealAuditEvent {
    id: number;
    action: string;
    user_email?: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
    metadata?: Record<string, unknown>;
}
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
export interface DocusealApiError {
    message: string;
    status: number;
    code?: string;
    details?: Record<string, unknown>;
}
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
export type DocusealResource = 'template' | 'submission' | 'submitter' | 'form';
export type DocusealOperation = 'get' | 'getMany' | 'create' | 'update' | 'delete';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export interface NodeParameters extends IDataObject {
    resource: DocusealResource;
    operation: DocusealOperation;
    environment?: 'production' | 'test';
    returnAll?: boolean;
    limit?: number;
    filters?: IDataObject;
    additionalFields?: IDataObject;
}
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
export declare function isDocusealTemplate(obj: unknown): obj is DocusealTemplate;
export declare function isDocusealSubmission(obj: unknown): obj is DocusealSubmission;
export declare function isDocusealSubmitter(obj: unknown): obj is DocusealSubmitter;
export declare function isDocusealApiError(obj: unknown): obj is DocusealApiError;
export declare const DOCUSEAL_API_ENDPOINTS: {
    readonly TEMPLATES: "/templates";
    readonly SUBMISSIONS: "/submissions";
    readonly SUBMITTERS: "/submitters";
    readonly FORMS: "/forms";
    readonly DOCUMENTS: "/documents";
};
export declare const DOCUSEAL_EVENT_TYPES: {
    readonly SUBMISSION_CREATED: "submission.created";
    readonly SUBMISSION_COMPLETED: "submission.completed";
    readonly SUBMITTER_OPENED: "submitter.opened";
    readonly SUBMITTER_COMPLETED: "submitter.completed";
};
export declare const DOCUSEAL_STATUSES: {
    readonly PENDING: "pending";
    readonly COMPLETED: "completed";
    readonly EXPIRED: "expired";
    readonly CANCELLED: "cancelled";
    readonly OPENED: "opened";
};
//# sourceMappingURL=types.d.ts.map