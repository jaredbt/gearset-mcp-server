# Gearset MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io/) server that provides tools for interacting with Gearset's CI/CD automation and DevOps workflows.

## Features

This MCP server enables AI assistants to:

- **🚀 Manage CI/CD Jobs**: Start, cancel, and monitor Gearset continuous integration and unit testing jobs
- **📊 DORA Metrics**: Access comprehensive DevOps performance metrics (deployment frequency, lead time, change failure rate, time to restore)
- **🔍 Monitor Deployments**: Track deployment progress, results, and audit trails  
- **🧪 External Testing**: Integrate external test runs with CI job workflows
- **📈 Analytics & Reporting**: Query detailed deployment and performance analytics
- **⚡ Async Operations**: Handle long-running operations with proper status tracking
- **🔧 Automate Workflows**: Build AI-driven DevOps automation and monitoring

## Tools Available

### 🚀 Continuous Integration Jobs

#### `get_ci_job_status`
Get the current status of a Gearset continuous integration job.
- `jobId` (string): The CI job ID to check status for

#### `start_ci_job`
Start a Gearset continuous integration job.
- `jobId` (string): The CI job ID to start

#### `get_job_run_status` / `get_ci_job_run_status`
Get the status of a specific CI job run.
- `jobId` (string): The CI job ID
- `runRequestId` (string): The run request ID to check status for

#### `cancel_ci_job`
Cancel a running CI job.
- `jobId` (string): The CI job ID to cancel

#### `list_ci_jobs`
List all available Gearset CI jobs (placeholder - requires job IDs to be configured).
- `limit` (number, optional): Maximum number of jobs to return

### 🧪 Unit Testing Jobs

#### `get_unit_test_job_status`
Get the current status of a unit testing job.
- `jobId` (string): The unit testing job ID to check status for

#### `start_unit_test_job`
Start a unit testing job.
- `jobId` (string): The unit testing job ID to start

#### `get_unit_test_job_run_status`
Get the status of a specific unit test job run.
- `jobId` (string): The unit testing job ID
- `runRequestId` (string): The run request ID to check status for

#### `cancel_unit_test_job`
Cancel a running unit testing job.
- `jobId` (string): The unit testing job ID to cancel

### 🔬 External Test Integration

#### `create_external_test_run`
Create an external test run for a CI job run.
- `ciRunId` (string): The CI job run ID
- `provider` (string): The provider of the external testing data
- `statusClass` (enum): Status class - 'Succeeded', 'Failed', 'Warning', 'InProgress', 'Scheduled', 'NotRun'
- `providerRunId` (string, optional): ID to identify the test run in the provider
- `resultsUrl` (string, optional): Link to the external test run results
- `status` (string, optional): Status from the provider
- `statusMessage` (string, optional): Additional status information
- `startTimeUtc` (string, optional): UTC start time of the test run
- `endTimeUtc` (string, optional): UTC end time of the test run

#### `update_external_test_run`
Update an existing external test run.
- `ciRunId` (string): The CI job run ID
- `externalTestRunId` (string): The external test run ID to update
- All other parameters same as `create_external_test_run`

### 📊 DORA Metrics & Analytics

#### `get_deployment_frequency`
Get deployment frequency data (all deployments or aggregated metrics).
- `StartDate` (string): Start date in UTC format (e.g., "2024-01-01T00:00:00Z")
- `EndDate` (string): End date in UTC format
- `PipelineId` (string, optional): Filter by specific pipeline
- `aggregate` (boolean, optional): Return aggregate metrics
- `Interval` (enum, optional): 'Daily', 'Weekly', 'Monthly' (required if aggregate=true)
- `GroupBy` (enum, optional): Group by property (required if aggregate=true)

#### `get_lead_time_for_changes`
Get lead time for changes data (DORA metric).
- `pipelineId` (string): Pipeline ID (required, passed as path parameter)
- `StartDate` (string): Start date in UTC format
- `EndDate` (string): End date in UTC format
- `aggregate` (boolean, optional): Return aggregate metrics
- `Interval` (enum, optional): 'Daily', 'Weekly', 'Monthly' (required if aggregate=true)
- `Exclude` (array, optional): Fields to exclude from response

#### `get_change_failure_rate`
Get change failure rate data (DORA metric).
- `environmentId` (string): Environment ID (required, passed as path parameter)
- `StartDate` (string): Start date in UTC format
- `EndDate` (string): End date in UTC format
- `aggregate` (boolean, optional): Return aggregate metrics
- `Interval` (enum, optional): 'Daily', 'Weekly', 'Monthly' (required if aggregate=true)

#### `get_time_to_restore`
Get time to restore data (DORA metric).
- `environmentId` (string): Environment ID (required, passed as path parameter)
- `StartDate` (string): Start date in UTC format
- `EndDate` (string): End date in UTC format
- `aggregate` (boolean, optional): Return aggregate metrics
- `Interval` (enum, optional): 'Daily', 'Weekly', 'Monthly' (required if aggregate=true)

### ⚡ Async Operation Management

#### `get_operation_status`
Check the status of a long-running reporting operation.
- `operationId` (string): The operation ID to check status for

#### `get_operation_result`
Get the result of a completed reporting operation.
- `operationId` (string): The operation ID to get results for

### 📄 Audit & Compliance

#### `get_deployment_audit`
Get deployment audit data from the Audit API.
- `StartDate` (string): Start date/time in UTC format
- `EndDate` (string): End date/time in UTC format
- `OptionalParameters` (array, optional): Additional data to include

#### `get_all_ci_job_runs_via_reporting`
Get ALL CI job runs data using the Reporting API (async operation) - includes manually triggered, scheduled, and webhook runs.
- `jobId` (string): The CI job ID to get runs for
- `StartDate` (string): Start date/time in UTC format
- `EndDate` (string): End date/time in UTC format

#### `get_manual_ci_job_runs_via_audit`
Get manually triggered CI job runs from the Audit API (requires Teams/Enterprise license) - only runs where user clicked "play" button.
- `jobId` (string): The CI job ID to get manually triggered runs for
- `StartDate` (string): Start date/time in UTC format
- `EndDate` (string): End date/time in UTC format

#### `get_anonymous_apex_audit`
Get anonymous Apex execution audit data.
- `StartDate` (string): Start date/time in UTC format
- `EndDate` (string): End date/time in UTC format
- `OrgUsername` (string, optional): Salesforce org username filter
- `Username` (string, optional): Gearset username filter

#### `get_audit_events`
Get audit events (legacy method for backward compatibility).
- `resourceId` (string, optional): Resource ID filter
- `limit` (number, optional): Maximum number of events to return

## ⚡ Async Operation Pattern

The Gearset Reporting API v2 uses an asynchronous operation pattern for long-running queries. Here's how it works:

1. **Start Operation**: Call a reporting tool (e.g., `get_deployment_frequency`)
2. **Get Operation ID**: The tool returns an operation ID and status
3. **Check Status**: Use `get_operation_status` with the operation ID to monitor progress
4. **Retrieve Results**: Once status is "Succeeded", use `get_operation_result` to get data

**Example Workflow:**
```javascript
// 1. Start the operation
const operation = await get_deployment_frequency({
  StartDate: "2024-01-01T00:00:00Z",
  EndDate: "2024-01-31T23:59:59Z"
});

// 2. Check status periodically
const status = await get_operation_status({ operationId: operation.OperationStatusId });

// 3. Get results when completed
if (status.Status === "Succeeded") {
  const results = await get_operation_result({ operationId: operation.OperationStatusId });
}
```

## Setup

### Prerequisites

- Node.js 18+ 
- A Gearset account with API access
- Gearset API token

### Installation

1. Clone this repository:
```bash
git clone https://github.com/jaredbt/gearset-mcp-server.git
cd gearset-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Build the server:
```bash
npm run build
```

### Configuration

1. **Get your Gearset API Token**:
   - Log in to Gearset
   - Go to Team Management > Team Security > Access Token Management
   - Create a new API token
   - Copy the token for use in step 2

2. **Set Environment Variable**:
```bash
export GEARSET_API_TOKEN="your_gearset_api_token_here"
```

### Usage with Claude Desktop

Add this server to your Claude Desktop configuration file:

#### macOS
`~/Library/Application Support/Claude/claude_desktop_config.json`

#### Windows
`%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "gearset": {
      "command": "node",
      "args": ["/path/to/gearset-mcp-server/dist/index.js"],
      "env": {
        "GEARSET_API_TOKEN": "your_gearset_api_token_here"
      }
    }
  }
}
```

### Usage with Warp

If you're using this server with Warp (as mentioned in the development context), configure it in your Warp MCP settings following the same pattern.

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building
```bash
npm run build
```

### Running Tests
```bash
npm test
```

### Linting and Formatting
```bash
npm run lint
npm run format
```

## API Rate Limits

This server respects Gearset's API rate limits across all three APIs:

### Automation API v1
- **Job Actions**: 100 POST requests/hour (start, cancel jobs)
- **Status Queries**: 5 GET requests/5 seconds (job status, run status)
- **External Test Runs**: Limited by general API quotas

### Reporting API v2
- **Operation Start**: Standard rate limits apply for POST requests
- **Status/Result Checks**: Frequent polling allowed for monitoring
- **Large Data Sets**: Operations may take several minutes to complete

### Audit API v1
- **Data Queries**: Rate limited based on your Gearset plan
- **Date Range**: Larger date ranges may require longer processing time

**Rate Limit Best Practices:**
- Use async operation pattern for reporting queries
- Implement exponential backoff for status checks
- Cache results when appropriate
- Monitor for 429 (Too Many Requests) responses

## Troubleshooting

### Authentication Issues
- Verify your `GEARSET_API_TOKEN` is correct
- Check that your Gearset account has API access enabled
- Ensure your token hasn't expired

### Rate Limiting
- If you encounter rate limit errors, wait before retrying
- Consider implementing request queuing for high-volume usage

### Job ID Issues  
- CI job IDs can be found in the Gearset web interface
- Go to Continuous Integration > Your Job > Copy Job ID

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Related

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Gearset API Documentation](https://docs.gearset.com/en/collections/10441571-gearset-api)
- [Claude Desktop](https://claude.ai/desktop)