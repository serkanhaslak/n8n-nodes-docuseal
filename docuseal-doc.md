Below is the most extended and comprehensive final document for Windsurf AI, combining the DocuSeal API documentation, the n8n community node development guide, and the detailed project requirements based on the provided query and thinking trace. This document is designed to be a complete, standalone guide enabling Windsurf AI to build the required n8n nodes for DocuSeal integration.

---

# Final Brief for Windsurf AI: Building DocuSeal Nodes for n8n

## Objective
The goal of this project is to create three custom n8n nodes to integrate with the DocuSeal API:
1. **Trigger Node**: A webhook-based node to listen for DocuSeal events (e.g., form completion or submission creation).
2. **AI Tool Node**: A node to pre-fill submission fields using AI-like logic.
3. **Normal Node**: A node to create new submissions for document signing.

This brief provides all necessary information, including the DocuSeal API documentation, n8n node development guidelines, and specific project requirements, to enable Windsurf AI to generate the required code efficiently.

---

## DocuSeal API Documentation

### Overview
The DocuSeal API is a RESTful API designed for managing document templates, submissions (signature requests), and submitters (signers). It supports creating reusable templates, sending documents for signature, and receiving real-time webhook events for form and submission updates. The base URL for all API operations is `https://api.docuseal.com`, and authentication is handled via an API key passed in the `X-Auth-Token` header.

### Authentication
- **Header**: `X-Auth-Token`
- **Value**: Your unique API key (provided separately).
- **Example**:
  ```
  X-Auth-Token: your-api-key-here
  ```
- **Note**: This header is required for all API requests.

### Key Endpoints

#### 1. Templates
Templates are reusable document forms with predefined fields (e.g., text, signature) used for submissions.

- **GET /templates**
  - **Purpose**: Retrieve a list of all templates.
  - **Query Parameters**:
    - `q` (string): Filter templates by name (partial match).
    - `external_id` (string): Filter by a custom external ID.
    - `folder` (string): Filter by folder name.
    - `archived` (boolean): Include archived templates if `true`.
    - `limit` (integer): Number of templates to return (default: 10, max: 100).
    - `after` (integer): Start the list after this template ID for pagination.
  - **Response** (HTTP 200 OK):
    ```json
    {
      "data": [
        {
          "id": 1,
          "slug": "iRgjDX7WDK6BRo",
          "name": "Example Template",
          "external_id": "c248ffba-ef81-48b7-8e17-e3cecda1c1c5",
          "folder_name": "Default",
          "created_at": "2023-12-14T15:21:57.375Z"
        }
      ],
      "pagination": {
        "count": 1,
        "next": 1,
        "prev": 2
      }
    }
    ```

- **POST /templates/pdf**
  - **Purpose**: Create a new template from an existing PDF file.
  - **Request Body** (application/json):
    ```json
    {
      "name": "Test PDF",
      "external_id": "unique-key",
      "folder_name": "Default",
      "documents": [
        {
          "name": "Document",
          "file": "base64-encoded-pdf-or-url",
          "fields": [
            {
              "name": "Name",
              "type": "text",
              "role": "Submitter",
              "required": true,
              "areas": [
                { "x": 0.4, "y": 0.04, "w": 0.1, "h": 0.01, "page": 1 }
              ]
            }
          ]
        }
      ]
    }
    ```
    - **Notes**:
      - `file`: Can be a base64-encoded PDF string or a publicly accessible URL.
      - `areas`: Defines the position of fields on the PDF (x, y coordinates, width, height, page number).
  - **Response** (HTTP 200 OK):
    ```json
    {
      "id": 5,
      "slug": "s3ff992CoPjvaX",
      "name": "Demo PDF",
      "external_id": "c248ffba-ef81-48b7-8e17-e3cecda1c1c5"
    }
    ```

#### 2. Submissions
Submissions represent signature requests sent to one or more submitters based on a template.

- **POST /submissions**
  - **Purpose**: Create a new submission (signature request).
  - **Request Body** (application/json):
    ```json
    {
      "template_id": 1000001,
      "send_email": true,
      "submitters": [
        {
          "email": "john.doe@example.com",
          "name": "John Doe",
          "role": "First Party",
          "values": { "Full Name": "John Doe" }
        }
      ]
    }
    ```
    - **Notes**:
      - `template_id`: ID of the template to use.
      - `send_email`: If `true`, DocuSeal emails the submitters with signing links.
      - `values`: Pre-filled field values (optional).
  - **Response** (HTTP 200 OK):
    ```json
    [
      {
        "id": 1,
        "submission_id": 1,
        "uuid": "884d545b-3396-49f1-8c07-05b8b2a78755",
        "email": "john.doe@example.com",
        "slug": "pAMimKcyrLjqVt",
        "status": "sent",
        "embed_src": "https://docuseal.com/s/pAMimKcyrLjqVt"
      }
    ]
    ```

- **GET /submissions/{id}**
  - **Purpose**: Retrieve details of a specific submission.
  - **Path Variable**: `id` (integer, e.g., 1001).
  - **Response** (HTTP 200 OK):
    ```json
    {
      "id": 1,
      "slug": "VyL4szTwYoSvXq",
      "status": "completed",
      "submitters": [
        {
          "id": 1,
          "email": "submitter@example.com",
          "status": "completed",
          "values": [
            { "field": "Full Name", "value": "John Doe" }
          ]
        }
      ]
    }
    ```

#### 3. Submitters
Submitters are the individuals assigned to sign a submission.

- **PUT /submitters/{id}**
  - **Purpose**: Update a submitter’s details, including pre-filling fields.
  - **Path Variable**: `id` (integer, e.g., 500001).
  - **Request Body** (application/json):
    ```json
    {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "values": {
        "First Name": "John",
        "Signature": "base64data"
      },
      "send_email": true
    }
    ```
    - **Notes**:
      - `values`: Key-value pairs for pre-filling fields.
      - `send_email`: If `true`, resends the signing email after update.
  - **Response** (HTTP 200 OK):
    ```json
    {
      "id": 1,
      "submission_id": 12,
      "email": "submitter@example.com",
      "status": "completed",
      "values": [
        { "field": "First Name", "value": "John" }
      ]
    }
    ```

### Webhooks
DocuSeal supports webhooks to notify external systems of form and submission events. Webhooks are sent as POST requests to a user-defined URL.

- **Form Webhook**
  - **Events**: 
    - `form.viewed`: Form is viewed by a submitter.
    - `form.started`: Form signing process begins.
    - `form.completed`: Form is fully signed.
    - `form.declined`: Form is declined by a submitter.
  - **Payload Example** (`form.completed`):
    ```json
    {
      "event_type": "form.completed",
      "timestamp": "2023-09-24T13:48:36Z",
      "data": {
        "id": 1,
        "submission_id": 12,
        "email": "john.doe@example.com",
        "status": "completed",
        "values": [
          { "field": "First Name", "value": "John" },
          { "field": "Signature", "value": "https://docuseal.com/signature.png" }
        ],
        "submission": {
          "id": 12,
          "status": "completed"
        }
      }
    }
    ```

- **Submission Webhook**
  - **Events**: 
    - `submission.created`: New submission is created.
    - `submission.completed`: All submitters have signed.
    - `submission.expired`: Submission expires.
    - `submission.archived`: Submission is archived.
  - **Payload Example** (`submission.created`):
    ```json
    {
      "event_type": "submission.created",
      "timestamp": "2024-05-26T17:32:33.518Z",
      "data": {
        "id": 1,
        "status": "pending",
        "submitters": [
          {
            "id": 1,
            "email": "mike@example.com",
            "status": "awaiting",
            "role": "First Party"
          }
        ]
      }
    }
    ```

### Additional Notes
- **File Uploads**: For endpoints like `POST /templates/pdf`, the `file` field can be either a base64-encoded string or a downloadable URL.
- **Error Handling**: Common HTTP errors include 400 (bad request) and 401 (unauthorized). Ensure proper error handling in node implementations.
- **Rate Limits**: Not specified in the provided data; assume standard REST API limits and implement retry logic if needed.

---

## n8n Community Node Development Guide

### Overview
n8n is an extensible workflow automation tool that supports custom node creation to integrate with external services like DocuSeal. Custom nodes can be:
- **Trigger Nodes**: React to external events (e.g., webhooks).
- **Regular Nodes**: Perform actions (e.g., API calls).

Nodes are written in JavaScript (or TypeScript) and packaged as npm modules for use within n8n.

### Prerequisites
- **Node.js and npm**: Installed on your system.
- **Local n8n Instance**: Run with `npx n8n` for testing.
- **JavaScript/TypeScript Knowledge**: Basic understanding of syntax and asynchronous programming.
- **IDE**: Windsurf AI or similar for code generation and editing.

### Step 1: Set Up a Node Package
1. **Initialize the Package**:
   Use the n8n nodes starter kit:
   ```bash
   npx @n8n_io/n8n-nodes-starter n8n-nodes-docuseal
   cd n8n-nodes-docuseal
   ```
2. **Configure `package.json`**:
   - Update the `name` to `n8n-nodes-docuseal`.
   - Set `version` to `0.1.0`.
   - Add n8n dependencies:
     ```json
     "dependencies": {
       "n8n-core": "^1.0.0",
       "n8n-workflow": "^1.0.0"
     }
     ```

### Step 2: Node Structure
Each node requires two primary files:
- **Description File** (`nodes/[NodeName].description.js`): Defines the node’s UI, inputs, outputs, and credentials.
- **Implementation File** (`nodes/[NodeName].node.js`): Contains the node’s executable logic.

### Step 3: Define Credentials
Create a credential file for the DocuSeal API key:
- **File**: `credentials/DocusealApi.credentials.js`
- **Code**:
  ```javascript
  module.exports = {
    displayName: 'DocuSeal API',
    name: 'docusealApi',
    properties: [
      {
        displayName: 'API Key',
        name: 'apiKey',
        type: 'string',
        default: '',
        required: true,
        description: 'The API key for authenticating with DocuSeal'
      }
    ]
  };
  ```

### Step 4: Define Node Description
The description file outlines the node’s metadata and user interface.

#### Example: Trigger Node Description
- **File**: `nodes/DocusealWebhook.description.js`
- **Code**:
  ```javascript
  module.exports = {
    displayName: 'DocuSeal Webhook',
    name: 'docusealWebhook',
    group: ['trigger'],
    version: 1,
    description: 'Triggers a workflow on DocuSeal webhook events',
    defaults: {
      name: 'DocuSeal Webhook'
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'docusealApi',
        required: true
      }
    ],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        path: 'webhook'
      }
    ],
    properties: [
      {
        displayName: 'Event Type',
        name: 'eventType',
        type: 'options',
        options: [
          { name: 'Form Viewed', value: 'form.viewed' },
          { name: 'Form Started', value: 'form.started' },
          { name: 'Form Completed', value: 'form.completed' },
          { name: 'Form Declined', value: 'form.declined' },
          { name: 'Submission Created', value: 'submission.created' },
          { name: 'Submission Completed', value: 'submission.completed' }
        ],
        default: 'form.completed',
        description: 'The DocuSeal event to listen for'
      }
    ]
  };
  ```

#### Example: Regular Node Description (Create Submission)
- **File**: `nodes/DocusealCreateSubmission.description.js`
- **Code**:
  ```javascript
  module.exports = {
    displayName: 'DocuSeal Create Submission',
    name: 'docusealCreateSubmission',
    group: ['action'],
    version: 1,
    description: 'Creates a new submission in DocuSeal',
    defaults: {
      name: 'Create Submission'
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'docusealApi',
        required: true
      }
    ],
    properties: [
      {
        displayName: 'Template ID',
        name: 'templateId',
        type: 'string',
        default: '',
        required: true,
        description: 'The ID of the template to use'
      },
      {
        displayName: 'Send Email',
        name: 'sendEmail',
        type: 'boolean',
        default: true,
        description: 'Whether to email the submitters'
      },
      {
        displayName: 'Submitters',
        name: 'submitters',
        type: 'fixedCollection',
        default: {},
        options: [
          {
            name: 'submitter',
            displayName: 'Submitter',
            values: [
              { displayName: 'Email', name: 'email', type: 'string', default: '' },
              { displayName: 'Name', name: 'name', type: 'string', default: '' },
              { displayName: 'Role', name: 'role', type: 'string', default: 'Submitter' }
            ]
          }
        ],
        description: 'List of submitters for the submission'
      }
    ]
  };
  ```

### Step 5: Implement Node Logic
The implementation file defines how the node processes data.

#### Trigger Node Implementation
- **File**: `nodes/DocusealWebhook.node.js`
- **Code**:
  ```javascript
  class DocusealWebhook {
    async webhook({ body, headers, query, path, method }) {
      const eventType = this.getNodeParameter('eventType');
      if (body.event_type !== eventType) {
        return {}; // Ignore non-matching events
      }
      return {
        webhookResponse: { status: 200 },
        data: [body.data] // Return event data as n8n items
      };
    }
  }
  module.exports = new DocusealWebhook();
  ```

#### Regular Node Implementation (Create Submission)
- **File**: `nodes/DocusealCreateSubmission.node.js`
- **Code**:
  ```javascript
  class DocusealCreateSubmission {
    async execute() {
      const templateId = this.getNodeParameter('templateId');
      const sendEmail = this.getNodeParameter('sendEmail');
      const submitters = this.getNodeParameter('submitters').submitter;
      const credentials = await this.getCredentials('docusealApi');

      const options = {
        method: 'POST',
        headers: {
          'X-Auth-Token': credentials.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template_id: parseInt(templateId),
          send_email: sendEmail,
          submitters: submitters.map(s => ({
            email: s.email,
            name: s.name,
            role: s.role
          }))
        }),
        uri: 'https://api.docuseal.com/submissions'
      };

      try {
        const response = await this.helpers.request(options);
        return this.helpers.returnJsonArray(JSON.parse(response));
      } catch (error) {
        throw new Error(`DocuSeal API error: ${error.message}`);
      }
    }
  }
  module.exports = new DocusealCreateSubmission();
  ```

### Step 6: Test the Node
1. **Build the Node**:
   ```bash
   npm install
   npm run build
   ```
2. **Link to n8n**:
   ```bash
   npm link
   cd /path/to/n8n
   npm link n8n-nodes-docuseal
   ```
3. **Run n8n**: `npx n8n` and test the node in the n8n UI.

### Step 7: Publish (Optional)
1. Update `package.json` with a unique name and version.
2. Publish to npm:
   ```bash
   npm publish --access public
   ```
3. Share via GitHub or the n8n community.

### Best Practices
- **Input Access**: Use `this.getNodeParameter()` to retrieve node inputs.
- **Credentials**: Use `this.getCredentials()` to access the API key.
- **Error Handling**: Wrap API calls in try-catch blocks and throw descriptive errors.
- **Output Format**: Return data as arrays of objects compatible with n8n’s item structure.
- **Testing**: Validate with real DocuSeal API calls and webhook events.

### Resources
- [n8n Node Creation Docs](https://docs.n8n.io/integrations/creating-nodes/)
- [n8n GitHub Examples](https://github.com/n8n-io/n8n-nodes-starter)

---

## Project Requirements

### 1. Trigger Node: DocuSeal Webhook
- **Purpose**: Listen for DocuSeal webhook events to trigger n8n workflows.
- **Functionality**:
  - Accepts POST requests at a configurable webhook URL (e.g., `/webhook`).
  - Filters events by type via a dropdown:
    - `form.viewed`
    - `form.started`
    - `form.completed`
    - `form.declined`
    - `submission.created`
    - `submission.completed`
  - Outputs the webhook payload as n8n items (e.g., `data.id`, `data.email`, `data.values`).
- **Example Payload**:
  ```json
  {
    "event_type": "form.completed",
    "timestamp": "2023-09-24T13:48:36Z",
    "data": {
      "id": 1,
      "submission_id": 12,
      "email": "john.doe@example.com",
      "status": "completed",
      "values": [
        { "field": "First Name", "value": "John" }
      ]
    }
  }
  ```
- **Files**:
  - `nodes/DocusealWebhook.description.js`
  - `nodes/DocusealWebhook.node.js`

### 2. AI Tool Node: Pre-fill Submission
- **Purpose**: Pre-fill submission fields with values, simulating AI-driven automation.
- **Functionality**:
  - **Inputs**:
    - `submissionId`: ID of the submission.
    - `submitterId`: ID of the submitter to update.
    - `templateId`: ID of the template (for context).
    - `fieldValues`: Object with field names and values (e.g., `{"First Name": "John"}`).
  - Makes a PUT request to `https://api.docuseal.com/submitters/{id}`.
  - **Headers**: `X-Auth-Token: [apiKey]`.
  - **Body Example**:
    ```json
    {
      "values": {
        "First Name": "John",
        "Signature": "base64data"
      }
    }
    ```
  - Returns updated submitter details.
- **Example**:
  - **Input**: `submitterId: 500001`, `fieldValues: {"First Name": "John"}`
  - **Output**: Updated submitter object.
- **Files**:
  - `nodes/DocusealPrefill.description.js`
  - `nodes/DocusealPrefill.node.js`

### 3. Normal Node: Create Submission
- **Purpose**: Create a new submission for document signing.
- **Functionality**:
  - **Inputs**:
    - `templateId`: ID of the template to use.
    - `submitters`: Array of objects with `email`, `name`, and `role`.
    - `sendEmail`: Boolean to trigger email notifications (default: `true`).
    - `file` (optional): Base64 string or URL for a PDF (for templates created on-the-fly).
  - Makes a POST request to `https://api.docuseal.com/submissions`.
  - **Headers**: `X-Auth-Token: [apiKey]`.
  - **Body Example**:
    ```json
    {
      "template_id": 1000001,
      "send_email": true,
      "submitters": [
        {
          "email": "john@example.com",
          "name": "John",
          "role": "First Party"
        }
      ]
    }
    ```
  - Returns submission ID and submitter details.
- **Example**:
  - **Input**: `templateId: 1000001`, `submitters: [{"email": "john@example.com", "name": "John"}]`
  - **Output**: Submission details array.
- **Files**:
  - `nodes/DocusealCreateSubmission.description.js`
  - `nodes/DocusealCreateSubmission.node.js`

---

## Implementation Guidelines
- **Node Structure**: Use separate `.description.js` and `.node.js` files for each node.
- **Credentials**: Include `X-Auth-Token` via the `docusealApi` credential type.
- **Error Handling**: Handle 400 (bad request) and 401 (unauthorized) responses with meaningful error messages.
- **Code Comments**: Add inline comments to explain logic and API interactions.
- **n8n Compatibility**: Ensure outputs are arrays of objects (n8n’s item structure).
- **Language**: Use JavaScript (TypeScript optional based on Windsurf AI capabilities).

## Deliverables
1. **Credential File**:
   - `credentials/DocusealApi.credentials.js`
2. **Trigger Node**:
   - `nodes/DocusealWebhook.description.js`
   - `nodes/DocusealWebhook.node.js`
3. **AI Tool Node**:
   - `nodes/DocusealPrefill.description.js`
   - `nodes/DocusealPrefill.node.js`
4. **Normal Node**:
   - `nodes/DocusealCreateSubmission.description.js`
   - `nodes/DocusealCreateSubmission.node.js`

## Project Setup
- The project is initialized in the `n8n-nodes-docuseal` directory.
- Use the following commands to prepare:
  ```bash
  cd n8n-nodes-docuseal
  npm install
  npm run build
  npm link
  ```
- Link to a local n8n instance for testing:
  ```bash
  cd /path/to/n8n
  npm link n8n-nodes-docuseal
  npx n8n
  ```

## Notes
- **AI Model**: For optimal code generation, use the Claude 3.7 Sonnet model if available in Windsurf AI.
- **Testing**: Test each node with real DocuSeal API calls and webhook events to ensure functionality.
- **Scalability**: The nodes are designed to handle basic operations; additional features (e.g., template creation) can be added later.

This comprehensive brief provides Windsurf AI with all the necessary details to build, test, and deploy the DocuSeal integration nodes for n8n. Let me know if further clarification or adjustments are needed!