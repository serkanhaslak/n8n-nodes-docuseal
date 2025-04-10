# n8n-nodes-docuseal

This package contains n8n nodes for [DocuSeal](https://www.docuseal.com), a document signing solution. The integration allows you to easily create document signing requests and monitor document submissions within your n8n workflows.

## Features

The package includes two main nodes:

### 1. DocuSeal

The main API node that allows you to:

- **Templates**: List and retrieve document templates
- **Submissions**: Create, list, retrieve, and archive document signing requests

### 2. DocuSeal Trigger

A webhook-based trigger node that:

- Listens for DocuSeal events (submission completions, submission creations, submitter events)
- Provides detailed setup instructions for configuring webhooks in DocuSeal
- Can fetch additional submission details when events are received

## Installation

Install this package in your n8n instance:

```bash
npm install n8n-nodes-docuseal
```

Or if you're using the desktop application or Docker container:

```bash
# Using n8n cli
n8n-node-dev --install n8n-nodes-docuseal

# In Docker, you can add to your Dockerfile
RUN cd /usr/local/lib/node_modules/n8n && npm install n8n-nodes-docuseal
```

## Credentials

The nodes use a custom credential type that supports:

- **Production API Key**: For your production DocuSeal environment
- **Test API Key**: For your test/sandbox DocuSeal environment
- **Base URL**: Configurable API endpoint (defaults to [https://api.docuseal.com](https://api.docuseal.com))

You can easily switch between test and production environments within the node settings.

## AI Integration

The DocuSeal node is optimized for use with n8n's AI Agent feature, allowing AI-driven document workflows. The node includes:

- Detailed parameter descriptions for AI to understand JSON formats
- Examples showing proper structuring of complex JSON objects
- AI-friendly field mappings and descriptions

## Implementation Details

The implementation follows best practices from core n8n nodes:

- **Modular Structure**: Operations and parameters are organized into separate resource description files
- **Shared Utilities**: Common API functions are centralized in GenericFunctions.ts
- **Environment Support**: Easily toggle between test and production environments
- **Error Handling**: Robust error management with helpful messages

## Development

For contributors and developers interested in enhancing these nodes, see [DEVELOPMENT.md](./DEVELOPMENT.md) for guidelines, best practices, and common issues.

## Usage Examples

See [EXAMPLES.md](./EXAMPLES.md) for common workflow scenarios and how to implement them.

## Version History

- **v0.4.3**: Enhanced AI integration with improved parameter descriptions
- **v0.4.2**: Updated DocuSeal SVG logo and cleaned up package structure
- **v0.4.0/0.4.1**: Simplified package by removing AI Tool functionality
- **v0.3.0-0.3.2**: Fixed TypeScript errors and improved tool specification
- **v0.2.x**: Initial implementation with core functionality
