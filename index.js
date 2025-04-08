module.exports = {
	nodeTypes: [
		require('./dist/nodes/Docuseal/DocusealApi.node.js'),
		require('./dist/nodes/Docuseal/DocusealTrigger.node.js'),
		require('./dist/nodes/Docuseal/DocusealAiTool.node.js'),
	],
	credentialTypes: [
		require('./dist/credentials/DocusealApi.credentials.js'),
	],
};