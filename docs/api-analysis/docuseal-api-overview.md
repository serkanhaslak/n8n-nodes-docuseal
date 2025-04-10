# DocuSeal API Analysis

## API Overview
DocuSeal provides a RESTful API that allows you to integrate document signing and management functionality into your applications. The API supports operations for templates, submissions, and submitters.

## Base URL
```
https://api.docuseal.com
```

## Authentication
Authentication is done using an API key passed in the `X-Auth-Token` header.

```
X-Auth-Token: YOUR_API_KEY
```

## Key Resources

### Templates
Templates are reusable document forms with predefined fields that can be used for submissions.

#### Endpoints:
- `GET /templates` - List all templates
- `GET /templates/{id}` - Get a specific template

### Submissions
Submissions represent signature requests sent to one or more parties.

#### Endpoints:
- `GET /submissions` - List all submissions
- `GET /submissions/{id}` - Get a specific submission
- `POST /submissions` - Create a new submission
- `DELETE /submissions/{id}` - Archive a submission

#### Required operations for our n8n node:
- List all submissions
- Get a submission
- Create a submission
- Archive a submission

### Submitters
Submitters are the individuals assigned to complete a submission.

## Webhook Events
DocuSeal supports webhook events that can be used for the trigger node:

- `submission.created` - When a submission is created
- `submission.completed` - When a submission is completed by all parties
- `submission.expired` - When a submission expires
- `submission.archived` - When a submission is archived

## Important Data Structures

### Submission Creation
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

### Fields JSON Format
For creating submissions, fields can be specified as a JSON object where each key is a field name and the value is its corresponding value.

```json
"fields": {
  "Full Name": "John Doe",
  "Email": "john.doe@example.com",
  "Signature": "base64-encoded-signature"
}
```
