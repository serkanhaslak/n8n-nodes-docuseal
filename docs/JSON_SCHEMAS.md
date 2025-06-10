# DocuSeal JSON Schemas

This document details the JSON schemas used in the DocuSeal integration for n8n,
particularly for the complex parameters that require specific formatting.

## Submitters Schema

When creating a submission in DocuSeal, you need to provide an array of
submitters who will sign the document. Here's the full schema with all possible
properties:

```json
[
  {
    "email": "user@example.com", // Required: Email address of the signer
    "name": "User Name", // Optional: Full name of the signer
    "role": "First Party", // Optional: Role or title (e.g., "Signer", "Approver", "Client")
    "phone": "+1234567890", // Optional: Phone number in E.164 format for SMS notifications
    "values": {
      // Optional: Pre-filled values specific to this submitter
      "First Name": "John",
      "Last Name": "Doe",
      "Date": "04/11/2025"
    },
    "external_id": "user-123", // Optional: Your application's unique identifier
    "completed": false, // Optional: Set to true to mark as auto-signed
    "metadata": {
      // Optional: Custom metadata for your application
      "userId": "12345",
      "department": "Sales"
    },
    "send_email": true, // Optional: Whether to send email to this submitter
    "send_sms": false, // Optional: Whether to send SMS to this submitter
    "reply_to": "support@company.com", // Optional: Custom reply-to address for notifications
    "completed_redirect_url": "https://example.com/thank-you", // Optional: Custom redirect URL
    "message": {
      // Optional: Custom email message
      "subject": "Please sign this document",
      "body": "Hello, please sign the {{template.name}} document using this link: {{submitter.link}}"
    }
  }
]
```

## Submitter Update Schema

When updating a submitter, you can use the following JSON structure to configure
various aspects of the submitter's details, field values, and notification
preferences:

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "external_id": "user-123",
  "completed": false,
  "send_email": true,
  "send_sms": false,
  "reply_to": "support@yourcompany.com",
  "completed_redirect_url": "https://yourcompany.com/thank-you",
  "values": {
    "First Name": "John",
    "Last Name": "Doe",
    "Date": "2025-04-13"
  },
  "metadata": {
    "user_id": "12345",
    "plan": "premium"
  },
  "message": {
    "subject": "Please sign your document",
    "body": "Hello, we need your signature on the {{template.name}}. Please click here: {{submitter.link}}"
  },
  "fields": [
    {
      "name": "First Name",
      "default_value": "John",
      "readonly": true,
      "required": true
    },
    {
      "name": "Signature",
      "default_value": "https://example.com/signature.png",
      "preferences": {
        "font_size": 14,
        "font_type": "bold",
        "align": "center"
      }
    },
    {
      "name": "Date",
      "format": "DD/MM/YYYY"
    }
  ]
}
```

### Key Components

| Property                 | Type    | Description                                              |
| ------------------------ | ------- | -------------------------------------------------------- |
| `name`                   | String  | The name of the submitter                                |
| `email`                  | String  | The email address of the submitter                       |
| `phone`                  | String  | Phone number in E.164 format (e.g., +1234567890)         |
| `external_id`            | String  | Your application's unique identifier for this submitter  |
| `completed`              | Boolean | Set to `true` to mark as completed and auto-sign via API |
| `send_email`             | Boolean | Set to `true` to re-send signature request emails        |
| `send_sms`               | Boolean | Set to `true` to re-send signature request via SMS       |
| `reply_to`               | String  | Reply-To address for notification emails                 |
| `completed_redirect_url` | String  | URL to redirect after completion                         |
| `values`                 | Object  | Pre-filled values using field names as keys              |
| `metadata`               | Object  | Additional submitter information                         |
| `message`                | Object  | Custom email notification settings                       |
| `fields`                 | Array   | List of field configurations                             |

### Field Configuration

Each field in the `fields` array can have the following properties:

| Property             | Type    | Description                                                    |
| -------------------- | ------- | -------------------------------------------------------------- |
| `name`               | String  | **Required.** The name of the field as defined in the template |
| `default_value`      | Mixed   | Default value for the field                                    |
| `readonly`           | Boolean | If `true`, submitter cannot edit the field                     |
| `required`           | Boolean | If `true`, field must be filled                                |
| `validation_pattern` | String  | HTML validation pattern                                        |
| `invalid_message`    | String  | Message to display on validation failure                       |
| `preferences`        | Object  | Visual preferences for the field                               |
| `format`             | String  | Data format (e.g., DD/MM/YYYY for dates)                       |

### Preferences Object

| Property    | Type    | Description                                |
| ----------- | ------- | ------------------------------------------ |
| `font_size` | Integer | Font size in pixels                        |
| `font_type` | String  | Font type (bold, italic, bold_italic)      |
| `font`      | String  | Font family (Times, Helvetica, Courier)    |
| `color`     | String  | Font color (black, white, blue)            |
| `align`     | String  | Horizontal alignment (left, center, right) |
| `valign`    | String  | Vertical alignment (top, center, bottom)   |

## Submitter Response Schema

When retrieving a submitter using the "Get" operation, you'll receive a response
with the following structure:

```json
{
  "id": 500001,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "completed": true,
  "completed_at": "2025-04-13T18:30:45.123Z",
  "opened": true,
  "opened_at": "2025-04-13T18:15:22.456Z",
  "sent_at": "2025-04-13T18:00:00.000Z",
  "archived": false,
  "submission_id": 400001,
  "external_id": "user-123",
  "role": "Signer",
  "order": 1,
  "values": {
    "First Name": "John",
    "Last Name": "Doe",
    "Signature": "data:image/png;base64,..."
  },
  "metadata": {
    "user_id": "12345",
    "plan": "premium"
  },
  "fields": [
    {
      "name": "First Name",
      "value": "John"
    },
    {
      "name": "Last Name",
      "value": "Doe"
    },
    {
      "name": "Signature",
      "value": "data:image/png;base64,..."
    }
  ],
  "documents": [
    {
      "id": 600001,
      "name": "signed_document.pdf",
      "content_type": "application/pdf",
      "url": "https://api.docuseal.com/documents/600001"
    }
  ]
}
```

## Submitter List Response Schema

When retrieving a list of submitters using the "Get List" operation, you'll
receive a response with the following structure:

```json
{
  "data": [
    {
      "id": 500001,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "completed": true,
      "completed_at": "2025-04-13T18:30:45.123Z",
      "opened": true,
      "opened_at": "2025-04-13T18:15:22.456Z",
      "sent_at": "2025-04-13T18:00:00.000Z",
      "archived": false,
      "submission_id": 400001,
      "external_id": "user-123",
      "role": "Signer",
      "order": 1
    },
    {
      "id": 500002,
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "phone": null,
      "completed": false,
      "completed_at": null,
      "opened": false,
      "opened_at": null,
      "sent_at": "2025-04-13T18:00:00.000Z",
      "archived": false,
      "submission_id": 400001,
      "external_id": "user-456",
      "role": "Reviewer",
      "order": 2
    }
  ],
  "pagination": {
    "next": 500003,
    "previous": null
  }
}
```

### Pagination

The `pagination` object provides IDs for navigating through large result sets:

- `next`: The ID to use as the `after` parameter to get the next page of results
- `previous`: The ID to use as the `before` parameter to get the previous page
  of results

## Fields Schema

When pre-filling document fields, you can use a simple key-value format or a
more complex format with preferences:

### Simple Format

```json
{
  "First Name": "John",
  "Last Name": "Doe",
  "Email": "john@example.com",
  "Phone": "+1234567890",
  "Date": "04/11/2025",
  "Agreement Number": "AGR-12345"
}
```

### Advanced Format with Preferences

```json
{
  "First Name": {
    "value": "John",
    "preferences": {
      "font_size": 12,
      "font": "Helvetica",
      "color": "black",
      "align": "left"
    }
  },
  "Amount": {
    "value": 1500,
    "preferences": {
      "font_size": 14,
      "font_type": "bold",
      "format": "usd",
      "align": "right"
    }
  },
  "Date": {
    "value": "04/11/2025",
    "preferences": {
      "format": "DD/MM/YYYY"
    }
  },
  "Signature": {
    "value": "data:image/png;base64,iVBORw0KGg...",
    "preferences": {
      "format": "drawn"
    }
  }
}
```

## Preferences Options

The `preferences` object can include the following properties:

| Property  | Description                     | Options                                                                                                             | Example      |
| --------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------ |
| font_size | Size of text in pixels          | Integer (e.g., 10, 12, 14)                                                                                          | 12           |
| font_type | Styling of text                 | "bold", "italic", "bold_italic"                                                                                     | "bold"       |
| font      | Font family                     | "Times", "Helvetica", "Courier"                                                                                     | "Helvetica"  |
| color     | Text color                      | "black", "white", "blue"                                                                                            | "black"      |
| align     | Text alignment                  | "left", "center", "right"                                                                                           | "center"     |
| format    | Format for specific field types | For dates: "MM/DD/YYYY", "DD/MM/YYYY"<br>For currencies: "usd", "eur"<br>For signatures: "drawn", "typed", "upload" | "DD/MM/YYYY" |
| price     | Price for payment fields        | Number                                                                                                              | 99.99        |
| currency  | Currency for payment fields     | "USD", "EUR", "GBP", "CAD", "AUD"                                                                                   | "USD"        |
| mask      | Whether to mask sensitive data  | Boolean                                                                                                             | true         |

## Message Schema

When customizing email notifications, you can use the following format:

```json
{
  "subject": "Please sign this important document",
  "body": "Hello,\n\nPlease sign the {{template.name}} document using this link: {{submitter.link}}\n\nThank you,\n{{account.name}}"
}
```

### Available Variables

| Variable           | Description                               | Example                            |
| ------------------ | ----------------------------------------- | ---------------------------------- |
| {{template.name}}  | Name of the template being signed         | "Non-Disclosure Agreement"         |
| {{submitter.link}} | The unique signing link for the recipient | "https://app.docuseal.co/s/abc123" |
| {{account.name}}   | Name of your DocuSeal account             | "Acme Corporation"                 |

## Common Use Cases

### Simple Pre-filled Document

```json
{
  "submitters": [
    {
      "email": "client@example.com",
      "name": "John Doe",
      "role": "Client"
    }
  ],
  "options": {
    "fields": {
      "Client Name": "John Doe",
      "Contract Date": "04/11/2025",
      "Contract Amount": "5,000.00"
    },
    "send_email": true
  }
}
```

### Multi-Party Sequential Signing

```json
{
  "submitters": [
    {
      "email": "employee@company.com",
      "name": "Employee Name",
      "role": "Employee"
    },
    {
      "email": "manager@company.com",
      "name": "Manager Name",
      "role": "Manager"
    },
    {
      "email": "hr@company.com",
      "name": "HR Department",
      "role": "HR"
    }
  ],
  "options": {
    "order": "preserved",
    "send_email": true
  }
}
```

### Creating a Document with Custom Messages

```json
{
  "submitters": [
    {
      "email": "client@example.com",
      "name": "Client Name",
      "message": {
        "subject": "Your Contract is Ready to Sign",
        "body": "Dear Client,\n\nYour {{template.name}} is ready for signature. Please click here: {{submitter.link}}\n\nThank you,\nYour Team"
      }
    }
  ]
}
```
