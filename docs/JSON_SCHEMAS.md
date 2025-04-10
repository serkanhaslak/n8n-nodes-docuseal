# DocuSeal JSON Schemas

This document details the JSON schemas used in the DocuSeal integration for n8n, particularly for the complex parameters that require specific formatting.

## Submitters Schema

When creating a submission in DocuSeal, you need to provide an array of submitters who will sign the document. Here's the full schema with all possible properties:

```json
[
  {
    "email": "user@example.com",     // Required: Email address of the signer
    "name": "User Name",             // Optional: Full name of the signer
    "role": "First Party",           // Optional: Role or title (e.g., "Signer", "Approver", "Client")
    "phone": "+1234567890",          // Optional: Phone number in E.164 format for SMS notifications
    "values": {                      // Optional: Pre-filled values specific to this submitter
      "First Name": "John",
      "Last Name": "Doe",
      "Date": "04/11/2025"
    },
    "external_id": "user-123",       // Optional: Your application's unique identifier
    "completed": false,              // Optional: Set to true to mark as auto-signed
    "metadata": {                    // Optional: Custom metadata for your application
      "userId": "12345",
      "department": "Sales"
    },
    "send_email": true,              // Optional: Whether to send email to this submitter
    "send_sms": false,               // Optional: Whether to send SMS to this submitter
    "reply_to": "support@company.com", // Optional: Custom reply-to address for notifications
    "completed_redirect_url": "https://example.com/thank-you", // Optional: Custom redirect URL
    "message": {                     // Optional: Custom email message
      "subject": "Please sign this document",
      "body": "Hello, please sign the {{template.name}} document using this link: {{submitter.link}}"
    }
  }
]
```

## Fields Schema

When pre-filling document fields, you can use a simple key-value format or a more complex format with preferences:

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

| Property   | Description                           | Options                                    | Example           |
|------------|---------------------------------------|--------------------------------------------|-------------------|
| font_size  | Size of text in pixels                | Integer (e.g., 10, 12, 14)                | 12                |
| font_type  | Styling of text                       | "bold", "italic", "bold_italic"           | "bold"            |
| font       | Font family                           | "Times", "Helvetica", "Courier"           | "Helvetica"       |
| color      | Text color                            | "black", "white", "blue"                  | "black"           |
| align      | Text alignment                        | "left", "center", "right"                 | "center"          |
| format     | Format for specific field types       | For dates: "MM/DD/YYYY", "DD/MM/YYYY"<br>For currencies: "usd", "eur"<br>For signatures: "drawn", "typed", "upload" | "DD/MM/YYYY"     |
| price      | Price for payment fields              | Number                                     | 99.99             |
| currency   | Currency for payment fields           | "USD", "EUR", "GBP", "CAD", "AUD"         | "USD"             |
| mask       | Whether to mask sensitive data        | Boolean                                    | true              |

## Message Schema

When customizing email notifications, you can use the following format:

```json
{
  "subject": "Please sign this important document",
  "body": "Hello,\n\nPlease sign the {{template.name}} document using this link: {{submitter.link}}\n\nThank you,\n{{account.name}}"
}
```

### Available Variables

| Variable         | Description                              | Example                            |
|------------------|------------------------------------------|-----------------------------------|
| {{template.name}}| Name of the template being signed        | "Non-Disclosure Agreement"        |
| {{submitter.link}}| The unique signing link for the recipient| "https://app.docuseal.co/s/abc123"|
| {{account.name}} | Name of your DocuSeal account            | "Acme Corporation"                |

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
