# n8n-nodes-docuseal

This package contains n8n nodes for [DocuSeal](https://www.docuseal.com), a
document signing solution that makes it easy to create, send, and manage
document signing requests.

[n8n](https://n8n.io) is a
[fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation
platform.

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
6. Wait for the installation to complete (this may take a few minutes)
7. Refresh your browser to see the new nodes

### Manual Installation

If you're using a self-hosted n8n instance:

```bash
# In your n8n installation directory
npm install n8n-nodes-docuseal

# Restart n8n to load the new nodes
n8n start
```

### Docker Installation

For Docker users, add the package to your Dockerfile or docker-compose.yml:

```dockerfile
# In your Dockerfile
RUN npm install -g n8n-nodes-docuseal
```

Or using environment variables:

```yaml
# In docker-compose.yml
services:
  n8n:
    image: n8nio/n8n
    environment:
      - N8N_NODES_INCLUDE=n8n-nodes-docuseal
```

### Prerequisites

- n8n version 0.187.0 or higher
- Node.js version 16 or higher
- A DocuSeal account with API access

### Verification

After installation, verify the nodes are available:

1. Create a new workflow
2. Click the "+" button to add a node
3. Search for "DocuSeal" - you should see both "DocuSeal" and "DocuSeal Trigger"
   nodes

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

- **Generate Document**: Create documents using AI with customizable prompts,
  languages, and styles

### 2. DocuSeal Trigger

A webhook-based trigger node that:

- Listens for DocuSeal events like submission completions and creations
- Provides detailed setup instructions for webhook configuration
- Supports event filtering and additional data fetching

## Credentials

The nodes use a custom credential type with the following fields:

- **Production API Key**: Your main DocuSeal API key
- **Test API Key**: Optional API key for your test environment
- **Base URL**: API endpoint (defaults to
  [https://api.docuseal.com](https://api.docuseal.com))

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
   - Description: "Standard NDA for a contractor relationship between Acme Inc.
     and John Doe"
   - Language: Choose from 12 supported languages
   - Style: Formal, Friendly, or Simple

### Listening for Document Completions

1. Add the **DocuSeal Trigger** node as the start of your workflow
2. Select **Submission Completed** as the event type
3. Configure the webhook in your DocuSeal dashboard as instructed

## Troubleshooting

### Common Issues

#### Node Not Appearing After Installation

1. **Clear browser cache**: Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)
2. **Restart n8n**: If self-hosted, restart your n8n instance
3. **Check version compatibility**: Ensure you're running n8n v0.187.0+
4. **Verify installation**: Check if the package appears in your node_modules

#### API Authentication Errors

**Error: "Invalid API key format"**

- Ensure your API key is at least 20 characters long
- Check for leading/trailing whitespace
- Verify the key contains only alphanumeric characters, hyphens, and underscores

**Error: "Unauthorized (401)"**

- Verify your API key is correct and active
- Check if you're using the right environment (production vs test)
- Ensure your DocuSeal account has API access enabled

#### File Upload Issues

**Error: "File size exceeds maximum"**

- Maximum file size is 50MB
- Compress large files before uploading
- Consider splitting large documents

**Error: "Unsupported file type"**

- Supported formats: PDF, DOCX, DOC, JPEG, PNG, GIF, TXT
- Ensure the file has the correct MIME type

#### Webhook/Trigger Issues

**Webhook not receiving events**

1. Verify the webhook URL is correctly configured in DocuSeal
2. Check that your n8n instance is accessible from the internet
3. Ensure the webhook endpoint is active and listening
4. Test with a simple HTTP request tool first

### Performance Tips

- **Batch operations**: Use "Get Many" operations instead of multiple "Get"
  calls
- **Pagination**: For large datasets, implement proper pagination
- **Caching**: Cache template data when processing multiple submissions
- **Error handling**: Implement retry logic for network-related failures

### Debug Mode

Enable debug logging to troubleshoot issues:

1. Set environment variable: `N8N_LOG_LEVEL=debug`
2. Check n8n logs for detailed error messages
3. Look for DocuSeal API response details

## Advanced Examples

### Bulk Document Processing

```javascript
// Process multiple documents with error handling
const results = [];
const errors = [];

for (const document of $input.all()) {
  try {
    const result = await $node['DocuSeal'].json({
      resource: 'submission',
      operation: 'create',
      templateId: document.templateId,
      submitters: document.submitters,
    });
    results.push(result);
  } catch (error) {
    errors.push({ document: document.id, error: error.message });
  }
}

return [{ results, errors }];
```

### Dynamic Template Selection

```javascript
// Select template based on document type
const documentType = $json.documentType;
const templateMap = {
  contract: 'template_123',
  nda: 'template_456',
  invoice: 'template_789',
};

const templateId = templateMap[documentType] || 'template_default';

return {
  templateId,
  submitters: $json.submitters,
  message: `Using template for ${documentType}`,
};
```

### Conditional Workflow Based on Status

```javascript
// Route workflow based on submission status
const status = $json.status;

switch (status) {
  case 'completed':
    return { route: 'process_completed', data: $json };
  case 'pending':
    return { route: 'send_reminder', data: $json };
  case 'declined':
    return { route: 'handle_rejection', data: $json };
  default:
    return { route: 'log_unknown', data: $json };
}
```

## Resources

- [DocuSeal API Documentation](https://www.docuseal.com/docs/api)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [DocuSeal Dashboard](https://app.docuseal.com)
- [n8n Workflow Templates](https://n8n.io/workflows/)

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md)
for details on:

- Setting up the development environment
- Running tests
- Submitting pull requests
- Code style guidelines

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed history of changes and
updates.

## Support

If you need assistance or want to report issues:

### Community Support

- Open an issue on
  [GitHub](https://github.com/serkanhaslak/n8n-nodes-docuseal/issues)
- Join the [n8n Community](https://community.n8n.io/)
- Check existing
  [discussions](https://github.com/serkanhaslak/n8n-nodes-docuseal/discussions)

### Commercial Support

- For enterprise support, contact [DocuSeal](https://www.docuseal.com/contact)
- For n8n enterprise features, visit [n8n.io](https://n8n.io/pricing/)

### Before Reporting Issues

1. Check the troubleshooting section above
2. Search existing issues for similar problems
3. Include your n8n version, node version, and error details
4. Provide steps to reproduce the issue
