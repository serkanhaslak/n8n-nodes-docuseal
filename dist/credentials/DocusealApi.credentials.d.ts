import { ICredentialType, INodeProperties } from 'n8n-workflow';
export declare class DocusealApi implements ICredentialType {
    name: string;
    displayName: string;
    documentationUrl: string;
    properties: INodeProperties[];
}
