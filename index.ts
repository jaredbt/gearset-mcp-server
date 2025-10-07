#!/usr/bin/env node

/**
 * Gearset MCP Server v2.0
 * 
 * A Model Context Protocol server that provides tools for interacting with
 * Gearset's CI/CD automation and DevOps workflows.
 * 
 * v2.0 Changes:
 * - Migrated from lower-level Server API to higher-level McpServer API
 * - Simplified tool registration with built-in validation (no manual request handlers)
 * - Significantly reduced boilerplate code while maintaining same functionality
 * - Better type safety with automatic parameter validation
 * - Cleaner error handling and modern SDK patterns
 * - Same MCP protocol compliance and Gearset API integration as v1.x
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { GearsetClient } from './lib/gearset-client.js';

// Environment configuration
const GEARSET_API_TOKEN = process.env.GEARSET_API_TOKEN;

if (!GEARSET_API_TOKEN) {
  console.error('Error: GEARSET_API_TOKEN environment variable is required');
  process.exit(1);
}

// Initialize Gearset client (reusing proven implementation)
const gearsetClient = new GearsetClient(GEARSET_API_TOKEN);

// Create server using modern McpServer API (vs. lower-level Server API in v1.x)
const server = new McpServer({
  name: 'gearset-mcp-server',
  version: '2.0.0',
});

// =============================================================================
// CI/CD JOBS - Core continuous integration and deployment tools
// =============================================================================

server.registerTool(
  'get_ci_job_status',
  {
    title: 'Get CI Job Status',
    description: 'Get the current status of a Gearset continuous integration job',
    inputSchema: {
      jobId: z.string().describe('The CI job ID to check status for'),
    },
  },
  async ({ jobId }) => {
    try {
      const status = await gearsetClient.getCIJobStatus(jobId);
      
      return {
        content: [
          {
            type: 'text',
            text: `CI Job Status: ${JSON.stringify(status, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting CI job status: ${error.message}`,
          },
        ],
      };
    }
  }
);

server.registerTool(
  'start_ci_job',
  {
    title: 'Start CI Job',
    description: 'Start a Gearset continuous integration job',
    inputSchema: {
      jobId: z.string().describe('The CI job ID to start'),
    },
  },
  async ({ jobId }) => {
    try {
      const result = await gearsetClient.startCIJob(jobId);
      
      return {
        content: [
          {
            type: 'text',
            text: `CI Job Started: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error starting CI job: ${error.message}`,
          },
        ],
      };
    }
  }
);

server.registerTool(
  'get_job_run_status',
  {
    title: 'Get Job Run Status',
    description: 'Get the status of a specific CI job run',
    inputSchema: {
      jobId: z.string().describe('The CI job ID'),
      runRequestId: z.string().describe('The run request ID to check status for'),
    },
  },
  async ({ jobId, runRequestId }) => {
    try {
      const status = await gearsetClient.getJobRunStatus(jobId, runRequestId);
      
      return {
        content: [
          {
            type: 'text',
            text: `Job Run Status: ${JSON.stringify(status, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting job run status: ${error.message}`,
          },
        ],
      };
    }
  }
);

server.registerTool(
  'list_ci_jobs',
  {
    title: 'List CI Jobs',
    description: 'List all available Gearset CI jobs',
    inputSchema: {
      limit: z.number().optional().describe('Maximum number of jobs to return'),
    },
  },
  async ({ limit }) => {
    try {
      const jobs = await gearsetClient.listCIJobs(limit);
      
      return {
        content: [
          {
            type: 'text',
            text: `Available CI Jobs:\n${JSON.stringify(jobs, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error listing CI jobs: ${error.message}`,
          },
        ],
      };
    }
  }
);

server.registerTool(
  'cancel_ci_job',
  {
    title: 'Cancel CI Job',
    description: 'Cancel a running CI job',
    inputSchema: {
      jobId: z.string().describe('The CI job ID to cancel'),
    },
  },
  async ({ jobId }) => {
    try {
      await gearsetClient.cancelCIJob(jobId);
      
      return {
        content: [
          {
            type: 'text',
            text: `CI Job ${jobId} cancellation requested successfully.`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error cancelling CI job: ${error.message}`,
          },
        ],
      };
    }
  }
);

// =============================================================================
// DEVOPS METRICS - Key deployment and performance metrics
// =============================================================================

server.registerTool(
  'get_deployment_frequency',
  {
    title: 'Get Deployment Frequency',
    description: 'Get deployment frequency data and metrics from the Reporting API',
    inputSchema: {
      StartDate: z.string().describe('Start date in UTC format (e.g., 2024-01-01T00:00:00Z)'),
      EndDate: z.string().describe('End date in UTC format (e.g., 2024-01-31T23:59:59Z)'),
      PipelineId: z.string().optional().describe('Filter by specific pipeline'),
      aggregate: z.boolean().optional().describe('Return aggregate metrics'),
      Interval: z.enum(['Daily', 'Weekly', 'Monthly']).optional().describe('Time interval for aggregation (required if aggregate=true)'),
      GroupBy: z.enum(['TotalDeploymentCount', 'Status', 'Owner', 'SourceUsername', 'TargetUsername', 'DeploymentType']).optional().describe('Property to group by (required if aggregate=true)'),
    },
  },
  async ({ StartDate, EndDate, PipelineId, aggregate, Interval, GroupBy }) => {
    try {
      let operation;
      if (aggregate) {
        if (!Interval || !GroupBy) {
          throw new Error('Interval and GroupBy are required for aggregate deployment frequency data');
        }
        const query = { StartDate, EndDate, Interval, GroupBy, PipelineId };
        operation = await gearsetClient.startDeploymentFrequencyAggregateOperation(query);
      } else {
        const query = { StartDate, EndDate, PipelineId };
        operation = await gearsetClient.startDeploymentFrequencyOperation(query);
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `Deployment Frequency Operation Started:\nOperation ID: ${operation.OperationStatusId}\nStatus: ${operation.Status}\n\nUse get_operation_status with this ID to check progress, then get_operation_result to retrieve data when completed.`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error starting deployment frequency operation: ${error.message}`,
          },
        ],
      };
    }
  }
);

server.registerTool(
  'get_lead_time_for_changes',
  {
    title: 'Get Lead Time for Changes',
    description: 'Get lead time for changes data and metrics from the Reporting API',
    inputSchema: {
      pipelineId: z.string().describe('Pipeline ID (required, passed as path parameter)'),
      StartDate: z.string().describe('Start date in UTC format (e.g., 2024-01-01T00:00:00Z)'),
      EndDate: z.string().describe('End date in UTC format (e.g., 2024-01-31T23:59:59Z)'),
      aggregate: z.boolean().optional().describe('Return aggregate metrics'),
      Interval: z.enum(['Daily', 'Weekly', 'Monthly']).optional().describe('Time interval for aggregation (required if aggregate=true)'),
      Exclude: z.array(z.enum(['PullRequestLinkedTickets', 'PullRequestDescription', 'PullRequestAuthorInformation'])).optional().describe('Fields to exclude from response'),
    },
  },
  async ({ pipelineId, StartDate, EndDate, aggregate, Interval, Exclude }) => {
    try {
      let operation;
      if (aggregate) {
        if (!Interval) {
          throw new Error('Interval is required for aggregate lead time data');
        }
        const query = { StartDate, EndDate, Interval };
        operation = await gearsetClient.startLeadTimeForChangesAggregateOperation(pipelineId, query);
      } else {
        const query = { StartDate, EndDate, Exclude };
        operation = await gearsetClient.startLeadTimeForChangesOperation(pipelineId, query);
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `Lead Time for Changes Operation Started:\nOperation ID: ${operation.OperationStatusId}\nStatus: ${operation.Status}\n\nUse get_operation_status with this ID to check progress, then get_operation_result to retrieve data when completed.`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error starting lead time operation: ${error.message}`,
          },
        ],
      };
    }
  }
);

server.registerTool(
  'get_change_failure_rate',
  {
    title: 'Get Change Failure Rate',
    description: 'Get change failure rate data from the Reporting API',
    inputSchema: {
      environmentId: z.string().describe('Environment ID (required, passed as path parameter)'),
      StartDate: z.string().describe('Start date in UTC format (e.g., 2024-01-01T00:00:00Z)'),
      EndDate: z.string().describe('End date in UTC format (e.g., 2024-01-31T23:59:59Z)'),
      aggregate: z.boolean().optional().describe('Return aggregate metrics'),
      Interval: z.enum(['Daily', 'Weekly', 'Monthly']).optional().describe('Time interval for aggregation (required if aggregate=true)'),
    },
  },
  async ({ environmentId, StartDate, EndDate, aggregate, Interval }) => {
    try {
      let operation;
      if (aggregate) {
        if (!Interval) {
          throw new Error('Interval is required for aggregate change failure rate data');
        }
        const query = { StartDate, EndDate, Interval };
        operation = await gearsetClient.startChangeFailureRateAggregateOperation(environmentId, query);
      } else {
        const query = { StartDate, EndDate };
        operation = await gearsetClient.startChangeFailureRateOperation(environmentId, query);
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `Change Failure Rate Operation Started:\nOperation ID: ${operation.OperationStatusId}\nStatus: ${operation.Status}\n\nUse get_operation_status with this ID to check progress, then get_operation_result to retrieve data when completed.`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error starting change failure rate operation: ${error.message}`,
          },
        ],
      };
    }
  }
);

server.registerTool(
  'get_time_to_restore',
  {
    title: 'Get Time to Restore',
    description: 'Get time to restore data from the Reporting API',
    inputSchema: {
      environmentId: z.string().describe('Environment ID (required, passed as path parameter)'),
      StartDate: z.string().describe('Start date in UTC format (e.g., 2024-01-01T00:00:00Z)'),
      EndDate: z.string().describe('End date in UTC format (e.g., 2024-01-31T23:59:59Z)'),
      aggregate: z.boolean().optional().describe('Return aggregate metrics'),
      Interval: z.enum(['Daily', 'Weekly', 'Monthly']).optional().describe('Time interval for aggregation (required if aggregate=true)'),
    },
  },
  async ({ environmentId, StartDate, EndDate, aggregate, Interval }) => {
    try {
      let operation;
      if (aggregate) {
        if (!Interval) {
          throw new Error('Interval is required for aggregate time to restore data');
        }
        const query = { StartDate, EndDate, Interval };
        operation = await gearsetClient.startTimeToRestoreAggregateOperation(environmentId, query);
      } else {
        const query = { StartDate, EndDate };
        operation = await gearsetClient.startTimeToRestoreOperation(environmentId, query);
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `Time to Restore Operation Started:\nOperation ID: ${operation.OperationStatusId}\nStatus: ${operation.Status}\n\nUse get_operation_status with this ID to check progress, then get_operation_result to retrieve data when completed.`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error starting time to restore operation: ${error.message}`,
          },
        ],
      };
    }
  }
);

// =============================================================================
// OPERATION MANAGEMENT - For handling async reporting operations
// =============================================================================

server.registerTool(
  'get_operation_status',
  {
    title: 'Get Operation Status',
    description: 'Get the status of a reporting API operation',
    inputSchema: {
      operationId: z.string().describe('The operation ID to check status for'),
    },
  },
  async ({ operationId }) => {
    try {
      const status = await gearsetClient.getOperationStatus(operationId);
      
      return {
        content: [
          {
            type: 'text',
            text: `Operation Status:\n${JSON.stringify(status, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting operation status: ${error.message}`,
          },
        ],
      };
    }
  }
);

server.registerTool(
  'get_operation_result',
  {
    title: 'Get Operation Result',
    description: 'Get the result of a completed reporting API operation',
    inputSchema: {
      operationId: z.string().describe('The operation ID to get results for'),
    },
  },
  async ({ operationId }) => {
    try {
      const result = await gearsetClient.getOperationResult(operationId);
      
      return {
        content: [
          {
            type: 'text',
            text: `Operation Result:\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting operation result: ${error.message}`,
          },
        ],
      };
    }
  }
);

// =============================================================================
// AUDIT & REPORTING - Deployment and execution audit data
// =============================================================================

server.registerTool(
  'get_deployment_audit',
  {
    title: 'Get Deployment Audit',
    description: 'Get deployment audit data from the Audit API',
    inputSchema: {
      StartDate: z.string().describe('Start date/time in UTC format (e.g., 2024-01-01T00:00:00Z)'),
      EndDate: z.string().describe('End date/time in UTC format (e.g., 2024-01-31T23:59:59Z)'),
      OptionalParameters: z.array(z.enum(['JiraTickets', 'AsanaTasks', 'AzureDevOpsWorkItems', 'AnonymousApexExecutions'])).optional().describe('Additional data to include in response'),
    },
  },
  async ({ StartDate, EndDate, OptionalParameters }) => {
    try {
      const query = { StartDate, EndDate, OptionalParameters };
      const deployments = await gearsetClient.getDeploymentAudit(query);
      
      return {
        content: [
          {
            type: 'text',
            text: `Deployment Audit Data:\n${JSON.stringify(deployments, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting deployment audit data: ${error.message}`,
          },
        ],
      };
    }
  }
);

server.registerTool(
  'get_all_ci_job_runs_via_reporting',
  {
    title: 'Get All CI Job Runs (Reporting API)',
    description: 'Get ALL CI job runs data using the Reporting API (async operation) - includes manually triggered, scheduled, and webhook runs',
    inputSchema: {
      jobId: z.string().describe('The CI job ID to get runs for'),
      StartDate: z.string().describe('Start date/time in UTC format (e.g., 2024-01-01T00:00:00Z)'),
      EndDate: z.string().describe('End date/time in UTC format (e.g., 2024-01-31T23:59:59Z)'),
    },
  },
  async ({ jobId, StartDate, EndDate }) => {
    try {
      const query = { StartDate, EndDate };
      const operation = await gearsetClient.startCIJobRunsReportingOperation(jobId, query);
      
      return {
        content: [
          {
            type: 'text',
            text: `CI Job Runs Operation Started (Reporting API - ALL runs):\nOperation ID: ${operation.OperationStatusId}\nStatus: ${operation.Status}\n\nUse get_operation_status with this ID to check progress, then get_operation_result to retrieve data when completed.`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error starting CI job runs operation: ${error.message}`,
          },
        ],
      };
    }
  }
);

server.registerTool(
  'get_manual_ci_job_runs_via_audit',
  {
    title: 'Get Manual CI Job Runs (Audit API)',
    description: 'Get manually triggered CI job runs from the Audit API (requires Teams/Enterprise license) - only runs where user clicked "play" button',
    inputSchema: {
      jobId: z.string().describe('The CI job ID to get manually triggered runs for'),
      StartDate: z.string().describe('Start date/time in UTC format (e.g., 2024-01-01T00:00:00Z)'),
      EndDate: z.string().describe('End date/time in UTC format (e.g., 2024-01-31T23:59:59Z)'),
    },
  },
  async ({ jobId, StartDate, EndDate }) => {
    try {
      const query = { StartDate, EndDate };
      const runs = await gearsetClient.getCIJobRunsAudit(jobId, query);
      
      return {
        content: [
          {
            type: 'text',
            text: `Manual CI Job Runs (Audit API - manual runs only):\n${JSON.stringify(runs, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting manual CI job runs: ${error.message}`,
          },
        ],
      };
    }
  }
);

server.registerTool(
  'get_anonymous_apex_audit',
  {
    title: 'Get Anonymous Apex Audit',
    description: 'Get anonymous Apex execution audit data from the Audit API',
    inputSchema: {
      StartDate: z.string().describe('Start date/time in UTC format (e.g., 2024-01-01T00:00:00Z)'),
      EndDate: z.string().describe('End date/time in UTC format (e.g., 2024-01-31T23:59:59Z)'),
      OrgUsername: z.string().optional().describe('The Salesforce org username to filter by'),
      Username: z.string().optional().describe('The Gearset username to filter by'),
    },
  },
  async ({ StartDate, EndDate, OrgUsername, Username }) => {
    try {
      const query = { StartDate, EndDate, OrgUsername, Username };
      const executions = await gearsetClient.getAnonymousApexAudit(query);
      
      return {
        content: [
          {
            type: 'text',
            text: `Anonymous Apex Audit Data:\n${JSON.stringify(executions, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting anonymous Apex audit data: ${error.message}`,
          },
        ],
      };
    }
  }
);

server.registerTool(
  'get_pipeline_edit_history',
  {
    title: 'Get Pipeline Edit History',
    description: 'Get edit history for a specified pipeline from the Audit API',
    inputSchema: {
      pipelineId: z.string().describe('The pipeline ID to get edit history for'),
      StartDate: z.string().describe('Start date/time in UTC format (e.g., 2024-01-01T00:00:00Z)'),
      EndDate: z.string().describe('End date/time in UTC format (e.g., 2024-01-31T23:59:59Z)'),
    },
  },
  async ({ pipelineId, StartDate, EndDate }) => {
    try {
      const query = { StartDate, EndDate };
      const history = await gearsetClient.getPipelineEditHistory(pipelineId, query);
      
      return {
        content: [
          {
            type: 'text',
            text: `Pipeline Edit History:\n${JSON.stringify(history, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting pipeline edit history: ${error.message}`,
          },
        ],
      };
    }
  }
);

server.registerTool(
  'get_audit_events',
  {
    title: 'Get Audit Events',
    description: 'Get audit events for CI jobs using the Audit API (legacy method)',
    inputSchema: {
      resourceId: z.string().optional().describe('The resource ID to get audit events for (e.g., job ID)'),
      limit: z.number().optional().describe('Maximum number of events to return'),
    },
  },
  async ({ resourceId, limit }) => {
    try {
      const events = await gearsetClient.getAuditEvents(resourceId, limit);
      
      return {
        content: [
          {
            type: 'text',
            text: `Audit Events:\n${JSON.stringify(events, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting audit events: ${error.message}`,
          },
        ],
      };
    }
  }
);

// =============================================================================
// UNIT TESTING JOBS - Unit test job management
// =============================================================================

server.registerTool(
  'get_unit_test_job_status',
  {
    title: 'Get Unit Test Job Status',
    description: 'Get the current status of a unit testing job',
    inputSchema: {
      jobId: z.string().describe('The unit testing job ID to check status for'),
    },
  },
  async ({ jobId }) => {
    try {
      const status = await gearsetClient.getUnitTestJobStatus(jobId);
      
      return {
        content: [
          {
            type: 'text',
            text: `Unit Test Job Status: ${JSON.stringify(status, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting unit test job status: ${error.message}`,
          },
        ],
      };
    }
  }
);

server.registerTool(
  'start_unit_test_job',
  {
    title: 'Start Unit Test Job',
    description: 'Start a unit testing job',
    inputSchema: {
      jobId: z.string().describe('The unit testing job ID to start'),
    },
  },
  async ({ jobId }) => {
    try {
      const result = await gearsetClient.startUnitTestJob(jobId);
      
      return {
        content: [
          {
            type: 'text',
            text: `Unit Test Job Started: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error starting unit test job: ${error.message}`,
          },
        ],
      };
    }
  }
);

server.registerTool(
  'get_unit_test_job_run_status',
  {
    title: 'Get Unit Test Job Run Status',
    description: 'Get the status of a specific unit test job run',
    inputSchema: {
      jobId: z.string().describe('The unit testing job ID'),
      runRequestId: z.string().describe('The run request ID to check status for'),
    },
  },
  async ({ jobId, runRequestId }) => {
    try {
      const status = await gearsetClient.getUnitTestJobRunStatus(jobId, runRequestId);
      
      return {
        content: [
          {
            type: 'text',
            text: `Unit Test Job Run Status: ${JSON.stringify(status, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting unit test job run status: ${error.message}`,
          },
        ],
      };
    }
  }
);

server.registerTool(
  'cancel_unit_test_job',
  {
    title: 'Cancel Unit Test Job',
    description: 'Cancel a running unit testing job',
    inputSchema: {
      jobId: z.string().describe('The unit testing job ID to cancel'),
    },
  },
  async ({ jobId }) => {
    try {
      const result = await gearsetClient.cancelUnitTestJob(jobId);
      
      return {
        content: [
          {
            type: 'text',
            text: `Unit Test Job Cancelled: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error cancelling unit test job: ${error.message}`,
          },
        ],
      };
    }
  }
);

// =============================================================================
// EXTERNAL TEST INTEGRATION - External test run management
// =============================================================================

server.registerTool(
  'create_external_test_run',
  {
    title: 'Create External Test Run',
    description: 'Create an external test run for a CI job run',
    inputSchema: {
      ciRunId: z.string().describe('The CI job run ID'),
      provider: z.string().describe('The provider (software/system/product) of the external testing data'),
      statusClass: z.enum(['Succeeded', 'Failed', 'Warning', 'InProgress', 'Scheduled', 'NotRun']).describe('The status class of the test run'),
      providerRunId: z.string().optional().describe('An optional ID to identify the test run in the provider'),
      resultsUrl: z.string().optional().describe('An optional link to the external test run results'),
      status: z.string().optional().describe('An optional status from the provider'),
      statusMessage: z.string().optional().describe('An optional message providing additional information'),
      startTimeUtc: z.string().optional().describe('The optional UTC start time of the test run'),
      endTimeUtc: z.string().optional().describe('The optional UTC end time of the test run'),
    },
  },
  async ({ ciRunId, provider, statusClass, providerRunId, resultsUrl, status, statusMessage, startTimeUtc, endTimeUtc }) => {
    try {
      const data = {
        Provider: provider,
        StatusClass: statusClass,
        ProviderRunId: providerRunId,
        ResultsUrl: resultsUrl,
        Status: status,
        StatusMessage: statusMessage,
        StartTimeUtc: startTimeUtc,
        EndTimeUtc: endTimeUtc
      };
      const result = await gearsetClient.createExternalTestRun(ciRunId, data);
      
      return {
        content: [
          {
            type: 'text',
            text: `External Test Run Created: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error creating external test run: ${error.message}`,
          },
        ],
      };
    }
  }
);

server.registerTool(
  'update_external_test_run',
  {
    title: 'Update External Test Run',
    description: 'Update an external test run for a CI job run',
    inputSchema: {
      ciRunId: z.string().describe('The CI job run ID'),
      externalTestRunId: z.string().describe('The external test run ID to update'),
      provider: z.string().describe('The provider (software/system/product) of the external testing data'),
      statusClass: z.enum(['Succeeded', 'Failed', 'Warning', 'InProgress', 'Scheduled', 'NotRun']).describe('The status class of the test run'),
      providerRunId: z.string().optional().describe('An optional ID to identify the test run in the provider'),
      resultsUrl: z.string().optional().describe('An optional link to the external test run results'),
      status: z.string().optional().describe('An optional status from the provider'),
      statusMessage: z.string().optional().describe('An optional message providing additional information'),
      startTimeUtc: z.string().optional().describe('The optional UTC start time of the test run'),
      endTimeUtc: z.string().optional().describe('The optional UTC end time of the test run'),
    },
  },
  async ({ ciRunId, externalTestRunId, provider, statusClass, providerRunId, resultsUrl, status, statusMessage, startTimeUtc, endTimeUtc }) => {
    try {
      const data = {
        Provider: provider,
        StatusClass: statusClass,
        ProviderRunId: providerRunId,
        ResultsUrl: resultsUrl,
        Status: status,
        StatusMessage: statusMessage,
        StartTimeUtc: startTimeUtc,
        EndTimeUtc: endTimeUtc
      };
      await gearsetClient.updateExternalTestRun(ciRunId, externalTestRunId, data);
      
      return {
        content: [
          {
            type: 'text',
            text: `External Test Run ${externalTestRunId} updated successfully.`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error updating external test run: ${error.message}`,
          },
        ],
      };
    }
  }
);

// Error handling
server.server.onerror = (error): void => {
  console.error('[MCP Error]', error);
};

process.on('SIGINT', async () => {
  await server.close();
  process.exit(0);
});

// Start server
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Gearset MCP server v2.0 (McpServer API) running on stdio');
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});