"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodes = exports.credentials = void 0;
const DocusealApi_credentials_1 = require("./credentials/DocusealApi.credentials");
const DocusealApi_node_1 = require("./nodes/Docuseal/DocusealApi.node");
const DocusealTrigger_node_1 = require("./nodes/Docuseal/DocusealTrigger.node");
exports.credentials = {
    docusealApi: {
        type: DocusealApi_credentials_1.DocusealApi,
    },
};
exports.nodes = {
    docusealApi: {
        type: DocusealApi_node_1.DocusealApi,
    },
    docusealTrigger: {
        type: DocusealTrigger_node_1.DocusealTrigger,
    },
};
//# sourceMappingURL=index.js.map