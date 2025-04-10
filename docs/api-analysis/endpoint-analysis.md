# DocuSeal API Endpoint Analysis

## Required API Endpoints

This document details the specific API endpoints we need to implement for the DocuSeal n8n integration.

### Template Endpoints

#### List Templates
```
GET /templates
```

Query Parameters:
- `q` (string): Filter templates by name (partial match)
- `external_id` (string): Filter by custom ID
- `folder` (string): Filter by folder name
- `archived` (boolean): Include archived templates
- `limit` (integer): Number of results (default: 10, max: 100)
- `after` (integer): Pagination cursor

Response Format:
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

#### Get Template
```
GET /templates/{id}
```

Response Format:
```json
{
  "id": 1,
  "slug": "iRgjDX7WDK6BRo",
  "name": "Example Template",
  "preferences": {},
  "external_id": "unique-id-123",
  "folder_name": "Default",
  "created_at": "2023-12-14T15:50:21.799Z",
  "updated_at": "2023-12-14T15:50:21.799Z",
  "schema": [
    {
      "name": "Full Name",
      "type": "text",
      "role": "Submitter"
    }
  ]
}
```

### Submission Endpoints

#### List Submissions
```
GET /submissions
```

Query Parameters:
- `template_id` (integer): Filter by template
- `status` (string): Filter by status (pending, completed, declined, expired)
- `q` (string): Search submitter name/email/phone
- `template_folder` (string): Filter by template folder
- `archived` (boolean): Show archived submissions
- `limit` (integer): Number of results (default: 10, max: 100)
- `after` (integer): Pagination cursor
- `before` (integer): Pagination cursor

Response Format:
```json
{
  "data": [
    {
      "id": 1,
      "status": "completed",
      "submitters": [
        {
          "id": 1,
          "email": "submitter@example.com",
          "name": "John Doe",
          "status": "completed"
        }
      ],
      "template": {
        "id": 1,
        "name": "Example Template"
      }
    }
  ],
  "pagination": {
    "count": 1,
    "next": 1,
    "prev": 1
  }
}
```

#### Get Submission
```
GET /submissions/{id}
```

Response Format:
```json
{
  "id": 1,
  "status": "completed",
  "audit_log_url": "https://docuseal.com/file/hash/example.pdf",
  "combined_document_url": null,
  "submitters": [
    {
      "id": 1,
      "email": "submitter@example.com",
      "name": "John Doe",
      "status": "completed",
      "values": [
        { "field": "Full Name", "value": "John Doe" }
      ]
    }
  ]
}
```

#### Create Submission
```
POST /submissions
```

Request Body:
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

Response Format:
```json
[
  {
    "id": 1,
    "submission_id": 1,
    "email": "john.doe@example.com",
    "status": "sent",
    "embed_src": "https://docuseal.com/s/pAMimKcyrLjqVt"
  }
]
```

#### Archive Submission
```
DELETE /submissions/{id}
```

Response: HTTP 200 OK (no body)

## Webhook Events

The trigger node will need to handle the following webhook events:

- `submission.created`: When a submission is created
- `submission.completed`: When a submission is completed
- `submission.expired`: When a submission expires
- `submission.archived`: When a submission is archived

Webhook Payload Format:
```json
{
  "event_type": "submission.completed",
  "timestamp": "2024-05-26T17:32:33.518Z",
  "data": {
    "id": 1,
    "status": "completed",
    "submitters": [
      {
        "id": 1,
        "email": "submitter@example.com",
        "name": "John Doe"
      }
    ]
  }
}
```

## Authentication

All API requests require authentication using the API key in the `X-Auth-Token` header:

```
X-Auth-Token: YOUR_API_KEY
```

## Environment Configuration

The API supports both production and test environments:

- Production: https://api.docuseal.com
- Test: https://test-api.docuseal.com (or sandbox environment)
