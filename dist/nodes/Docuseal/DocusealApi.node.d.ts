import { IExecuteFunctions, INodeExecutionData, INodeType, ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import type { INodeTypeDescription } from 'n8n-workflow';
export declare class DocusealApi implements INodeType {
    description: INodeTypeDescription;
    methods: {
        loadOptions: {
            getTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
            getTemplateFolders(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
        };
    };
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
