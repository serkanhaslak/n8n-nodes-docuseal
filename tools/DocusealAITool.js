const { request } = require('n8n-workflow');

module.exports = {
  name: 'docusealAITool',
  displayName: 'DocuSeal AI Tool',
  description: 'Pre-fill DocuSeal submissions with field values',
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
          name: 'Pre-fill Submission',
          value: 'prefillSubmission',
          description: 'Pre-fill fields in a DocuSeal submission',
          action: 'Pre fill a DocuSeal submission',
        },
      ],
      default: 'prefillSubmission',
    },
    {
      displayName: 'Submission ID',
      name: 'submissionId',
      type: 'string',
      required: true,
      displayOptions: {
        show: {
          operation: ['prefillSubmission'],
        },
      },
      default: '',
      description: 'ID of the submission to update',
    },
    {
      displayName: 'Submitter ID',
      name: 'submitterId',
      type: 'string',
      required: true,
      displayOptions: {
        show: {
          operation: ['prefillSubmission'],
        },
      },
      default: '',
      description: 'ID of the submitter to update',
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
      description: 'Key-value pairs of field names and values to pre-fill (e.g., {"First Name": "John"})',
    },
    {
      displayName: 'Environment',
      name: 'environment',
      type: 'options',
      displayOptions: {
        show: {
          operation: ['prefillSubmission'],
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
    const { operation, submissionId, submitterId, fieldValues, environment = 'production' } = params;
    
    // Convert fieldValues from string to JSON if needed
    let parsedFieldValues;
    try {
      parsedFieldValues = typeof fieldValues === 'string' 
        ? JSON.parse(fieldValues) 
        : fieldValues;
    } catch (error) {
      throw new Error(`Invalid JSON in field values: ${error.message}`);
    }
    
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
    
    if (operation === 'prefillSubmission') {
      try {
        // Make API request to update submitter and pre-fill values
        const options = {
          method: 'PUT',
          headers: {
            'X-Auth-Token': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: parsedFieldValues
          }),
          uri: `${baseUrl}/submitters/${submitterId}`,
          json: true
        };
        
        const response = await request(options);
        return {
          success: true,
          message: 'Submission pre-filled successfully',
          submissionId,
          submitterId,
          ...response
        };
      } catch (error) {
        throw new Error(`DocuSeal API error: ${error.message}`);
      }
    }
  }
};
