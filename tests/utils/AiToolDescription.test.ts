/**
 * Tests for AiToolDescription
 */

import { aiToolOperations, aiToolFields } from '../../nodes/Docuseal/AiToolDescription';

describe('AiToolDescription', () => {
	describe('aiToolOperations', () => {
		it('should have correct structure', () => {
			expect(aiToolOperations).toBeDefined();
			expect(Array.isArray(aiToolOperations)).toBe(true);
			expect(aiToolOperations).toHaveLength(1);
		});

		it('should have generateDocument operation', () => {
			const operation = aiToolOperations[0];
			expect(operation).toBeDefined();
			expect(operation?.displayName).toBe('Operation');
			expect(operation?.name).toBe('operation');
			expect(operation?.type).toBe('options');
			expect(operation?.default).toBe('generateDocument');
		});

		it('should have correct displayOptions', () => {
			const operation = aiToolOperations[0];
			expect(operation).toBeDefined();
			expect(operation?.displayOptions?.show).toEqual({
				resource: ['aiTool'],
			});
		});

		it('should have generateDocument in options', () => {
			const operation = aiToolOperations[0];
			expect(operation).toBeDefined();
			const generateOption = operation?.options?.find(
				(opt: any) => opt.value === 'generateDocument',
			);

			expect(generateOption).toBeDefined();
			expect((generateOption as any)?.name).toBe('Generate Document');
			expect((generateOption as any)?.description).toBe(
				'Generate a document using AI based on a description',
			);
			expect((generateOption as any)?.action).toBe('Generate a document with AI');
		});
	});

	describe('aiToolFields', () => {
		it('should have correct structure', () => {
			expect(aiToolFields).toBeDefined();
			expect(Array.isArray(aiToolFields)).toBe(true);
			expect(aiToolFields.length).toBeGreaterThan(0);
		});

		it('should have documentType field', () => {
			const documentTypeField = aiToolFields.find((field) => field.name === 'documentType');

			expect(documentTypeField).toBeDefined();
			expect(documentTypeField?.displayName).toBe('Document Type');
			expect(documentTypeField?.type).toBe('string');
			expect(documentTypeField?.required).toBe(true);
			expect(documentTypeField?.placeholder).toContain('Non-disclosure agreement');
		});

		it('should have description field', () => {
			const descriptionField = aiToolFields.find((field) => field.name === 'description');

			expect(descriptionField).toBeDefined();
			expect(descriptionField?.displayName).toBe('Document Description');
			expect(descriptionField?.type).toBe('string');
			expect(descriptionField?.required).toBe(true);
			expect(descriptionField?.typeOptions?.rows).toBe(4);
		});

		it('should have additionalOptions collection', () => {
			const additionalOptionsField = aiToolFields.find(
				(field) => field.name === 'additionalOptions',
			);

			expect(additionalOptionsField).toBeDefined();
			expect(additionalOptionsField?.displayName).toBe('Additional Options');
			expect(additionalOptionsField?.type).toBe('collection');
			expect(additionalOptionsField?.options).toBeDefined();
		});

		it('should have language option in additionalOptions', () => {
			const additionalOptionsField = aiToolFields.find(
				(field) => field.name === 'additionalOptions',
			);
			const languageOption = additionalOptionsField?.options?.find(
				(opt: any) => opt.name === 'language',
			) as any;

			expect(languageOption).toBeDefined();
			expect(languageOption?.displayName).toBe('Language');
			expect(languageOption?.type).toBe('options');
			expect(languageOption?.default).toBe('en');
			expect(languageOption?.options).toBeDefined();
			expect(Array.isArray(languageOption?.options)).toBe(true);
		});

		it('should have all expected languages', () => {
			const additionalOptionsField = aiToolFields.find(
				(field) => field.name === 'additionalOptions',
			);
			const languageOption = additionalOptionsField?.options?.find(
				(opt: any) => opt.name === 'language',
			) as any;
			const languages = languageOption?.options;

			expect(languages).toBeDefined();
			expect(languages?.length).toBeGreaterThan(5);

			const languageValues = languages?.map((lang: any) => lang.value);
			expect(languageValues).toContain('en');
			expect(languageValues).toContain('es');
			expect(languageValues).toContain('fr');
			expect(languageValues).toContain('de');
			expect(languageValues).toContain('ja');
		});

		it('should have style option in additionalOptions', () => {
			const additionalOptionsField = aiToolFields.find(
				(field) => field.name === 'additionalOptions',
			);
			const styleOption = additionalOptionsField?.options?.find(
				(opt: any) => opt.name === 'style',
			) as any;

			expect(styleOption).toBeDefined();
			expect(styleOption?.displayName).toBe('Style');
			expect(styleOption?.type).toBe('options');
			expect(styleOption?.default).toBe('formal');
		});

		it('should have all style options', () => {
			const additionalOptionsField = aiToolFields.find(
				(field) => field.name === 'additionalOptions',
			);
			const styleOption = additionalOptionsField?.options?.find(
				(opt: any) => opt.name === 'style',
			) as any;
			const styles = styleOption?.options;

			expect(styles).toBeDefined();
			expect(styles?.length).toBe(3);

			const styleValues = styles?.map((style: any) => style.value);
			expect(styleValues).toContain('formal');
			expect(styleValues).toContain('friendly');
			expect(styleValues).toContain('simple');
		});

		it('should have fields option in additionalOptions', () => {
			const additionalOptionsField = aiToolFields.find(
				(field) => field.name === 'additionalOptions',
			);
			const fieldsOption = additionalOptionsField?.options?.find(
				(opt: any) => opt.name === 'fields',
			) as any;

			expect(fieldsOption).toBeDefined();
			expect(fieldsOption?.displayName).toBe('Fields to Include');
			expect(fieldsOption?.type).toBe('string');
			expect(fieldsOption?.placeholder).toContain('signature, date');
		});

		it('should have correct displayOptions for all fields', () => {
			const fieldsWithDisplayOptions = aiToolFields.filter((field) => field.displayOptions);

			fieldsWithDisplayOptions.forEach((field) => {
				expect(field.displayOptions?.show).toEqual({
					resource: ['aiTool'],
					operation: ['generateDocument'],
				});
			});
		});
	});
});
