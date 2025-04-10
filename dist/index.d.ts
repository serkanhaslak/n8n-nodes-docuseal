import { DocusealApi } from './credentials/DocusealApi.credentials';
import { DocusealApi as DocusealApiNode } from './nodes/Docuseal/DocusealApi.node';
import { DocusealTrigger } from './nodes/Docuseal/DocusealTrigger.node';
export declare const credentials: {
    docusealApi: {
        type: typeof DocusealApi;
    };
};
export declare const nodes: {
    docusealApi: {
        type: typeof DocusealApiNode;
    };
    docusealTrigger: {
        type: typeof DocusealTrigger;
    };
};
