# Contributing to Gearset MCP Server

> **Note:** This is an unofficial, personal open-source project that is not affiliated with, endorsed by, or supported by Gearset. This project provides a third-party integration with Gearset's public APIs.

Thank you for your interest in contributing to the Gearset MCP Server! This document provides guidelines for contributing to this community project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- A Gearset account with API access
- Git

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/gearset-mcp-server.git
   cd gearset-mcp-server
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Build the project:

   ```bash
   npm run build
   ```

5. Run tests:
   ```bash
   npm test
   ```

## How to Contribute

### Reporting Bugs

1. Check if the issue already exists in [GitHub Issues](https://github.com/jaredbt/gearset-mcp-server/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce the problem
   - Expected vs actual behavior
   - Environment details (Node.js version, OS, etc.)
   - Error messages or logs if applicable

### Suggesting Features

1. Check existing issues for similar feature requests
2. Create a new issue labeled "enhancement" with:
   - Clear description of the proposed feature
   - Use case and why it would be valuable
   - Possible implementation approach (if you have ideas)

### Submitting Changes

1. Create a feature branch from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our coding standards:
   - Follow TypeScript best practices
   - Add JSDoc comments for public APIs
   - Include tests for new functionality
   - Update documentation as needed

3. Test your changes:

   ```bash
   npm run build
   npm test
   npm run lint
   ```

4. Commit your changes with clear, descriptive messages:

   ```bash
   git commit -m "feat: add support for Gearset deployment monitoring"
   ```

5. Push to your fork and create a Pull Request:
   ```bash
   git push origin feature/your-feature-name
   ```

### Pull Request Guidelines

- **Title**: Use conventional commit format (`feat:`, `fix:`, `docs:`, etc.)
- **Description**:
  - Explain what changes you made and why
  - Reference any related issues (#123)
  - Include screenshots for UI changes
- **Testing**: Ensure all tests pass
- **Documentation**: Update README.md if needed
- **Breaking Changes**: Clearly document any breaking changes

## Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Prefer interfaces over types where appropriate
- Use proper error handling with typed exceptions
- Follow established patterns in the codebase

### API Design

- Follow MCP protocol specifications
- Use Zod schemas for input validation
- Provide clear error messages
- Respect Gearset API rate limits

### Testing

- Write tests for all new functionality
- Use descriptive test names
- Mock external API calls appropriately
- Aim for good test coverage

### Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for complex functions
- Update CHANGELOG.md following Keep a Changelog format

## Development Scripts

- `npm run build` - Build TypeScript to JavaScript
- `npm run dev` - Run in development mode with tsx
- `npm test` - Run Jest tests with coverage
- `npm run lint` - Run ESLint (now using flat config)
- `npm run format` - Format code with Prettier

## Code Quality Standards

This project maintains high code quality standards:

- **Zero Lint Warnings**: All ESLint warnings must be resolved
- **Full Type Safety**: No `any` types allowed - use specific interfaces and unions
- **Test Coverage**: All tests must pass with maintained coverage
- **Modern Tooling**: Uses ESLint v9 flat config and modern Jest configuration

Before submitting a PR, ensure:

```bash
npm run lint    # Should show zero warnings
npm test        # All tests must pass
npm run build   # Must compile without errors
```

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md with new version
3. Create a pull request with version bump
4. After merge, tag the release:
   ```bash
   git tag v0.2.0
   git push origin v0.2.0
   ```

## Questions?

If you have questions about contributing, feel free to:

- Open a GitHub Discussion
- Create an issue with the "question" label
- Reach out to the maintainers

Thank you for contributing to making Gearset integration better for everyone!
