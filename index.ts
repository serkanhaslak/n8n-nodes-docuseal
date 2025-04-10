// Import credentials
import { DocusealApi } from './credentials/DocusealApi.credentials';

// Import nodes
import { DocusealApi as DocusealApiNode } from './nodes/Docuseal/DocusealApi.node';
import { DocusealTrigger } from './nodes/Docuseal/DocusealTrigger.node';

// Export credentials
export const credentials = {
	docusealApi: {
		type: DocusealApi,
	},
};

// Export nodes
export const nodes = {
	docusealApi: {
		type: DocusealApiNode,
	},
	docusealTrigger: {
		type: DocusealTrigger,
	},
};
