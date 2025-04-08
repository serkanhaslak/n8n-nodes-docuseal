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
   - **Solution**: Either use the variable in your code or comment it out. For temporarily unused variables (that will be used in future development), use the comment approach:
     ```typescript
     // Uncomment when environment-specific logic is needed
     // const environment = this.getNodeParameter('environment') as string;
     ```

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

### Required Components

1. **Custom API Credentials**:
   - Each API integration needs a credentials file (`credentials/DocusealApi.credentials.ts`)
   - Must include proper documentation URL with http/https protocol

2. **Node Files**:
   - Main API node (`nodes/Docuseal/DocusealApi.node.ts`) for CRUD operations
   - Trigger node (`nodes/Docuseal/DocusealTrigger.node.ts`) for webhook events
   - Specialized nodes (e.g., `DocusealAiTool.node.ts`) for specific functionality

3. **Index File**:
   - Must export all node types and credential types
   - Crucial for n8n to discover your custom nodes

### Project Cleanup

Before publishing, remove all example and starter files:
- Example nodes and credentials
- HttpBin examples
- Any other unrelated sample code

## Common Issues and Solutions

### Build Errors

If you encounter TypeScript errors during build:
1. Check for conflicts between TypeScript type definitions and ESLint rules
2. Update both n8n-workflow package AND ESLint configuration simultaneously
3. Consider disabling specific ESLint rules causing conflicts

### Package.json Configuration

Ensure your package.json includes:
- Proper author and repository information
- Correct n8n API version compatibility
- Scripts for building, linting, and publishing

## Pre-Publish Verification

Before running `npm publish`, always:

1. **Run the build process to catch errors**:
   ```bash
   pnpm build
   ```
   
2. **Fix all TypeScript and ESLint errors**
   - Unused variables should be commented out or removed
   - Fix type assignments and interface issues
   - Ensure all required imports are present

3. **Test the nodes functionality**
   - Test all operations with actual API credentials
   - Verify error handling for edge cases

## Publishing Best Practices

1. **Pre-Publish Checklist**:
   - All TypeScript and linting errors resolved
   - Example/starter code removed
   - All new features properly documented in README.md

2. **Version Management**:
   - Follow semantic versioning
   - Update changelog for each release

3. **Publishing Command**:
   ```
   npm publish --access public
   ```

## API Integration Considerations

### Authentication

- DocuSeal uses API key authentication via `X-Auth-Token` header
- Always use credential fields for storing sensitive data
- For multi-environment setups (Production/Test), use environment toggle to select the appropriate API key

### Operations Structure

For comprehensive API integration, include:
- Resource listing operations (getList)
- Individual resource retrieval (get)
- Create, update, and delete operations
- Support for filtering parameters

### Webhook Events

When implementing trigger nodes:
- Support all relevant webhook events from the API
- Provide clear descriptions for each event type
- Include proper webhook configuration instructions in README

## Testing and Validation

Before each release:
1. Test all operations with real API credentials
2. Verify proper error handling for API responses
3. Check compatibility with the latest n8n version

## Future Development

Areas for potential enhancement:
- Add more specialized operations for document templating
- Improve error handling and validation
- Consider adding custom UI components if needed

---

This guide should be updated as new challenges and solutions are discovered during the ongoing development of the n8n-nodes-docuseal project.
