# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-01-02

### 🎉 Major Release: Full API Specification Compliance

This release brings **complete compliance** with the official Gearset Automation API v1 and Reporting API v2 specifications, making this the first production-ready version of the Gearset MCP server.

### ✨ New Features

#### Reporting API v2 Support
- **Async Operation Pattern**: All reporting operations now follow the official async pattern with operation IDs
- **DORA Metrics**: Full support for deployment frequency, lead time, change failure rate, and time to restore
- **Enhanced Aggregation**: Support for Daily/Weekly/Monthly intervals and various grouping options
- **Operation Management**: New tools to check operation status and retrieve results

#### Extended Automation API Coverage
- **Unit Testing Jobs**: Complete support for unit testing job management
- **Job Cancellation**: Cancel running CI and unit test jobs
- **External Test Runs**: Create and update external test run data for CI jobs
- **Enhanced Status Tracking**: Improved job and run status monitoring

#### New MCP Tools (10 additional tools)
- `get_operation_status` - Check async operation status
- `get_operation_result` - Retrieve completed operation results  
- `cancel_ci_job` - Cancel running CI jobs
- `get_unit_test_job_status` - Unit test job status monitoring
- `start_unit_test_job` - Start unit testing jobs
- `get_unit_test_job_run_status` - Unit test run status tracking
- `cancel_unit_test_job` - Cancel unit testing jobs
- `create_external_test_run` - Create external test runs
- `update_external_test_run` - Update external test run data
- Enhanced `get_deployment_frequency`, `get_lead_time_for_changes`, `get_change_failure_rate`, `get_time_to_restore` with full async support

### 🔧 Breaking Changes

#### API Interface Updates
- **Parameter Casing**: Query parameters now use Pascal case (`StartDate`, `EndDate`) per official spec
- **HTTP Methods**: Reporting API endpoints now use POST requests instead of GET
- **Response Structure**: All reporting operations return operation IDs for async processing
- **Path Parameters**: Environment and pipeline IDs are now path parameters where required

#### Method Signature Changes
- `getJobRunStatus()` → `getCIJobRunStatus()` (backward compatible alias maintained)
- `getCIJobRunsAudit()` now takes `jobId` as separate parameter
- New required parameters for aggregate endpoints (`Interval`, `GroupBy`)

### 🏗️ Technical Improvements

#### Code Quality
- **100% Spec Compliance**: All interfaces match official API schemas exactly
- **Enhanced Type Safety**: Updated TypeScript interfaces with proper enums and unions
- **Better Error Handling**: Improved error messages and HTTP status code handling
- **API Versioning**: Proper versioning (Automation v1, Reporting v2, Audit v1)

#### Architecture
- **Async Operation Pattern**: Implements official Gearset async operation workflow
- **Backward Compatibility**: Legacy method names maintained with deprecation warnings
- **Comprehensive Validation**: Enhanced Zod schemas matching API specifications
- **Rate Limit Awareness**: Improved handling of Gearset API rate limits

### 📚 Documentation
- Updated README with all new tools and capabilities
- Enhanced setup instructions
- Added troubleshooting section
- Improved API usage examples

### 🧪 Testing
- All tests updated and passing
- Enhanced test coverage for new functionality
- TypeScript compilation without errors
- Backward compatibility verified

### 💡 Migration Guide

For users upgrading from v0.1.0:

1. **Reporting API Changes**: Update your code to handle async operations:
   ```javascript
   // Old way (v0.1.0)
   const data = await getDeploymentFrequency(query);
   
   // New way (v1.0.0)
   const operation = await getDeploymentFrequency(query);
   const status = await getOperationStatus(operation.OperationStatusId);
   const result = await getOperationResult(operation.OperationStatusId);
   ```

2. **Parameter Updates**: Update parameter names to Pascal case:
   ```javascript
   // Old: { startDate, endDate }
   // New: { StartDate, EndDate }
   ```

3. **Aggregate Endpoints**: Add required parameters:
   ```javascript
   // Now required for aggregates: Interval, GroupBy
   { StartDate, EndDate, aggregate: true, Interval: 'Daily', GroupBy: 'Status' }
   ```

### 🔗 API Specification Sources
- [Gearset Automation API v1](https://api.gearset.com/public/docs/automation-api-v1/api-specification.json)
- [Gearset Reporting API v2](https://api.gearset.com/public/docs/reporting-api-v2/api-specification.json) 
- [Gearset Audit API v1](https://api.gearset.com/public/docs/audit-api-v1/api-specification.json)

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

[Unreleased]: https://github.com/jaredbt/gearset-mcp-server/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/jaredbt/gearset-mcp-server/releases/tag/v1.0.0
[0.1.0]: https://github.com/jaredbt/gearset-mcp-server/releases/tag/v0.1.0
