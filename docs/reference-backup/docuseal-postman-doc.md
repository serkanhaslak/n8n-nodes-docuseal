DocuSeal API
OPEN API 3.0
Version 1.0.8
DocuSeal API specs

Server
https://api.docuseal.com
Global Server

/templates
GET
List all templates
The API endpoint provides the ability to retrieve a list of available document templates.

https://api.docuseal.com/templates
Authorization
AuthToken (apiKey)
AuthToken
key-name:
X-Auth-Token
in:
header
Query Params
q
string
Filter templates based on the name partial match.

external_id
string
The unique applications-specific identifier provided for the template via API or Embedded template form builder. It allows you to receive only templates with your specified external id.

folder
string
Filter templates by folder name.

archived
boolean
Get only archived templates instead of active ones.

limit
integer
The number of templates to return. Default value is 10. Maximum value is 100.

after
integer
The unique identifier of the template to start the list from. It allows you to receive only templates with id greater than the specified value. Pass ID value from the pagination.next response to load the next batch of templates.

before
integer
The unique identifier of the template to end the list with. It allows you to receive only templates with id less than the specified value.

Response
200
OK


Body

Headers
application/json
data
[object]
Required
List of templates.

object
Show properties (17)
pagination
object
Required
Show properties (3)
Response Body Example
View More
json
{
  "data": [
    {
      "id": 1,
      "slug": "iRgjDX7WDK6BRo",
      "name": "Example Template",
      "preferences": {},
      "schema": [
        {
          "attachment_uuid": "d94e615f-76e3-46d5-8f98-36bdacb8664a",
          "name": "example-document"
        }
      ],
      "fields": [
        {
          "uuid": "594bdf04-d941-4ca6-aa73-93e61d625c02",
          "submitter_uuid": "0954d146-db8c-4772-aafe-2effc7c0e0c0",
          "name": "Full Name",
          "type": "text",
          "required": true,
          "preferences": {},
          "areas": [
            {
              "x": 0.2638888888888889,
              "y": 0.168958742632613,
              "w": 0.325,
              "h": 0.04616895874263263,
              "attachment_uuid": "d94e615f-76e3-46d5-8f98-36bdacb8664a",
              "page": 0
            }
          ]
        }
      ],
      "submitters": [
        {
          "name": "First Party",
          "uuid": "0954d146-db8c-4772-aafe-2effc7c0e0c0"
        }
      ],
      "author_id": 1,
      "archived_at": null,
      "created_at": "2023-12-14T15:21:57.375Z",
      "updated_at": "2023-12-14T15:22:55.094Z",
      "source": "native",
      "folder_id": 1,
      "folder_name": "Default",
      "external_id": "c248ffba-ef81-48b7-8e17-e3cecda1c1c5",
      "author": {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com"
      },
      "documents": [
        {
          "id": 5,
          "uuid": "d94e615f-76e3-46d5-8f98-36bdacb8664a",
          "url": "https://docuseal.com/file/hash/sample-document.pdf",
          "preview_image_url": "https://docuseal.com/file/hash/0.jpg",
          "filename": "example-document.pdf"
        }
      ]
    }
  ],
  "pagination": {
    "count": 1,
    "next": 1,
    "prev": 2
  }
}
GET
Get a template
The API endpoint provides the functionality to retrieve information about a document template.

https://api.docuseal.com/templates/{id}
Authorization
AuthToken (apiKey)
AuthToken
key-name:
X-Auth-Token
in:
header
Path Variables
id
integer
Required
1000001
The unique identifier of the document template.

Response
200
OK


Body

Headers
application/json
id
integer
Required
Unique identifier of the document template.

slug
string
Required
Unique slug of the document template.

name
string
Required
Name of the template.

preferences
object
Required
Template preferences.

schema
[object]
Required
List of documents attached to the template.

object
Show properties (2)
fields
[object]
Required
List of fields to be filled in the template.

object
Show properties (7)
submitters
[object]
Required
object
Show properties (2)
author_id
integer
Required
Unique identifier of the author of the template.

archived_at
string or null
Required
Date and time when the template was archived.

created_at
string
Required
Date and time when the template was created.

updated_at
string
Required
Date and time when the template was updated.

source
string
Required
Allowed values (3)

Source of the template.

external_id
string or null
Required
Identifier of the template in the external system.

folder_id
integer
Required
Unique identifier of the folder where the template is placed.

folder_name
string
Required
Folder name where the template is placed.

author
object
Required
Show properties (4)
documents
[object]
Required
List of documents attached to the template.

object
Show properties (5)
Response Body Example
View More
json
{
  "id": 1,
  "slug": "iRgjDX7WDK6BRo",
  "name": "Example Template",
  "preferences": {},
  "schema": [
    {
      "attachment_uuid": "d94e615f-76e3-46d5-8f98-36bdacb8664a",
      "name": "example-document"
    }
  ],
  "fields": [
    {
      "uuid": "594bdf04-d941-4ca6-aa73-93e61d625c02",
      "submitter_uuid": "0954d146-db8c-4772-aafe-2effc7c0e0c0",
      "name": "Full Name",
      "type": "text",
      "required": true,
      "preferences": {},
      "areas": [
        {
          "x": 0.2638888888888889,
          "y": 0.168958742632613,
          "w": 0.325,
          "h": 0.04616895874263263,
          "attachment_uuid": "d94e615f-76e3-46d5-8f98-36bdacb8664a",
          "page": 0
        }
      ]
    }
  ],
  "submitters": [
    {
      "name": "First Party",
      "uuid": "0954d146-db8c-4772-aafe-2effc7c0e0c0"
    }
  ],
  "author_id": 1,
  "archived_at": null,
  "created_at": "2023-12-14T15:21:57.375Z",
  "updated_at": "2023-12-14T15:22:55.094Z",
  "source": "native",
  "folder_id": 1,
  "folder_name": "Default",
  "external_id": "c248ffba-ef81-48b7-8e17-e3cecda1c1c5",
  "author": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com"
  },
  "documents": [
    {
      "id": 5,
      "uuid": "d94e615f-76e3-46d5-8f98-36bdacb8664a",
      "url": "https://docuseal.com/file/hash/sample-document.pdf",
      "preview_image_url": "https://docuseal.com/file/hash/0.jpg",
      "filename": "example-document.pdf"
    }
  ]
}
DELETE
Archive a template
The API endpoint allows you to archive a document template.

https://api.docuseal.com/templates/{id}
Authorization
AuthToken (apiKey)
AuthToken
key-name:
X-Auth-Token
in:
header
Path Variables
id
integer
Required
1000001
The unique identifier of the document template.

Response
200
OK


Body

Headers
application/json
id
integer
Required
Template unique ID number.

archived_at
string or null
Required
Date and time when the template was archived.

Response Body Example
json
{
  "id": 1,
  "archived_at": "2023-12-14T15:50:21.799Z"
}
/submissions
/submitters
Online
