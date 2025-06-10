/**
 * Prettier configuration for n8n-nodes-docuseal
 * Enhanced formatting rules with file-specific overrides
 */
module.exports = {
	/**
	 * https://prettier.io/docs/en/options.html#semicolons
	 */
	semi: true,

	/**
	 * https://prettier.io/docs/en/options.html#trailing-commas
	 */
	trailingComma: 'all',

	/**
	 * https://prettier.io/docs/en/options.html#bracket-spacing
	 */
	bracketSpacing: true,

	/**
	 * https://prettier.io/docs/en/options.html#tabs
	 */
	useTabs: true,

	/**
	 * https://prettier.io/docs/en/options.html#tab-width
	 */
	tabWidth: 2,

	/**
	 * https://prettier.io/docs/en/options.html#arrow-function-parentheses
	 */
	arrowParens: 'always',

	/**
	 * https://prettier.io/docs/en/options.html#quotes
	 */
	singleQuote: true,

	/**
	 * https://prettier.io/docs/en/options.html#quote-props
	 */
	quoteProps: 'as-needed',

	/**
	 * https://prettier.io/docs/en/options.html#end-of-line
	 */
	endOfLine: 'lf',

	/**
	 * https://prettier.io/docs/en/options.html#print-width
	 */
	printWidth: 100,

	/**
	 * https://prettier.io/docs/en/options.html#jsx-quotes
	 */
	jsxSingleQuote: true,

	/**
	 * https://prettier.io/docs/en/options.html#jsx-brackets
	 */
	jsxBracketSameLine: false,

	/**
	 * https://prettier.io/docs/en/options.html#embedded-language-formatting
	 */
	embeddedLanguageFormatting: 'auto',

	/**
	 * File-specific formatting overrides
	 */
	overrides: [
		{
			files: '*.json',
			options: {
				printWidth: 80,
				useTabs: false,
				tabWidth: 2,
			},
		},
		{
			files: '*.md',
			options: {
				printWidth: 80,
				proseWrap: 'always',
				useTabs: false,
				tabWidth: 2,
			},
		},
		{
			files: ['*.yml', '*.yaml'],
			options: {
				useTabs: false,
				tabWidth: 2,
			},
		},
		{
			files: 'package.json',
			options: {
				useTabs: false,
				tabWidth: 2,
				printWidth: 120,
			},
		},
		{
			files: '*.xml',
			options: {
				useTabs: false,
				tabWidth: 2,
				printWidth: 120,
			},
		},
	],
};
