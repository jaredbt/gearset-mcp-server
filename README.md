# Gearset MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io/) server that provides tools for interacting with Gearset's CI/CD automation and DevOps workflows.

## Features

This MCP server enables AI assistants to:

- **Manage CI Jobs**: Start, stop, and check the status of Gearset continuous integration jobs
- **Monitor Deployments**: Track deployment progress and results  
- **Query DevOps Metrics**: Access Gearset analytics and performance data
- **Automate Workflows**: Integrate Gearset operations into AI-driven automation

## Tools Available

### `get_ci_job_status`
Get the current status of a Gearset continuous integration job.

**Parameters:**
- `jobId` (string): The CI job ID to check status for

### `start_ci_job`
Start a Gearset continuous integration job.

**Parameters:**
- `jobId` (string): The CI job ID to start

### `get_job_run_status`
Get the status of a specific CI job run.

**Parameters:**
- `jobId` (string): The CI job ID
- `runRequestId` (string): The run request ID to check status for

### `list_ci_jobs`
List all available Gearset CI jobs (placeholder - requires job IDs to be configured).

**Parameters:**
- `limit` (number, optional): Maximum number of jobs to return

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

This server respects Gearset's API rate limits:

- **Automation Actions**: 100 POST requests/hour
- **Status Queries**: 5 GET requests/5 seconds  
- **General Limit**: Based on your Gearset plan

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