"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOCUSEAL_STATUSES = exports.DOCUSEAL_EVENT_TYPES = exports.DOCUSEAL_API_ENDPOINTS = exports.isDocusealApiError = exports.isDocusealSubmitter = exports.isDocusealSubmission = exports.isDocusealTemplate = void 0;
function isDocusealTemplate(obj) {
    return typeof obj === 'object' && obj !== null && 'id' in obj && 'name' in obj;
}
exports.isDocusealTemplate = isDocusealTemplate;
function isDocusealSubmission(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'template_id' in obj &&
        'status' in obj);
}
exports.isDocusealSubmission = isDocusealSubmission;
function isDocusealSubmitter(obj) {
    return typeof obj === 'object' && obj !== null && 'email' in obj && 'role' in obj;
}
exports.isDocusealSubmitter = isDocusealSubmitter;
function isDocusealApiError(obj) {
    return typeof obj === 'object' && obj !== null && 'message' in obj && 'status' in obj;
}
exports.isDocusealApiError = isDocusealApiError;
exports.DOCUSEAL_API_ENDPOINTS = {
    TEMPLATES: '/templates',
    SUBMISSIONS: '/submissions',
    SUBMITTERS: '/submitters',
    FORMS: '/forms',
    DOCUMENTS: '/documents',
};
exports.DOCUSEAL_EVENT_TYPES = {
    SUBMISSION_CREATED: 'submission.created',
    SUBMISSION_COMPLETED: 'submission.completed',
    SUBMITTER_OPENED: 'submitter.opened',
    SUBMITTER_COMPLETED: 'submitter.completed',
};
exports.DOCUSEAL_STATUSES = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled',
    OPENED: 'opened',
};
//# sourceMappingURL=types.js.map