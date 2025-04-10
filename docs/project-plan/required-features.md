# DocuSeal n8n Integration - Required Features

## 1. API Credentials

### Requirements
- Support both Test and Production API keys
- Allow selection between environments in nodes
- Include proper documentation URL

### Implementation
- Update `DocusealApi.credentials.ts` to ensure both API key types are properly handled
- Fix the documentationUrl to use the correct URL (currently incorrect: docuseal.co instead of docuseal.com)
- Support environment switching in all nodes

## 2. DocuSeal API Node (Action Node)

### Requirements
- Must be usable as a tool (`usableAsTool: true`)
- Support environment selection (Test/Production)
- Support the following operations:

#### Template Operations
- **List all templates**
  - Pagination support
  - Search/filtering options
- **Get a template**
  - Retrieve by ID

#### Submission Operations
- **List all submissions**
  - Filtering by status, template_id, etc.
  - Pagination support
- **Get a submission**
  - Retrieve by ID
- **Create a submission**
  - Support sending fields as JSON
  - Email notification options
- **Archive a submission**
  - Mark a submission as archived

### Implementation
- Update the existing `DocusealApi.node.ts`
- Ensure all operations follow n8n patterns
- Fix any bugs in the existing implementation
- Verify support for JSON fields in submission creation

## 3. DocuSeal Trigger Node

### Requirements
- Handle submission webhook events:
  - submission.created
  - submission.completed
  - submission.expired
  - submission.archived
- Proper event filtering
- Environment selection support

### Implementation
- Update the existing `DocusealTrigger.node.ts`
- Ensure correct handling of all event types
- Improve webhook setup instructions
- Add webhook verification if supported by DocuSeal

## 4. AI Integration (usableAsTool)

### Requirements
- Make DocusealApi node usable as an AI tool
- Allow AI to fill form fields

### Implementation
- Add usableAsTool property to DocusealApi node
- Update the existing DocusealAiTool.node.ts if needed
- Ensure proper JSON field support for AI field filling
