# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-01-02

### Added
- Initial implementation of Gearset MCP server
- Support for Gearset Automation API integration
- Four core tools:
  - `get_ci_job_status` - Check CI job status
  - `start_ci_job` - Start a CI job
  - `get_job_run_status` - Monitor specific job runs  
  - `list_ci_jobs` - List available CI jobs (placeholder)
- TypeScript implementation following MCP specifications
- Comprehensive error handling and rate limit awareness
- Authentication via GEARSET_API_TOKEN environment variable
- Compatible with Claude Desktop and Warp MCP clients
- Full documentation and setup instructions

### Technical Details
- Built with @modelcontextprotocol/sdk v1.19.1
- Uses Zod for input validation and schema generation
- Axios HTTP client with proper error handling
- Jest testing framework setup
- TypeScript compilation to ES2022 with NodeNext modules
- Follows official MCP server patterns and structure

[Unreleased]: https://github.com/jaredbt/gearset-mcp-server/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/jaredbt/gearset-mcp-server/releases/tag/v0.1.0