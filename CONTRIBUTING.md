# Contributing to n8n-nodes-docuseal

Thank you for your interest in contributing to the DocuSeal n8n nodes! This
guide will help you get started with development and contributing to the
project.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Style](#code-style)
- [Submitting Changes](#submitting-changes)
- [Security Guidelines](#security-guidelines)

## Development Setup

### Prerequisites

- Node.js 16+ and npm/pnpm
- Git
- A DocuSeal account for testing
- n8n development environment (optional but recommended)

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/serkanhaslak/n8n-nodes-docuseal.git
   cd n8n-nodes-docuseal
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your DocuSeal API credentials
   ```

4. **Build the project**

   ```bash
   pnpm build
   ```

5. **Link for local n8n development**

   ```bash
   # In this project directory
   npm link

   # In your n8n directory
   npm link n8n-nodes-docuseal
   ```

### Development with n8n

For the best development experience, set up a local n8n instance:

```bash
# Clone n8n
git clone https://github.com/n8n-io/n8n.git
cd n8n

# Install dependencies
pnpm install

# Link your node package
npm link n8n-nodes-docuseal

# Start n8n in development mode
pnpm dev
```

## Project Structure

```
n8n-nodes-docuseal/
├── credentials/
│   └── DocusealApi.credentials.ts    # API credential definition
├── nodes/
│   └── Docuseal/
│       ├── DocusealApi.node.ts       # Main API node
│       ├── DocusealTrigger.node.ts   # Webhook trigger node
│       ├── GenericFunctions.ts       # Shared utilities
│       ├── *Description.ts           # Resource descriptions
│       └── docuseal.svg              # Node icon
├── tests/                            # Test files
├── dist/                             # Built files
└── package.json                      # Package configuration
```

### Key Files

- **GenericFunctions.ts**: Contains all API request logic, validation, and
  utility functions
- **DocusealApi.node.ts**: Main node implementation with resource routing
- **DocusealTrigger.node.ts**: Webhook trigger implementation
- **\*Description.ts**: UI definitions for each resource type

## Development Workflow

### Making Changes

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

   - Follow the existing code patterns
   - Add JSDoc comments for new functions
   - Update tests as needed

3. **Test your changes**

   ```bash
   pnpm test
   pnpm build
   ```

4. **Test in n8n**
   - Create test workflows
   - Verify all operations work correctly
   - Test error scenarios

### Adding New Features

#### Adding a New Resource

1. Create a new description file (e.g., `NewResourceDescription.ts`)
2. Define operations and fields following existing patterns
3. Add the resource to `DocusealApi.node.ts`
4. Implement API logic in `GenericFunctions.ts`
5. Add comprehensive tests

#### Adding a New Operation

1. Add operation definition to the appropriate description file
2. Add field definitions for the operation
3. Implement the API call logic
4. Add input validation and error handling
5. Write tests for the new operation

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test GenericFunctions.test.ts

# Run tests with coverage
pnpm test:coverage
```

### Test Structure

Tests are organized by functionality:

- `tests/credentials/` - Credential validation tests
- `tests/nodes/` - Node execution tests
- `tests/utils/` - Utility function tests

### Writing Tests

When adding new functionality:

1. **Unit tests**: Test individual functions in isolation
2. **Integration tests**: Test API interactions with mocked responses
3. **Error handling**: Test all error scenarios
4. **Edge cases**: Test boundary conditions and unusual inputs

Example test structure:

```typescript
describe('NewFeature', () => {
  beforeEach(() => {
    // Setup
  });

  describe('happy path', () => {
    it('should handle normal input correctly', () => {
      // Test implementation
    });
  });

  describe('error handling', () => {
    it('should handle invalid input gracefully', () => {
      // Test error scenarios
    });
  });
});
```

## Code Style

### TypeScript Guidelines

- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use proper typing for all function parameters and returns
- Avoid `any` type - use proper typing or `unknown`

### Naming Conventions

- **Files**: PascalCase for classes, camelCase for utilities
- **Functions**: camelCase with descriptive names
- **Constants**: UPPER_SNAKE_CASE
- **Interfaces**: PascalCase with 'I' prefix for n8n interfaces

### Documentation

- Add JSDoc comments for all public functions
- Include parameter descriptions and return types
- Document complex logic with inline comments
- Update README.md for user-facing changes

Example JSDoc:

```typescript
/**
 * Creates a new document submission from a template
 * @param templateId - The ID of the template to use
 * @param submitters - Array of submitter objects with email and role
 * @param options - Additional options for the submission
 * @returns Promise resolving to the created submission object
 * @throws {NodeApiError} When API request fails or validation errors occur
 */
export async function createSubmission(
  templateId: string,
  submitters: ISubmitter[],
  options?: ISubmissionOptions,
): Promise<ISubmission> {
  // Implementation
}
```

### Security Guidelines

- **Input validation**: Validate all user inputs
- **API key handling**: Never log or expose API keys
- **File uploads**: Validate file types, sizes, and content
- **URL validation**: Prevent SSRF attacks
- **Error messages**: Don't expose sensitive information

## Submitting Changes

### Pull Request Process

1. **Ensure your branch is up to date**

   ```bash
   git checkout main
   git pull origin main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Run the full test suite**

   ```bash
   pnpm test
   pnpm build
   pnpm lint
   ```

3. **Create a pull request**
   - Use a descriptive title
   - Include a detailed description of changes
   - Reference any related issues
   - Add screenshots for UI changes

### Pull Request Template

```markdown
## Description

Brief description of the changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

### Review Process

1. **Automated checks**: All CI checks must pass
2. **Code review**: At least one maintainer review required
3. **Testing**: Manual testing for significant changes
4. **Documentation**: Ensure docs are updated

## Release Process

Maintainers handle releases following semantic versioning:

- **Patch** (1.0.1): Bug fixes, security updates
- **Minor** (1.1.0): New features, backwards compatible
- **Major** (2.0.0): Breaking changes

## Getting Help

- **Questions**: Open a
  [discussion](https://github.com/serkanhaslak/n8n-nodes-docuseal/discussions)
- **Bugs**: Create an
  [issue](https://github.com/serkanhaslak/n8n-nodes-docuseal/issues)
- **Chat**: Join the [n8n community](https://community.n8n.io/)

## Code of Conduct

This project follows the
[Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).
Please be respectful and inclusive in all interactions.

## License

By contributing, you agree that your contributions will be licensed under the
same license as the project (MIT License).
