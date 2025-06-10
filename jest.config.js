/**
 * Jest configuration for n8n-nodes-docuseal
 * Enhanced testing setup with comprehensive coverage and multiple test types
 */
module.exports = {
	// Use ts-jest preset for TypeScript support
	preset: 'ts-jest',

	// Test environment
	testEnvironment: 'node',

	// Root directory for tests
	rootDir: '.',

	// Test file patterns
	testMatch: [
		'**/__tests__/**/*.(test|spec).(js|ts)',
		'**/*.(test|spec).(js|ts)',
		'!**/node_modules/**',
		'!**/dist/**',
	],

	// Transform configuration - explicitly disable babel-jest
	transform: {
		'^.+\.ts$': [
			'ts-jest',
			{
				tsconfig: 'tsconfig.json',
				useESM: false,
				isolatedModules: true,
			},
		],
	},

	// Module file extensions
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

	// Explicitly disable babel-jest for .ts files
	transformIgnorePatterns: ['node_modules/(?!(.*\.mjs$))'],

	// Module name mapping for path aliases
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/nodes/Docuseal/$1',
		'^@utils/(.*)$': '<rootDir>/utils/$1',
		'^@types/(.*)$': '<rootDir>/types/$1',
	},

	// Setup files
	setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

	// Coverage configuration
	collectCoverage: true,
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'text-summary', 'html', 'lcov', 'json'],

	// Coverage collection patterns
	collectCoverageFrom: [
		'nodes/**/*.{ts,js}',
		'credentials/**/*.{ts,js}',
		'utils/**/*.{ts,js}',
		'!**/*.d.ts',
		'!**/node_modules/**',
		'!**/dist/**',
		'!**/__tests__/**',
		'!**/*.test.{ts,js}',
		'!**/*.spec.{ts,js}',
	],

	// Coverage thresholds - disabled for now
	// coverageThreshold: {
	// 	global: {
	// 		branches: 80,
	// 		functions: 80,
	// 		lines: 80,
	// 		statements: 80,
	// 	},
	// 	'nodes/**/*.ts': {
	// 		branches: 75,
	// 		functions: 75,
	// 		lines: 75,
	// 		statements: 75,
	// 	},
	// 	'credentials/**/*.ts': {
	// 		branches: 90,
	// 		functions: 90,
	// 		lines: 90,
	// 		statements: 90,
	// 	},
	// },

	// Ignore patterns
	testPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],

	// Verbose output
	verbose: true,

	// Clear mocks between tests
	clearMocks: true,

	// Restore mocks after each test
	restoreMocks: true,

	// Reset modules between tests
	resetModules: true,

	// Error handling
	errorOnDeprecated: true,

	// Watch plugins disabled - jest-watch-typeahead not installed
	// watchPlugins: [
	//	'jest-watch-typeahead/filename',
	//	'jest-watch-typeahead/testname',
	// ],

	// Projects for different test types
	projects: [
		{
			displayName: 'unit',
			testMatch: ['<rootDir>/tests/**/*.(test|spec).(js|ts)'],
			testEnvironment: 'node',
			preset: 'ts-jest',
			transform: {
				'^.+\.ts$': [
					'ts-jest',
					{
						tsconfig: 'tsconfig.json',
						useESM: false,
						isolatedModules: true,
					},
				],
			},
		},
		{
			displayName: 'integration',
			testMatch: ['<rootDir>/tests/**/*.integration.(test|spec).(js|ts)'],
			testEnvironment: 'node',
			preset: 'ts-jest',
			transform: {
				'^.+\.ts$': [
					'ts-jest',
					{
						tsconfig: 'tsconfig.json',
						useESM: false,
						isolatedModules: true,
					},
				],
			},
		},
	],

	// Test timeout
	testTimeout: 60000,

	// Max workers for parallel execution
	maxWorkers: '50%',

	// Cache directory
	cacheDirectory: '<rootDir>/.jest-cache',

	// Bail on first test failure in CI
	bail: process.env.CI ? 1 : 0,

	// Force exit after tests complete
	forceExit: true,

	// Detect open handles and leaks
	detectOpenHandles: true,
	detectLeaks: true,
};
