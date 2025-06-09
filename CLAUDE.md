# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an n8n community node package for DocuSeal, a document signing solution. The package provides two nodes:
- **DocusealApi**: Main API node for creating documents, managing templates, and handling submissions
- **DocusealTrigger**: Webhook trigger node for listening to DocuSeal events

## Recent Updates (v0.9.0)
- Complete rebuild with all DocuSeal API endpoints implemented
- Added Form and AI Tool resources for comprehensive API coverage
- Enhanced UX by replacing JSON inputs with proper n8n field types
- Fixed pagination to use cursor-based approach
- Added dynamic folder dropdown for template operations
- Reorganized all "Get Many" operations to follow n8n UX standards
- Fixed duplicate fields in submission create operation
- Implemented proper error handling with itemIndex

## Common Development Commands

```bash
# Install dependencies
pnpm install

# Build the project (TypeScript compilation + icon copying)
npm run build

# Development mode (watch TypeScript changes)
npm run dev

# Lint the code
npm run lint

# Fix linting issues
npm run lintfix

# Format code with Prettier
npm run format

# Prepare for publishing (runs build)
npm run prepublishOnly

# Publish to npm
npm publish --access public
```

## Architecture and Key Components

### Project Structure
- `credentials/DocusealApi.credentials.ts` - API credential definitions (production/test keys)
- `nodes/Docuseal/` - All node implementations
  - `DocusealApi.node.ts` - Main API node with all resources
  - `DocusealTrigger.node.ts` - Webhook trigger for DocuSeal events
  - `GenericFunctions.ts` - Shared utilities and helper functions
  - `TemplateDescription.ts` - Template resource operations
  - `SubmissionDescription.ts` - Submission resource operations
  - `SubmitterDescription.ts` - Submitter resource operations
  - `FormDescription.ts` - Form event tracking operations
  - `AiToolDescription.ts` - AI document generation operations

### Key Technical Details

1. **Node Input/Output Format**: Uses `NodeConnectionType.Main` format to avoid TypeScript/ESLint conflicts

2. **API Request Pattern**: All API calls go through `docusealApiRequest()` which handles:
   - Environment selection (production/test)
   - Authentication headers
   - Base URL configuration
   - Error handling with NodeApiError
   - Form data for file uploads

3. **Pagination**: Uses `docusealApiRequestAllItems()` for cursor-based pagination
   - Removed user-unfriendly "Before ID" and "After ID" filters
   - Handles pagination internally with cursor logic

4. **Field Organization**:
   - Required fields shown by default
   - Optional fields grouped in collections ("Additional Options", "Filters")
   - No duplicate fields between sections
   - Dynamic dropdowns using `loadOptionsMethod`

5. **Binary Data Handling**: 
   - `prepareBinaryData()` helper for file uploads
   - Support for both binary and URL inputs
   - Multiple file upload support

6. **Type Safety**:
   - Use `IHttpRequestOptions` (not `IRequestOptions`)
   - Proper type imports from 'n8n-workflow'
   - Handle undefined/null cases

## n8n UI Patterns

- **Collections**: Use `collection` type for grouping optional fields
- **Fixed Collections**: Use `fixedCollection` with `multipleValues: true` for arrays
- **Multi-Select**: Use `multiOptions` for fields allowing multiple selections
- **Dropdowns**: Use `loadOptionsMethod` for dynamic options (templates, folders)
- **Filters**: Keep "Return All" and "Limit" visible, other filters in collection

## Important Development Notes

- When modifying node parameters, ensure options are alphabetized to pass linting
- Boolean field descriptions should start with "Whether to"
- All operations include proper error handling with itemIndex
- The package follows n8n community node standards
- TypeScript strict mode is enabled - handle all potential null/undefined cases
- ESLint rules for node input/output format are disabled in favor of TypeScript types

## API Coverage

Complete implementation of DocuSeal API:
- **Templates**: Get, List, Create (PDF/DOCX/HTML), Clone, Merge, Update, Archive
- **Submissions**: Get, List, Create (Template/PDF/HTML), Get Documents, Archive  
- **Submitters**: Get, List, Update (with field configurations)
- **Forms**: Track form events (started, viewed)
- **AI Tools**: Generate documents from prompts

## Testing Checklist

Before publishing:
1. Run `npm run build` - should complete without errors
2. Run `npm run lint` - should pass all checks
3. Test all operations in n8n
4. Verify environment switching works (production/test)
5. Check binary file uploads work correctly
6. Test pagination on large datasets
7. Verify error messages are helpful