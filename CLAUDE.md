# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

This is an n8n community node package for DocuSeal, a document signing solution.
The package provides two main nodes:

- **DocuSeal API Node**: Full API integration with templates, submissions,
  submitters, and forms
- **DocuSeal Trigger Node**: Webhook-based trigger for DocuSeal events

## Common Development Commands

### Building and Development

```bash
# Build the project (includes TypeScript compilation and icon processing)
npm run build

# Build with watch mode for development
npm run dev

# Clean build artifacts
npm run clean

# Build for production
npm run build:prod
```

### Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### Code Quality

```bash
# Run TypeScript type checking
npm run type-check

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check code formatting
npm run format:check

# Run all validations (type-check, lint, format, test)
npm run validate
```

### Publishing

#### Local Publishing (for development)

```bash
# Publish patch version locally
npm run release:patch:local

# Publish minor version locally
npm run release:minor:local

# Publish major version locally
npm run release:major:local
```

#### NPM Publishing (with API key)

Set up NPM authentication using the NPM_KEY environment variable in `.env` file:

```bash
# Set NPM authentication token
echo "//registry.npmjs.org/:_authToken=${NPM_KEY}" > ~/.npmrc

# Publish patch version to npm
npm version patch && npm publish

# Publish minor version to npm
npm version minor && npm publish

# Publish major version to npm
npm version major && npm publish
```

**Important**:

- Always run `npm run validate` before publishing to ensure code quality
- Check current version in `package.json` before publishing
- The build process automatically runs during `npm publish` via `prepublishOnly`
  script
- Use patch for bug fixes, minor for new features, major for breaking changes

## Architecture

### Core Structure

- `credentials/DocusealApi.credentials.ts`: API credential configuration
  supporting production/test environments
- `nodes/Docuseal/DocusealApi.node.ts`: Main API node implementation
- `nodes/Docuseal/DocusealTrigger.node.ts`: Webhook trigger node
- `nodes/Docuseal/GenericFunctions.ts`: Shared utility functions for API
  requests, validation, and data processing

### Resource Descriptions

Each resource type has its own description file defining operations and fields:

- `TemplateDescription.ts`: Template operations (create, get, update, archive,
  clone, merge)
- `SubmissionDescription.ts`: Submission operations (create, get documents,
  archive)
- `SubmitterDescription.ts`: Submitter operations (get, update)
- `FormDescription.ts`: Form event operations (get started, get viewed)

### Key Features

- **Multi-environment support**: Production and test API keys
- **AI Tool integration**: Supports n8n AI Agent with detailed parameter
  descriptions
- **Security validation**: API key validation, file type/size restrictions
- **Comprehensive error handling**: Detailed error messages and retry logic
- **Dynamic option loading**: Template and submitter dropdowns populated from
  API

## Important Development Notes

### Critical Bug Fixes Applied

**Submitters Array Validation Issue (GitHub #1)**: Fixed the "Submitters
parameter must be a valid array" error by:

- Supporting multiple input formats: fixedCollection `{submitter: [...]}`,
  direct arrays `[...]`, and JSON strings
- Adding comprehensive validation with descriptive error messages including
  examples
- Implementing proper email format validation
- Handling edge cases like empty objects and malformed data

**Parameter Handling Bug (GitHub #7)**: Fixed the
`"Error extra { "parameterName": "" }"` error by:

- Correcting empty parameter name in `buildFieldValues()` function call
- Adding proper parameter collection for `fieldValuesMode`, `fieldValues`, and
  `fieldValuesJson`
- Enhanced error handling with try-catch blocks and descriptive error messages
- Fixed rimraf dependency issue for npm installation

**AI Tool Integration**: Fully integrated existing AI tool functionality:

- Added "AI Tool" resource to main dropdown
- Implemented `generateDocument` operation with `/ai/documents` endpoint
- Supports 12 languages and 3 writing styles (formal, friendly, simple)

### TypeScript/ESLint Configuration

This project uses specific ESLint rule overrides to handle conflicts between n8n
node requirements and TypeScript types:

- `n8n-nodes-base/node-class-description-inputs-wrong-regular-node`: disabled
- `n8n-nodes-base/node-class-description-outputs-wrong`: disabled

Always use `NodeConnectionType.Main` format for inputs/outputs in node files.

### Error Handling Best Practices

When adding new functionality, follow these patterns:

- Provide detailed error messages with examples of correct format
- Include parameter context in error messages (e.g., "Submitter at index 2...")
- Use descriptive error messages that help users fix the issue
- Validate input early and fail fast with helpful guidance

### Input Validation Patterns

For complex parameters like submitters:

```typescript
// Always validate input format first
if (!inputData) {
  throw new Error('Parameter is required. Expected format: {...}');
}

// Support multiple input formats
if (typeof inputData === 'string') {
  // Handle JSON string
} else if (Array.isArray(inputData)) {
  // Handle direct array
} else if (inputData && typeof inputData === 'object') {
  // Handle object format
}

// Validate each item with index for better debugging
items.map((item, index) => {
  if (!item.requiredField) {
    throw new Error(`Item at index ${index} missing required field`);
  }
});
```

### Testing Strategy

- Unit tests for utilities and functions
- Integration tests for API operations
- Comprehensive coverage reporting
- Jest configuration supports parallel execution and detailed reporting

### Security Considerations

- API key validation with pattern matching
- File type and size restrictions for uploads
- URL validation for external resources
- Input sanitization for all user-provided data

## Node Configuration

### Package.json n8n Configuration

```json
"n8n": {
  "n8nNodesApiVersion": 1,
  "credentials": [
    "dist/credentials/DocusealApi.credentials.js"
  ],
  "nodes": [
    "dist/nodes/Docuseal/DocusealApi.node.js",
    "dist/nodes/Docuseal/DocusealTrigger.node.js"
  ]
}
```

### Build Process

The build process uses TypeScript compilation followed by Gulp for icon
processing. The `dist/` directory contains the compiled output that gets
published to npm.

## Common Patterns

### API Request Handling

All API requests go through `docusealApiRequest()` in GenericFunctions.ts, which
handles:

- Environment-based API key selection
- Error handling and response parsing
- Request timeout and retry logic

### Parameter Validation

Input validation is handled at multiple levels:

- Runtime validation using custom validation functions
- TypeScript type checking at compile time
- ESLint rules for code quality

### Option Loading

Dynamic options (templates, submitters) are loaded via `loadOptions` methods
that query the DocuSeal API and format results for n8n dropdowns.
