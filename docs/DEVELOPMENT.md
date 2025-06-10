# n8n-nodes-docuseal Development Guide

This guide documents important lessons learned, potential pitfalls, and best
practices for developing and maintaining the n8n-nodes-docuseal project.

## Project Architecture

The package follows a standard n8n community node structure:

- `credentials/`: Contains the DocuSeal API credential definition
- `nodes/Docuseal/`: Contains all node implementations
  - `DocusealApi.node.ts`: Main API node implementation
  - `DocusealTrigger.node.ts`: Webhook trigger node
  - `TemplateDescription.ts`: Template resource operations and fields
  - `SubmissionDescription.ts`: Submission resource operations and fields
  - `GenericFunctions.ts`: Shared utility functions for API requests
  - `docuseal.svg`: Node icon

## TypeScript and ESLint Configuration

### Node Input/Output Configuration

One of the most challenging aspects of developing n8n custom nodes is handling
the proper TypeScript typing for node inputs and outputs. There's often a
conflict between TypeScript type requirements and ESLint rules specific to n8n.

**Problem**: The n8n node input/output format has changed across different
versions of the n8n-workflow package. This can lead to conflicts between:

- TypeScript type definitions requiring `NodeConnectionType.Main`
- ESLint rules expecting `['main']` string array format

**Solution**:

1. Use `NodeConnectionType.Main` format in all node files:

```typescript
import { NodeConnectionType } from 'n8n-workflow';

// ...

inputs: [NodeConnectionType.Main],
outputs: [NodeConnectionType.Main],
```

2. Disable conflicting ESLint rules in `.eslintrc.js`:

```javascript
'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'off',
'n8n-nodes-base/node-class-description-outputs-wrong': 'off',
```

### Alphabetization Requirements

Always alphabetize options in node parameters to avoid linting errors:

```typescript
options: [
  {
    displayName: 'After',
    name: 'after',
    // ...
  },
  {
    displayName: 'Email',
    name: 'email',
    // ...
  },
  // Additional options in alphabetical order...
];
```

## AI Integration Best Practices

When developing nodes that will be used with n8n's AI Agent feature, follow
these best practices:

### 1. Detailed Parameter Descriptions

Provide comprehensive descriptions for all parameters, especially for complex
JSON inputs:

```typescript
{
  displayName: 'Submitters',
  name: 'submitters',
  type: 'json',
  default: '[{"email": "example@email.com"}]',
  description: 'Array of submitters with detailed format example: [{"email": "user@example.com", "name": "User Name", "role": "First Party", "phone": "+1234567890"}]',
}
```

### 2. Include Schema Examples

For complex parameters, include complete schema examples in the description:

```typescript
description: 'JSON object with field values. Example: {"First Name": "John", "Signature": "data:image/png;base64,..."}',
```

### 3. Use the Tool Specification

To make your node available as an AI tool, include the toolSpecification
property:

```typescript
// @ts-ignore
toolSpecification: {
  name: 'DocuSeal',
  displayName: 'DocuSeal',
  description: 'Create documents, manage templates, and handle submissions with DocuSeal',
  icon: 'file:docuseal.svg',
  supportAiNode: true,
},
```

## Environment Handling

For credentials that support multiple environments (like production/test),
ensure you properly handle environment selection:

```typescript
// Get environment (production or test)
let environment: string;

try {
  environment = this.getNodeParameter('environment', 0) as string;
} catch (error) {
  // Default to production if parameter is not accessible
  environment = 'production';
}

// Set API key based on environment
let apiKey = '';
if (environment === 'production') {
  apiKey = credentials.productionApiKey as string;
} else {
  apiKey = credentials.testApiKey as string;
}
```

## Common Issues and Solutions

### Build Errors

If you encounter TypeScript errors during build:

1. Check for conflicts between TypeScript type definitions and ESLint rules
2. Update both n8n-workflow package AND ESLint configuration simultaneously
3. Consider disabling specific ESLint rules causing conflicts

### Package.json Configuration

Ensure your package.json includes:

```json
"files": [
  "dist",
  "index.js"
],
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

## Publishing Best Practices

1. **Pre-Publish Checklist**:

   - All linting errors resolved or specific rules disabled
   - Example/starter code removed
   - All new features properly documented in README.md

2. **Version Management**:

   - Follow semantic versioning
   - Update version in package.json before publishing

3. **Publishing Command**:
   ```
   npm publish --access public
   ```

## Future Development Ideas

- Add support for more DocuSeal API operations
- Enhance error handling with more descriptive messages
- Add support for custom field types and values
- Improve template handling and creation capabilities
