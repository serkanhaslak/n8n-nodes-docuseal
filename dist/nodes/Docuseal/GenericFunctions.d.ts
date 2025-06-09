import type { IExecuteFunctions, IHookFunctions, IDataObject, ILoadOptionsFunctions, IHttpRequestMethods } from 'n8n-workflow';
export declare function docusealApiRequest(this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions, method: IHttpRequestMethods, endpoint: string, body?: object, query?: IDataObject, options?: IDataObject): Promise<any>;
export declare function docusealApiRequestAllItems(this: IExecuteFunctions | ILoadOptionsFunctions, method: IHttpRequestMethods, endpoint: string, body?: object, query?: IDataObject): Promise<any>;
export declare function parseJsonInput(inputData: string | object): object;
export declare function getTemplates(this: ILoadOptionsFunctions): Promise<Array<{
    name: string;
    value: number;
}>>;
export declare function prepareBinaryData(this: IExecuteFunctions, binaryPropertyName: string, itemIndex: number, fileName?: string): Promise<IDataObject>;
export declare function buildSubmittersArray(submittersData: IDataObject): IDataObject[];
export declare function buildFieldValues(nodeParameters: IDataObject): IDataObject;
export declare function formatDate(date: string): string;
