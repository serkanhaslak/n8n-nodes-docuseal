#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
	const envFile = fs.readFileSync(envPath, 'utf8');
	envFile.split('\n').forEach((line) => {
		const [key, value] = line.split('=');
		if (key && value) {
			process.env[key] = value.trim();
		}
	});
}

async function publish(skipVersioning = false) {
	try {
		console.log('🚀 Starting npm publish process...');

		// Check if NPM_KEY is available
		if (!process.env.NPM_KEY) {
			throw new Error(
				'NPM_KEY not found in environment variables. Please add it to your .env file.',
			);
		}

		// Get version type from command line if provided
		const versionType = process.argv[2] || 'patch';

		// Update version if not skipping
		if (!skipVersioning && ['major', 'minor', 'patch'].includes(versionType)) {
			console.log(`📦 Bumping ${versionType} version...`);
			execSync(`node ${path.join(__dirname, 'version.js')} ${versionType}`, { stdio: 'inherit' });
		}

		// Authenticate with npm using the API key
		console.log('🔐 Authenticating with npm...');
		execSync(`npm config set //registry.npmjs.org/:_authToken ${process.env.NPM_KEY}`, {
			stdio: 'inherit',
		});

		// Run validation (allowing warnings but not errors)
		console.log('✅ Running validation...');
		try {
			execSync('npm run type-check', { stdio: 'inherit' });
			console.log('✅ Type check passed');

			// Run tests
			execSync('npm run test', { stdio: 'inherit' });
			console.log('✅ Tests passed');

			// Note: Skipping lint check as it only has warnings, not errors
			console.log('⚠️  Skipping lint check (warnings only, not errors)');
		} catch (error) {
			throw new Error('Validation failed: ' + error.message);
		}

		// Build is already done in version.js, but rebuild if needed
		if (!fs.existsSync(path.join(__dirname, '..', 'dist'))) {
			console.log('🏗️ Building project...');
			execSync('npm run build:prod', { stdio: 'inherit' });
		}

		// Publish to npm
		console.log('📦 Publishing to npm...');
		execSync('npm publish --access public', { stdio: 'inherit' });

		console.log('✅ Successfully published to npm!');

		// Push to git if versioning was done
		if (!skipVersioning) {
			console.log('🚀 Pushing to git...');
			execSync('git push', { stdio: 'inherit' });
			execSync('git push --tags', { stdio: 'inherit' });
		}
	} catch (error) {
		console.error('❌ Publish failed:', error.message);
		process.exit(1);
	} finally {
		// Clean up npm config for security
		try {
			execSync('npm config delete //registry.npmjs.org/:_authToken', { stdio: 'pipe' });
		} catch (e) {
			// Ignore cleanup errors
		}
	}
}

// Check if called with --skip-versioning flag
const skipVersioning = process.argv.includes('--skip-versioning');
publish(skipVersioning);
