# Changelog

## [0.9.0] - 2025-01-06

### Added
- Complete Template resource implementation with all operations:
  - Create from PDF/DOCX/HTML
  - Clone, Merge, Update, Update Documents, Archive
- Enhanced Submission resource with:
  - Create from PDF/HTML operations
  - Get Documents operation for downloading completed documents
  - Improved UX with proper field types instead of JSON inputs
- Form resource for tracking form events (Started/Viewed)
- AI Tool resource for document generation with language and style options
- Proper file upload support for binary operations
- Enhanced pagination with cursor-based navigation
- Better error handling with item indexes

### Changed
- Redesigned submission creation with intuitive fixedCollection UI for submitters
- Replaced complex JSON inputs with proper n8n field types throughout
- Updated submitter update to use correct HTTP method (PUT instead of PATCH)
- Improved field validation and error messages
- Enhanced AI integration readiness (removed unsupported usableAsTool property)

### Fixed
- TypeScript compilation errors with proper type definitions
- ESLint issues with alphabetization and error handling
- Pagination implementation for better performance with large datasets
- Binary file handling for document uploads

## [0.8.2] - Previous version
- Basic template and submission operations
- Initial implementation