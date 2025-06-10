import type { INodeProperties } from 'n8n-workflow';

export const formOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['form'],
			},
		},
		options: [
			{
				name: 'Get Started',
				value: 'getStarted',
				description: 'Get form events when form is started',
				action: 'Get form started events',
			},
			{
				name: 'Get Viewed',
				value: 'getViewed',
				description: 'Get form events when form is viewed',
				action: 'Get form viewed events',
			},
		],
		default: 'getStarted',
	},
];

export const formFields: INodeProperties[] = [
	// Common fields for all form operations
	{
		displayName: 'Submitter ID',
		name: 'submitterId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['form'],
				operation: ['getStarted', 'getViewed'],
			},
		},
		default: 0,
		description: 'ID of the submitter to get form events for',
	},
];
