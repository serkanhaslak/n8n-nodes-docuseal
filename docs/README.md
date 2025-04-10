# n8n-nodes-docuseal

This package contains n8n nodes for [DocuSeal](https://www.docuseal.com), a document signing solution. The integration allows you to create document signing requests, monitor document submissions, and generate documents using AI.

## Features

The package includes two main nodes:

### 1. DocuSeal

The main API node that allows you to:

- **Templates**: List and retrieve document templates
- **Submissions**: Create, list, retrieve, and archive document signing requests
- **AI Tools**: Generate documents using AI based on descriptions and party information

### 2. DocuSeal Trigger

A webhook-based trigger node that:

- Listens for DocuSeal events (submission completions, submission creations, submitter events)
- Provides detailed setup instructions for configuring webhooks in DocuSeal
- Can fetch additional submission details when events are received

## Credentials

The nodes use a custom credential type that supports:

- **Production API Key**: For your production DocuSeal environment
- **Test API Key**: For your test/sandbox DocuSeal environment
- **Base URL**: Configurable API endpoint (defaults to [https://api.docuseal.com](https://api.docuseal.com))

## Implementation Details

The implementation follows best practices from core n8n nodes:

- **Modular Structure**: Operations and parameters are organized into separate resource description files
- **Shared Utilities**: Common API functions are in GenericFunctions.ts
- **Environment Support**: Toggle between test and production environments
- **Error Handling**: Robust error management with helpful messages

## Development

For contributors and developers interested in enhancing these nodes, see [DEVELOPMENT.md](./DEVELOPMENT.md) for guidelines, best practices, and common issues.
