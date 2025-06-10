/// <reference types="node" />
/// <reference types="node" />
import type { IExecuteFunctions, IHookFunctions, IDataObject, ILoadOptionsFunctions, IHttpRequestMethods } from 'n8n-workflow';
export declare function validateApiKey(apiKey: string): {
    isValid: boolean;
    message?: string;
};
export declare function sanitizeInput(input: any): any;
export declare function validateFile(fileData: Buffer, fileName: string, mimeType?: string): {
    isValid: boolean;
    message?: string;
};
export declare function validateUrl(url: string): {
    isValid: boolean;
    message?: string;
};
export declare function validateEndpoint(endpoint: string): {
    isValid: boolean;
    sanitized?: string;
    message?: string;
};
export declare function docusealApiRequest(this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions, method: IHttpRequestMethods, endpoint: string, body?: object, query?: IDataObject, options?: IDataObject, retryCount?: number): Promise<any>;
export declare function docusealApiRequestAllItems(this: IExecuteFunctions | ILoadOptionsFunctions, method: IHttpRequestMethods, endpoint: string, body?: object, query?: IDataObject, options?: {
    batchSize?: number;
    maxItems?: number;
    memoryOptimized?: boolean;
}): Promise<any>;
export declare function docusealApiBatchRequest(this: IExecuteFunctions, requests: Array<{
    method: IHttpRequestMethods;
    endpoint: string;
    body?: object;
    query?: IDataObject;
}>, options?: {
    batchSize?: number;
    delayBetweenBatches?: number;
}): Promise<any[]>;
export declare function docusealApiUploadOptimized(this: IExecuteFunctions, fileData: Buffer, fileName: string, options?: {
    chunkSize?: number;
    progressCallback?: (progress: number) => void;
}): Promise<any>;
export declare function parseJsonInput(inputData: string | object): object;
export declare function getTemplates(this: ILoadOptionsFunctions): Promise<Array<{
    name: string;
    value: string;
}>>;
export declare function prepareBinaryData(this: IExecuteFunctions, binaryPropertyName: string, itemIndex: number, fileName?: string): Promise<IDataObject>;
export declare function buildSubmittersArray(submittersData: IDataObject): IDataObject[];
export declare function buildFieldValues(nodeParameters: IDataObject): IDataObject;
export declare function formatDate(date: string): string;
//# sourceMappingURL=GenericFunctions.d.ts.map