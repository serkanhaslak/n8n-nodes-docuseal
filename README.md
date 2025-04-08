![DocuSeal for n8n](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n-nodes-docuseal

This package contains n8n nodes to integrate with [DocuSeal](https://www.docuseal.co/), a modern open-source document signing and form solution.

## Features

Three nodes are included in this package to cover all DocuSeal integration needs:

1. **DocuSeal** - A regular node to perform CRUD operations on DocuSeal resources:
   - Templates: Get list, get a template by ID
   - Submissions: Create, get details, list submissions with filters, delete submissions, send email notifications
   - Submitters: Update details and values, get submitter by ID, list submitters with filters

2. **DocuSeal Trigger** - A webhook trigger node to start workflows based on DocuSeal events:
   - Submission created
   - Submission completed
   - Submitter opened form
   - Submitter completed form

3. **DocuSeal AI Tool** - A specialized node for pre-filling submission fields using AI-like logic:
   - Maps source data to form fields
   - Supports fallback values
   - Creates submissions with pre-filled data

## Installation

### In n8n

1. Go to **Settings > Community Nodes**
2. Click on **Install**
3. Enter `n8n-nodes-docuseal` in **Enter npm package name**
4. Click on **Install**

### Global Installation (Advanced)

```
npm install -g n8n-nodes-docuseal
```

## Usage

### Authentication

You need to set up a credentials entry with your DocuSeal API key:

1. In n8n, go to **Credentials**
2. Click on **Create New**
3. Search for "DocuSeal API"
4. Enter your API key (found in your DocuSeal account settings)
5. Optional: Customize the base URL if using a self-hosted instance

### DocuSeal Node

Use this node to interact with the DocuSeal API for common operations:

- **Templates**
  - Get a list of your templates
  - Get a specific template by ID

- **Submissions**
  - Create new submissions (send documents for signature)
  - Get submission details
  - List submissions with filtering options (status, template ID, email, etc.)
  - Delete a submission
  - Send email notifications for a submission

- **Submitters**
  - Update submitter information
  - Get a submitter by ID
  - List submitters with filtering options (status, email, submission ID, template ID, etc.)
  - Pre-fill form fields

### DocuSeal Trigger

This node creates a webhook endpoint that can be configured in your DocuSeal account:

1. Add the DocuSeal Trigger node to your workflow
2. Select the event type you want to listen for
3. Deploy your workflow to activate the webhook
4. Copy the webhook URL from n8n
5. Add this URL to your DocuSeal account's webhook settings

### DocuSeal AI Tool

This specialized node helps map data from various sources to DocuSeal form fields:

1. Configure your template ID
2. Provide the source data (in JSON format)
3. Set up field mappings to match source data fields to form fields
4. Define optional fallbacks for missing data
5. Execute to create a pre-filled submission

## Example Workflows

### Automated Contract Workflow

1. Trigger: When a new client record is created in CRM
2. DocuSeal AI Tool: Create contract submission with pre-filled client data
3. Wait: Until submission is completed (using DocuSeal Trigger)
4. Email: Send welcome message with signed contract attached

### Document Approval Process

1. Trigger: When a form is submitted in your application
2. DocuSeal: Create submission for approval document
3. Wait: For document completion (using DocuSeal Trigger)
4. Conditional: Check approval status
5. Branch workflow based on approval result

### Automated Follow-up Workflow

1. Schedule Trigger: Run daily to find pending submissions
2. DocuSeal: List submissions with status "pending"
3. Loop: For each pending submission
4. DocuSeal: Send email notification to remind submitters
5. Slack: Notify team about reminders sent

## Local Development

If you want to develop custom features for this integration:

```bash
# Clone repository
git clone https://github.com/serkanhaslak/n8n-nodes-docuseal.git

# Install dependencies
cd n8n-nodes-docuseal
pnpm install

# Build
pnpm build

# Link to your n8n installation
pnpm link
```

## Resources

- [DocuSeal API Documentation](https://www.docuseal.co/docs/api)
- [n8n Documentation](https://docs.n8n.io)
