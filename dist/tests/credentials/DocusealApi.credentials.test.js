"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DocusealApi_credentials_1 = require("../../credentials/DocusealApi.credentials");
describe('DocusealApi Credentials', () => {
    let credentials;
    beforeEach(() => {
        credentials = new DocusealApi_credentials_1.DocusealApi();
    });
    it('should have correct name', () => {
        expect(credentials.name).toBe('docusealApi');
    });
    it('should have correct display name', () => {
        expect(credentials.displayName).toBe('DocuSeal API');
    });
    it('should have correct documentation URL', () => {
        expect(credentials.documentationUrl).toBe('https://www.docuseal.com/docs/api');
    });
    it('should have environment property with correct options', () => {
        const environmentProperty = credentials.properties.find((prop) => prop.name === 'environment');
        expect(environmentProperty).toBeDefined();
        expect(environmentProperty?.type).toBe('options');
        expect(environmentProperty?.options).toEqual([
            { name: 'Production', value: 'production' },
            { name: 'Test', value: 'test' },
        ]);
        expect(environmentProperty?.default).toBe('production');
    });
    it('should have production API key property', () => {
        const productionApiKeyProperty = credentials.properties.find((prop) => prop.name === 'productionApiKey');
        expect(productionApiKeyProperty).toBeDefined();
        expect(productionApiKeyProperty?.type).toBe('string');
        expect(productionApiKeyProperty?.typeOptions?.password).toBe(true);
        expect(productionApiKeyProperty?.displayOptions?.show?.environment).toEqual(['production']);
    });
    it('should have test API key property', () => {
        const testApiKeyProperty = credentials.properties.find((prop) => prop.name === 'testApiKey');
        expect(testApiKeyProperty).toBeDefined();
        expect(testApiKeyProperty?.type).toBe('string');
        expect(testApiKeyProperty?.typeOptions?.password).toBe(true);
        expect(testApiKeyProperty?.displayOptions?.show?.environment).toEqual(['test']);
    });
    it('should have base URL property', () => {
        const baseUrlProperty = credentials.properties.find((prop) => prop.name === 'baseUrl');
        expect(baseUrlProperty).toBeDefined();
        expect(baseUrlProperty?.type).toBe('string');
        expect(baseUrlProperty?.default).toBe('https://api.docuseal.com');
    });
    it('should have all required properties', () => {
        const propertyNames = credentials.properties.map((prop) => prop.name);
        expect(propertyNames).toContain('environment');
        expect(propertyNames).toContain('productionApiKey');
        expect(propertyNames).toContain('testApiKey');
        expect(propertyNames).toContain('baseUrl');
    });
    it('should have correct property count', () => {
        expect(credentials.properties).toHaveLength(4);
    });
});
//# sourceMappingURL=DocusealApi.credentials.test.js.map