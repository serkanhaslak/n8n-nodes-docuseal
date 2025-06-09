# n8n-nodes-docuseal

This package contains n8n nodes for [DocuSeal](https://www.docuseal.com), a document signing solution that makes it easy to create, send, and manage document signing requests.

[n8n](https://n8n.io) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

![DocuSeal Nodes for n8n](https://github.com/serkanhaslak/n8n-nodes-docuseal/blob/master/nodes/Docuseal/docuseal.svg)

## Installation

Follow these steps to install this package in your n8n instance:

### Community Nodes (Recommended)

For users on n8n v0.187.0+:

1. Open your n8n instance
2. Go to **Settings** > **Community Nodes**
3. Select **Install**
4. Enter `n8n-nodes-docuseal` in the "Enter npm package name" field
5. Select **Install**

### Manual Installation

If you're using a self-hosted n8n instance:

```bash
# In your n8n installation directory
npm install n8n-nodes-docuseal

# Start n8n
n8n start
```

## Features

The package includes two powerful nodes:

### 1. DocuSeal

The main API node with comprehensive support for all DocuSeal API operations:

#### Templates

- **Get**: Retrieve a template by ID
- **Get Many**: List templates with filtering options
- **Create from PDF**: Create templates from PDF files
- **Create from DOCX**: Create templates from Word documents
- **Create from HTML**: Create templates from HTML content
- **Clone**: Duplicate existing templates
- **Merge**: Combine multiple templates into one
- **Update**: Modify template properties
- **Update Documents**: Replace template documents
- **Archive**: Remove templates from active use

#### Submissions

- **Create**: Create new document signing requests from templates
- **Create from PDF**: Create submissions directly from PDF files
- **Create from HTML**: Create submissions from HTML content
- **Get**: Retrieve submission details by ID
- **Get Documents**: Download completed documents from submissions
- **Get Many**: List submissions with advanced filtering
- **Archive**: Archive completed submissions

#### Submitters

- **Get**: Retrieve submitter information by ID
- **Get Many**: List submitters with filtering options
- **Update**: Modify submitter details and field values

#### Forms

- **Get Started**: Track when forms are started
- **Get Viewed**: Monitor form view events

#### AI Tools

- **Generate Document**: Create documents using AI with customizable prompts, languages, and styles

### 2. DocuSeal Trigger

A webhook-based trigger node that:

- Listens for DocuSeal events like submission completions and creations
- Provides detailed setup instructions for webhook configuration
- Supports event filtering and additional data fetching

## Credentials

The nodes use a custom credential type with the following fields:

- **Production API Key**: Your main DocuSeal API key
- **Test API Key**: Optional API key for your test environment
- **Base URL**: API endpoint (defaults to [https://api.docuseal.com](https://api.docuseal.com))

## Usage Examples

### Creating a Document Signing Request

1. Add the **DocuSeal** node to your workflow
2. Select the **Submission** resource and **Create** operation
3. Choose a template from the dropdown or specify an ID
4. Add submitters using the intuitive UI (no JSON required!)
5. Optionally pre-fill field values and set preferences

### Creating Templates from Documents

1. Add the **DocuSeal** node to your workflow
2. Select the **Template** resource
3. Choose **Create from PDF/DOCX/HTML** operation
4. Upload your document or provide a URL
5. Configure field settings and folder organization

### Generating Documents with AI

1. Add the **DocuSeal** node to your workflow
2. Select the **AI Tool** resource and **Generate Document** operation
3. Specify:
   - Document Type: "Non-disclosure agreement"
   - Description: "Standard NDA for a contractor relationship between Acme Inc. and John Doe"
   - Language: Choose from 12 supported languages
   - Style: Formal, Friendly, or Simple

### Listening for Document Completions

1. Add the **DocuSeal Trigger** node as the start of your workflow
2. Select **Submission Completed** as the event type
3. Configure the webhook in your DocuSeal dashboard as instructed

## Resources

- [DocuSeal API Documentation](https://www.docuseal.com/docs/api)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## Support

If you need assistance or want to report issues, please:

- Open an issue on [GitHub](https://github.com/serkanhaslak/n8n-nodes-docuseal/issues)
- Check the [development guide](./docs/DEVELOPMENT.md) for troubleshooting common issues
