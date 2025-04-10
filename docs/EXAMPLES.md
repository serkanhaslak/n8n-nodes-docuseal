# DocuSeal Node Usage Examples

This document provides practical examples of how to use the DocuSeal nodes in your n8n workflows.

## 1. Creating a Document Signing Request

This example demonstrates how to create a document signing request in DocuSeal using an existing template.

### Workflow Steps

1. **Trigger** (any trigger that provides recipient information)
2. **DocuSeal**: Create a submission

#### Example Configuration

For the DocuSeal node:

1. **Resource**: Submission
2. **Operation**: Create
3. **Template ID**: 1000001 (replace with your actual template ID)
4. **Submitters**:
   ```json
   [
     {
       "email": "{{$json.email}}",
       "name": "{{$json.firstName}} {{$json.lastName}}",
       "role": "Signer"
     }
   ]
   ```
5. **Options**:
   - **Fields**:
     ```json
     {
       "First Name": "{{$json.firstName}}",
       "Last Name": "{{$json.lastName}}",
       "Date": "{{$today}}",
       "Agreement Amount": "{{$json.contractAmount}}"
     }
     ```
   - **Send Email**: true

This workflow will create a new document signing request using a pre-existing template, pre-fill fields with data from the previous node, and send an email to the recipient.

## 2. Document Signing Webhook Automation

This example shows how to set up a workflow that triggers when a document is signed in DocuSeal.

### Workflow Steps

1. **DocuSeal Trigger**: Listen for submission events
2. **HTTP Request**: Send signed document data to another system
3. **Send Email**: Notify team about completed document

#### Trigger Configuration

For the DocuSeal Trigger node:

1. **Events**: Submission Completed
2. **Include Submission Data**: True

#### Webhook Setup in DocuSeal

1. Go to your DocuSeal account settings
2. Navigate to "Webhooks"
3. Add a new webhook with:
   - URL: Your n8n webhook URL (shown in the DocuSeal Trigger node)
   - Event: submission.completed
   - Format: JSON

This workflow will automatically trigger whenever a document is completed in DocuSeal, allowing you to process the signed document or notify team members.

## 3. Retrieving and Processing Templates

This example demonstrates how to list all available templates and process them in a workflow.

### Workflow Steps

1. **Schedule Trigger**: Run daily
2. **DocuSeal**: Get list of templates
3. **Loop**: Process each template

#### DocuSeal Configuration

1. **Resource**: Template
2. **Operation**: Get List
3. **Return All**: True

This workflow will retrieve all templates from your DocuSeal account and process them one by one, allowing you to perform operations like backing up templates or generating reports.

## 4. AI-Driven Document Creation

This example shows how to use the DocuSeal node with n8n's AI Agent to create document signing requests based on natural language instructions.

### Workflow Steps

1. **Chat Trigger**: Receive chat message
2. **AI Agent**: Process message and use DocuSeal node
3. **Respond**: Send confirmation

### AI Agent Configuration

1. Configure the AI Agent to use DocuSeal as a tool
2. Send instructions like: "Create a document signing request for John Doe (john@example.com) using the NDA template"

The AI Agent will:
1. Find the appropriate template
2. Create the submission with the correct recipient information
3. Return a confirmation with the signing link

This workflow demonstrates the power of combining AI with document automation to create a conversational interface for document signing.

## 5. Multi-Party Document Signing

This example shows how to create a document that requires multiple signers in a specific order.

### Workflow Steps

1. **Manual Trigger**: Start the process
2. **DocuSeal**: Create submission with multiple parties

#### DocuSeal Configuration

1. **Resource**: Submission
2. **Operation**: Create
3. **Template ID**: Your template ID
4. **Submitters**:
   ```json
   [
     {
       "email": "first@example.com",
       "name": "First Party",
       "role": "Seller"
     },
     {
       "email": "second@example.com",
       "name": "Second Party",
       "role": "Buyer"
     }
   ]
   ```
5. **Options**:
   - **Order**: "preserved"
   - **Send Email**: true

This will create a sequential signing flow where the second party receives the document only after the first party has signed.
