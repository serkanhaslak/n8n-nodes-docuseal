import { IExecuteFunctions, INodeExecutionData, INodeType, ILoadOptionsFunctions } from 'n8n-workflow';
import type { INodeTypeDescription, INodePropertyOptions } from 'n8n-workflow';
export declare class DocusealApi implements INodeType {
    description: INodeTypeDescription;
    methods: {
        loadOptions: {
            getTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
        };
    };
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
