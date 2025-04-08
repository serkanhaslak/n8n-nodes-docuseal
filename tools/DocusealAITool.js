const { request } = require('n8n-workflow');

module.exports = {
  name: 'docusealAITool',
  displayName: 'DocuSeal AI Tool',
  description: 'Work with DocuSeal templates and pre-fill submissions with field values',
  documentationUrl: 'https://www.docuseal.co/docs/api',
  icon: 'file:../nodes/Docuseal/docuseal.svg',
  returnType: 'json',
  properties: [
    {
      displayName: 'Operation',
      name: 'operation',
      type: 'options',
      noDataExpression: true,
      options: [
        {
          name: 'Get Template',
          value: 'getTemplate',
          description: 'Retrieve a DocuSeal template with its fields and properties',
          action: 'Get a DocuSeal template',
        },
        {
          name: 'Pre-fill Submission',
          value: 'prefillSubmission',
          description: 'Pre-fill fields in a DocuSeal submission',
          action: 'Pre fill a DocuSeal submission',
        },
      ],
      default: 'prefillSubmission',
    },
    // Parameters for Get Template operation
    {
      displayName: 'Template ID',
      name: 'templateId',
      type: 'string',
      required: true,
      displayOptions: {
        show: {
          operation: ['getTemplate'],
        },
      },
      default: '',
      description: 'ID of the template to retrieve',
    },
    // Parameters for Pre-fill Submission operation
    {
      displayName: 'Template ID',
      name: 'templateId',
      type: 'string',
      required: true,
      displayOptions: {
        show: {
          operation: ['prefillSubmission'],
        },
      },
      default: '',
      description: 'ID of the template to use for creating a submission',
    },
    {
      displayName: 'Submitter Email',
      name: 'submitterEmail',
      type: 'string',
      required: true,
      displayOptions: {
        show: {
          operation: ['prefillSubmission'],
        },
      },
      default: '',
      description: 'Email address of the submitter',
    },
    {
      displayName: 'Submitter Name',
      name: 'submitterName',
      type: 'string',
      required: false,
      displayOptions: {
        show: {
          operation: ['prefillSubmission'],
        },
      },
      default: '',
      description: 'Name of the submitter',
    },
    {
      displayName: 'Submitter Role',
      name: 'submitterRole',
      type: 'string',
      required: false,
      displayOptions: {
        show: {
          operation: ['prefillSubmission'],
        },
      },
      default: '',
      description: 'Role of the submitter',
    },
    {
      displayName: 'Field Values',
      name: 'fieldValues',
      type: 'json',
      required: true,
      displayOptions: {
        show: {
          operation: ['prefillSubmission'],
        },
      },
      default: '{}',
      description: 'JSON object with key-value pairs mapping field names to values (e.g. {"First Name": "John", "Last Name": "Doe", "Email": "john@example.com"})',
    },
    {
      displayName: 'Send Email',
      name: 'sendEmail',
      type: 'boolean',
      required: false,
      displayOptions: {
        show: {
          operation: ['prefillSubmission'],
        },
      },
      default: true,
      description: 'Whether to send an email notification to the submitter',
    },
    {
      displayName: 'Environment',
      name: 'environment',
      type: 'options',
      displayOptions: {
        show: {
          operation: ['getTemplate', 'prefillSubmission'],
        },
      },
      options: [
        {
          name: 'Production',
          value: 'production',
        },
        {
          name: 'Test',
          value: 'test',
        },
      ],
      default: 'production',
      description: 'The environment to use for the API call',
    },
  ],
  
  // This is the function that will be executed when the tool is called
  async execute(params, credentialType, credentialData) {
    const { operation, templateId, submitterEmail, submitterName, submitterRole, fieldValues, sendEmail = true, environment = 'production' } = params;
    
    // Handle backward compatibility for credentials
    let apiKey;
    if (credentialData.apiKey) {
      // Support old credentials format
      apiKey = credentialData.apiKey;
    } else {
      // Use new credentials format with environment selection
      apiKey = environment === 'production' 
        ? credentialData.productionApiKey 
        : credentialData.testApiKey;
    }
    
    // Determine base URL based on environment
    const baseUrl = environment === 'production'
      ? 'https://api.docuseal.com'
      : 'https://test-api.docuseal.com';
    
    if (operation === 'getTemplate') {
      try {
        // Make API request to get template details
        const options = {
          method: 'GET',
          headers: {
            'X-Auth-Token': apiKey,
            'Content-Type': 'application/json'
          },
          uri: `${baseUrl}/templates/${templateId}`,
          json: true
        };
        
        const response = await request(options);
        return {
          success: true,
          message: 'Template retrieved successfully',
          templateId,
          ...response
        };
      } catch (error) {
        throw new Error(`DocuSeal API error: ${error.message}`);
      }
    }
    
    if (operation === 'prefillSubmission') {
      try {
        // Convert fieldValues from string to JSON if needed
        let parsedFieldValues;
        try {
          parsedFieldValues = typeof fieldValues === 'string' 
            ? JSON.parse(fieldValues) 
            : fieldValues;
        } catch (error) {
          throw new Error(`Invalid JSON in field values: ${error.message}`);
        }
        
        // Create submission data
        const submissionData = {
          template_id: templateId,
          send_email: sendEmail,
          submitters: [
            {
              email: submitterEmail,
              name: submitterName || undefined,
              role: submitterRole || undefined,
              values: parsedFieldValues,
            },
          ],
        };
        
        // Make API request to create submission with pre-filled values
        const options = {
          method: 'POST',
          headers: {
            'X-Auth-Token': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submissionData),
          uri: `${baseUrl}/submissions`,
          json: true
        };
        
        const response = await request(options);
        return {
          success: true,
          message: 'Submission created and pre-filled successfully',
          templateId,
          submitterEmail,
          ...response
        };
      } catch (error) {
        throw new Error(`DocuSeal API error: ${error.message}`);
      }
    }
  }
};
