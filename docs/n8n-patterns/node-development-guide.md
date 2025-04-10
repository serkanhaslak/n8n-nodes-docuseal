# n8n Node Development Guide

## Node Structure Overview

### General Structure
n8n nodes are TypeScript classes that implement the `INodeType` interface. Each node has:

1. **Description**: Metadata about the node (name, icon, inputs/outputs, etc.)
2. **Properties**: UI configuration and input parameters
3. **Methods**: For node execution (`execute` method) or tool supply (`supplyData`)

### INodeType Implementation
A typical n8n node class looks like:

```typescript
export class DocusealApi implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'DocuSeal',
    name: 'docusealApi',
    icon: 'file:docuseal.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Interact with DocuSeal API',
    defaults: {
      name: 'DocuSeal',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: 'docusealApi',
        required: true,
      },
    ],
    properties: [
      // Parameter definitions
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    // Execution logic
  }
}
```

## Node Types

### Regular Nodes
- Uses the `execute` method
- Has inputs and outputs
- Process data and returns transformed data

### Trigger Nodes
- Uses the `trigger` method
- Responds to webhook events
- May include methods for webhook setup/teardown

### Tool Nodes
- Set `usableAsTool: true` in node description
- Designed for use with AI Agents
- Must follow specific patterns to work with the agent system

## Node Property Configuration
Properties define the UI elements and parameters for the node:

```typescript
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  options: [
    {
      name: 'Create',
      value: 'create',
      description: 'Create a submission',
      action: 'Create a submission',
    },
    // Other operations
  ],
  default: 'create',
}
```

## Input/Output Configuration

### Using NodeConnectionType
```typescript
// Correct way according to n8n-workflow type definitions
inputs: [NodeConnectionType.Main],
outputs: [NodeConnectionType.Main],
```

### ESLint Conflicts
When using the above format, you may need to disable specific ESLint rules:
```javascript
// In .eslintrc.js
'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'off',
'n8n-nodes-base/node-class-description-outputs-wrong': 'off',
```

## Making API Requests
Use the `helpers.requestWithAuthentication` method:

```typescript
const responseData = await this.helpers.requestWithAuthentication.call(
  this,
  'docusealApi',
  {
    method: 'GET',
    url: 'https://api.docuseal.com/submissions',
    qs: queryParameters,
    json: true,
  }
);
```

## Error Handling
Proper error handling is important:

```typescript
try {
  // API request or processing logic
} catch (error) {
  if (this.continueOnFail()) {
    return [this.helpers.returnJsonArray({ error: error.message })];
  }
  throw error;
}
```

## Credentials
Credentials are defined separately and referenced by the node:

```typescript
// In DocusealApi.credentials.ts
export class DocusealApi implements ICredentialType {
  name = 'docusealApi';
  displayName = 'DocuSeal API';
  documentationUrl = 'https://www.docuseal.com/docs/api';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
    },
    // Other properties
  ];
}
```

## usableAsTool Configuration
For AI Agent integration:

```typescript
{
  description: {
    // ...existing description
    usableAsTool: true,
  },
  
  // Specialized methods for tool functionality
  supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
    // Supply data to AI agent
  }
}
```

## Testing
Test all node operations with a local n8n instance:
```
npx n8n start
```
