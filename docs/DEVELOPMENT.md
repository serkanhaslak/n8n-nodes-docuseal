# n8n-nodes-docuseal Development Guide

This guide documents important lessons learned, potential pitfalls, and best practices for developing and maintaining the n8n-nodes-docuseal project.

## TypeScript and ESLint Configuration

### Node Input/Output Configuration

One of the most challenging aspects of developing n8n custom nodes is handling the proper TypeScript typing for node inputs and outputs. There's often a conflict between TypeScript type requirements and ESLint rules specific to n8n.

**Problem**: The n8n node input/output format has changed across different versions of the n8n-workflow package. This can lead to conflicts between:

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

### Common TypeScript Errors During Build/Publish

When running `npm publish` or `pnpm build`, you may encounter TypeScript errors that prevent successful publishing:

  1. **TS6133: Variable is declared but its value is never read**
    - **Problem**: Occurs when you declare variables that you don't use in your code.
    - **Solution**: Either use the variable in your code or comment it out.

  2. **TS2322: Type assignment error**
    - **Problem**: Occurs when assigning a value of the wrong type.
    - **Solution**: Ensure proper type casting or use appropriate type definitions.

  3. **TS2339: Property does not exist on type**
    - **Problem**: Occurs when referencing a property that TypeScript doesn't recognize.
    - **Solution**: Ensure proper imports and interface definitions.

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
]
```

## Project Structure

### Resource Description Files

For better code organization, create separate description files for each resource type:

  1. **Template Operations/Fields**: `TemplateDescription.ts`
  2. **Submission Operations/Fields**: `SubmissionDescription.ts`
  3. **AI Tool Operations/Fields**: `AiToolDescription.ts`

Import and use these in your main node:

```typescript
import { templateOperations, templateFields } from './TemplateDescription';
// ... other imports

export class DocusealApi implements INodeType {
  description: INodeTypeDescription = {
    // ...
    properties: [
      // ...
      ...templateOperations,
      ...templateFields,
      // ... other operations/fields
    ],
  };
}
```

### Shared Utility Functions

Store reusable API functions in `GenericFunctions.ts`:

  - `docusealApiRequest`: Basic API request handler
  - `docusealApiRequestAllItems`: Pagination helper
  - `parseJsonInput`: Input parser for JSON parameters
  - `getTemplates`: Helper for template retrieval

## Webhook Implementation

When implementing the trigger node, be aware that the webhook method cannot use shared utility functions directly. Instead:

```typescript
// In webhook method
const submissionData = await this.helpers.request({
  method: 'GET',
  uri: `${baseUrl}/submissions/${submissionId}`,
  headers: {
    'X-Auth-Token': apiKey,
  },
  json: true,
});
```

## API Integration Considerations

### Authentication

  - DocuSeal uses API key authentication via `X-Auth-Token` header
  - Support both production and test environments with separate API keys

### Operations Structure

For comprehensive API integration, include:

  - Resource listing operations (getList)
  - Individual resource retrieval (get)
  - Create, update, and delete operations
  - Support for filtering parameters

## Testing and Publishing

Before publishing:

  1. Test all operations with real API credentials
  2. Run `npm run build` to check for TypeScript errors
  3. Fix any linting errors with `npm run lint`
  4. Update version in package.json following semantic versioning
  5. Use `npm publish --access public` to publish to npm registry
