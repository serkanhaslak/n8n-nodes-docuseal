# DocuSeal n8n Integration - Revised Implementation Plan

## Project Overview
This project aims to develop a comprehensive n8n integration for DocuSeal, enabling users to manage document templates, submissions, and receive webhook events within their n8n workflows.

## Implementation Strategy

Based on analysis of n8n core node patterns, we'll adopt the following approach:

### 1. Consolidated Node Structure
We will use a consolidated node structure that aligns with n8n best practices:

- **DocusealApi Node**: Main node for all API operations with `usableAsTool: true`
- **DocusealTrigger Node**: Separate webhook-based node (standard practice)
- **Remove DocusealAiTool Node**: Integrate this functionality into the main API node

This structure follows the pattern used by established nodes like Stripe, Twilio, and NASA.

### 2. API Credentials

The credentials file will:
- Support both test and production environments
- Use the correct documentation URL (https://www.docuseal.com/docs/api)
- Provide clear descriptions for API keys

### 3. API Node Implementation

The API node will:
- Support all required operations through a single class
- Use `usableAsTool: true` to enable AI integration
- Handle environment switching (test/production)
- Implement proper error handling and response processing
- Support JSON fields for submission creation

#### Resources and Operations
- **Template Operations**:
  - List all templates
  - Get a template

- **Submission Operations**:
  - List all submissions
  - Get a submission
  - Create a submission
  - Archive a submission

### 4. Trigger Node Implementation

The trigger node will:
- Support DocuSeal webhook events
- Handle event filtering
- Provide clear setup instructions
- Not be usable as a tool (standard for trigger nodes)

### 5. Code Structure and Organization

We'll organize the code using:
- Clear separation of concerns by resource and operation
- Proper TypeScript typing for API responses
- Comprehensive parameter validation
- Self-documenting code with clear comments

## Cleanup Tasks

1. **Remove Unnecessary Files**:
   - Delete the redundant DocusealAiTool.node.ts
   - Remove any example or starter files

2. **Fix API Endpoints**:
   - Update all URLs to use the correct domain (docuseal.com instead of docuseal.co)
   - Ensure proper API path construction

3. **Fix Credential Properties**:
   - Update documentationUrl
   - Ensure proper environment handling

## Implementation Phases

### Phase 1: Project Cleanup
- Remove unnecessary files
- Update credentials implementation
- Fix API endpoints and URLs

### Phase 2: API Node Enhancement
- Consolidate AI Tool functionality into main API node
- Implement all required operations
- Add usableAsTool support with proper parameter handling

### Phase 3: Trigger Node Enhancement
- Improve webhook event handling
- Add comprehensive instructions
- Support all required event types

### Phase 4: Testing & Documentation
- Test all operations with DocuSeal API
- Create comprehensive documentation
- Ensure proper error handling

## Technical Implementation Details

### API Request Handling
```typescript
// Example of consolidated API request function
async function docusealApiRequest(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject = {},
  qs: IDataObject = {},
) {
  const credentials = await this.getCredentials('docusealApi');
  const environment = this.getNodeParameter('environment', 0, 'production') as string;
  
  let apiKey = '';
  if (environment === 'production') {
    apiKey = credentials.productionApiKey as string;
  } else {
    apiKey = credentials.testApiKey as string;
  }

  const baseUrl = 'https://api.docuseal.com';
  
  const options = {
    method,
    uri: `${baseUrl}${endpoint}`,
    qs,
    body,
    json: true,
    headers: {
      'X-Auth-Token': apiKey,
    },
  };

  try {
    return await this.helpers.request(options);
  } catch (error) {
    throw new NodeOperationError(this.getNode(), error as Error);
  }
}
```

### AI Tool Integration
```typescript
// Example of handling both node execution and AI tool usage
if (operation === 'create') {
  // Get parameters
  const templateId = this.getNodeParameter('templateId', i) as string;
  
  // Support both string JSON and object formats (for AI tool use)
  let fields;
  const fieldsInput = this.getNodeParameter('fields', i);
  
  if (typeof fieldsInput === 'string') {
    // Regular node usage with JSON string
    try {
      fields = JSON.parse(fieldsInput);
    } catch (error) {
      throw new NodeOperationError(this.getNode(), 'Invalid JSON in fields parameter');
    }
  } else if (typeof fieldsInput === 'object') {
    // AI tool usage with object
    fields = fieldsInput;
  }
  
  // Continue with API request
}
```

This implementation plan follows the best practices observed in mature n8n nodes while addressing the specific requirements of the DocuSeal integration.
