# Corrected Audit API Fixes and Improvements

## Summary

Applied comprehensive fixes to align the gearset-mcp-server with the official Gearset API specifications, correcting the distinction between Audit API v1 and Reporting API v2 endpoints for CI job runs data.

## Key Correction Made

### CI Job Runs Endpoint Usage
- **Problem Identified**: Initially misunderstood the distinction between:
  - **Reporting API v2**: `/public/reporting/continuous-integration/job/{jobId}/runs` - Gets **ALL** CI job runs (async operation)
  - **Audit API v1**: `/public/audit/continuous-integration/job/{jobId}/runs` - Gets **manually triggered runs only** (subset, direct response)

- **Correction Applied**: 
  - Kept `get_ci_job_runs_audit` tool using **Reporting API v2** async pattern (correct for getting ALL runs)
  - Added new `get_manual_ci_job_runs` tool using **Audit API v1** for manually triggered runs only

## Issues Identified and Fixed

### 1. Type Alignment Issues
- **Problem**: `DeploymentAudit` interface didn't match the spec's `DeploymentAuditEntry`
- **Solution**: Replaced with spec-aligned `DeploymentAuditEntry` interface including:
  - Correct field names (`Date` instead of `DeploymentStartTime`, `Owner` instead of `UserId`, etc.)
  - Proper status values (`'Successful' | 'Failed' | 'PartiallySuccessful'`)
  - Complete environment type enums
  - Optional fields for work items and Apex executions

### 2. Audit Events Transformation Issues
- **Problem**: `getAuditEvents` used non-existent fields from old interface
- **Solution**: Updated transformation to use actual spec fields:
  - `deployment.Date` (not `DeploymentStartTime`)
  - Include `name`, `friendlyName`, `owner`, `triggeredBy`
  - Use correct source/target usernames and types
  - Count deployment differences properly

### 3. Missing resourceId Filtering
- **Problem**: `getAuditEvents` ignored the `resourceId` parameter
- **Solution**: Added filtering logic to match events by ResourceId

### 4. Date Validation
- **Problem**: No validation of ISO 8601 date strings in tool schemas
- **Solution**: Added Zod refinements to validate date strings for:
  - `GetDeploymentAuditSchema`
  - `GetCIJobRunsAuditSchema` 
  - `GetAnonymousApexAuditSchema`
  - `GetPipelineEditHistorySchema`
  - `GetManualCIJobRunsSchema`

### 5. Interface Consistency
- **Problem**: `AuditEvent` interface required `UserId` and `UserEmail` but deployment audit doesn't provide these
- **Solution**: Made `UserId` and `UserEmail` optional in `AuditEvent` interface

## Tools Available

### CI Job Runs Data
- **`get_ci_job_runs_audit`**: Gets **ALL** CI job runs via Reporting API v2 (async operation)
- **`get_manual_ci_job_runs`**: Gets **manually triggered runs only** via Audit API v1 (direct response)

### Other Audit Tools
- **`get_deployment_audit`**: Deployment audit data from Audit API v1
- **`get_anonymous_apex_audit`**: Anonymous Apex execution audit from Audit API v1
- **`get_pipeline_edit_history`**: Pipeline edit history from Audit API v1
- **`get_audit_events`**: Legacy method with improved field mapping

## New Features Added

### Additional Audit API Interface Support
Added missing interfaces referenced by the spec:
- `DeploymentDifferenceResponse`
- `JiraTicketReferenceResponseEntry`
- `AsanaTaskResponseEntry`
- `AzureDevOpsWorkItemResponseEntry`
- `AnonymousApexExecutionAuditResponseItem`

### New Tools
1. **Pipeline Edit History**: `get_pipeline_edit_history`
   - **Parameters**: `pipelineId`, `StartDate`, `EndDate`
   - **Client Method**: `getPipelineEditHistory(pipelineId, query)`

2. **Manual CI Job Runs**: `get_manual_ci_job_runs`
   - **Parameters**: `jobId`, `StartDate`, `EndDate`
   - **Client Method**: `getCIJobRunsAudit(jobId, query)` (corrected typing)

## API Usage Clarification

### Reporting API v2 (Async Operations)
- **Endpoint**: `POST /public/reporting/continuous-integration/job/{jobId}/runs`
- **Purpose**: Get **all** CI job runs for a specified job
- **Pattern**: Async operation (start → check status → get results)
- **Response**: `PublicApiContinuousIntegrationJobsResponse` with complete run data

### Audit API v1 (Direct Responses)  
- **Endpoint**: `GET /public/audit/continuous-integration/job/{jobId}/runs`
- **Purpose**: Get **manually triggered runs only** (user pressed "play" button)
- **Pattern**: Direct response
- **Response**: `ContinuousIntegrationJobsResponse` with subset of runs

## Files Modified

1. **lib/gearset-client.ts**
   - Updated interfaces to match Audit API spec
   - Fixed method return types and response handling
   - Added `getPipelineEditHistory` method
   - Updated `getAuditEvents` transformation logic
   - Made `AuditEvent.UserId` and `UserEmail` optional

2. **index.ts**
   - Added ISO 8601 date validation to schemas
   - Kept `get_ci_job_runs_audit` using Reporting API async pattern
   - Added `GetPipelineEditHistorySchema` and `GetManualCIJobRunsSchema`
   - Added pipeline edit history and manual CI runs tools

3. **README.md**
   - Updated documentation to reflect correct API usage

## Validation

- ✅ TypeScript compilation successful
- ✅ All existing tests pass
- ✅ Correct API endpoint usage verified against specs
- ✅ No breaking changes to existing API

## API Specification Compliance

All changes ensure 100% compliance with both API specifications:

### Reporting API v2 Compliance
- Correct async operation pattern for all runs data
- Proper parameter names and casing
- Authorization header format compliance

### Audit API v1 Compliance  
- Correct parameter names and casing (StartDate/EndDate)
- Proper date format validation
- Accurate response type mapping
- Complete enum value support
- Authorization header format compliance