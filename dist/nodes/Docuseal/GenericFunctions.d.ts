import type { IExecuteFunctions, IHookFunctions, IDataObject, ILoadOptionsFunctions, IHttpRequestMethods } from 'n8n-workflow';
export declare function docusealApiRequest(this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions, method: IHttpRequestMethods, endpoint: string, body?: object, query?: IDataObject, options?: IDataObject): Promise<any>;
export declare function docusealApiRequestAllItems(this: IExecuteFunctions | ILoadOptionsFunctions, method: IHttpRequestMethods, endpoint: string, body?: object, query?: IDataObject): Promise<any>;
export declare function parseJsonInput(inputData: string | object): object;
export declare function getTemplates(this: ILoadOptionsFunctions): Promise<Array<{
    name: string;
    value: number;
}>>;
