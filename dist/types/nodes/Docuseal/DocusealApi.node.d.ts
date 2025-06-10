import type { INodeTypeDescription, IExecuteFunctions, INodeExecutionData, INodeType, ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
export declare class DocusealApi implements INodeType {
    description: INodeTypeDescription;
    methods: {
        loadOptions: {
            getTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
        };
    };
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
//# sourceMappingURL=DocusealApi.node.d.ts.map