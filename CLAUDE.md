# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an n8n community node package for DocuSeal, a document signing solution. The package provides two nodes:
- **DocusealApi**: Main API node for creating documents, managing templates, and handling submissions
- **DocusealTrigger**: Webhook trigger node for listening to DocuSeal events

## Common Development Commands

```bash
# Install dependencies
pnpm install

# Build the project (TypeScript compilation + icon copying)
npm run build

# Development mode (watch TypeScript changes)
npm run dev

# Lint the code
npm run lint

# Fix linting issues
npm run lintfix

# Format code with Prettier
npm run format

# Prepare for publishing (runs build)
npm run prepublishOnly

# Publish to npm
npm publish --access public
```

## Architecture and Key Components

### Project Structure
- `credentials/DocusealApi.credentials.ts` - API credential definitions (production/test keys)
- `nodes/Docuseal/` - All node implementations
  - `DocusealApi.node.ts` - Main API node with template, submission, submitter, and AI tool resources
  - `DocusealTrigger.node.ts` - Webhook trigger for DocuSeal events
  - `GenericFunctions.ts` - Shared utilities for API requests and authentication
  - `*Description.ts` files - Resource-specific operations and fields

### Key Technical Details

1. **Node Input/Output Format**: Uses `NodeConnectionType.Main` format to avoid TypeScript/ESLint conflicts

2. **API Request Pattern**: All API calls go through `docusealApiRequest()` in GenericFunctions.ts which handles:
   - Environment selection (production/test)
   - Authentication headers
   - Base URL configuration
   - Error handling

3. **Resource Operations**: Each resource (Template, Submission, Submitter) has its own description file defining:
   - Available operations (get, list, create, etc.)
   - Field definitions with proper types and descriptions
   - Complex JSON inputs with detailed schema examples for AI compatibility

4. **AI Tool Support**: The main node includes `toolSpecification` property to enable use with n8n AI Agents

5. **Build Process**: Uses TypeScript compilation + Gulp for copying SVG icons to dist folder

## Important Development Notes

- When modifying node parameters, ensure options are alphabetized to pass linting
- Complex JSON parameters must include detailed format examples in descriptions
- The package follows n8n community node standards with specific credential and node registration in package.json
- TypeScript strict mode is enabled - handle all potential null/undefined cases
- ESLint rules for node input/output format are disabled in favor of TypeScript types