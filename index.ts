#!/usr/bin/env node

/**
 * Gearset MCP Server
 * 
 * A Model Context Protocol server that provides tools for interacting with
 * Gearset's CI/CD automation and DevOps workflows.
 * 
 * This server implements the MCP specification to enable AI assistants to:
 * - Manage Gearset CI jobs (start, stop, check status)
 * - Monitor deployments and pipelines
 * - Query DevOps metrics and analytics
 * - Interact with Gearset automation workflows
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { GearsetClient } from './lib/gearset-client.js';

// Environment configuration
const GEARSET_API_TOKEN = process.env.GEARSET_API_TOKEN;

if (!GEARSET_API_TOKEN) {
  console.error('Error: GEARSET_API_TOKEN environment variable is required');
  process.exit(1);
}

// Initialize Gearset client
const gearsetClient = new GearsetClient(GEARSET_API_TOKEN);

// Server configuration
const server = new Server(
  {
    name: 'gearset-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool schemas using Zod
const GetCIJobStatusSchema = z.object({
  jobId: z.string().describe('The CI job ID to check status for'),
});

const StartCIJobSchema = z.object({
  jobId: z.string().describe('The CI job ID to start'),
});

const GetJobRunStatusSchema = z.object({
  jobId: z.string().describe('The CI job ID'),
  runRequestId: z.string().describe('The run request ID to check status for'),
});

const ListCIJobsSchema = z.object({
  limit: z.number().optional().describe('Maximum number of jobs to return'),
});

const GetDeploymentFrequencySchema = z.object({
  PipelineId: z.string().optional().describe('The pipeline ID to get deployment frequency for'),
  StartDate: z.string().describe('Start date in UTC format (e.g., 2024-01-01T00:00:00Z)'),
  EndDate: z.string().describe('End date in UTC format (e.g., 2024-01-31T23:59:59Z)'),
  aggregate: z.boolean().optional().describe('Whether to return aggregate metrics instead of raw data'),
  Interval: z.enum(['Daily', 'Weekly', 'Monthly']).optional().describe('Time interval for aggregation (required if aggregate=true)'),
  GroupBy: z.enum(['TotalDeploymentCount', 'Status', 'Owner', 'SourceUsername', 'TargetUsername', 'DeploymentType']).optional().describe('Property to group by (required if aggregate=true)'),
});

const GetLeadTimeForChangesSchema = z.object({
  pipelineId: z.string().describe('The pipeline ID to get lead time data for (required - passed as path parameter)'),
  StartDate: z.string().describe('Start date in UTC format (e.g., 2024-01-01T00:00:00Z)'),
  EndDate: z.string().describe('End date in UTC format (e.g., 2024-01-31T23:59:59Z)'),
  aggregate: z.boolean().optional().describe('Whether to return aggregate metrics instead of raw data'),
  Interval: z.enum(['Daily', 'Weekly', 'Monthly']).optional().describe('Time interval for aggregation (required if aggregate=true)'),
  Exclude: z.array(z.enum(['PullRequestLinkedTickets', 'PullRequestDescription', 'PullRequestAuthorInformation'])).optional().describe('Fields to exclude from response'),
});

const GetChangeFailureRateSchema = z.object({
  environmentId: z.string().describe('The environment ID to get change failure rate for (required - passed as path parameter)'),
  StartDate: z.string().describe('Start date in UTC format (e.g., 2024-01-01T00:00:00Z)'),
  EndDate: z.string().describe('End date in UTC format (e.g., 2024-01-31T23:59:59Z)'),
  aggregate: z.boolean().optional().describe('Whether to return aggregate metrics instead of raw data'),
  Interval: z.enum(['Daily', 'Weekly', 'Monthly']).optional().describe('Time interval for aggregation (required if aggregate=true)'),
});

const GetTimeToRestoreSchema = z.object({
  environmentId: z.string().describe('The environment ID to get time to restore data for (required - passed as path parameter)'),
  StartDate: z.string().describe('Start date in UTC format (e.g., 2024-01-01T00:00:00Z)'),
  EndDate: z.string().describe('End date in UTC format (e.g., 2024-01-31T23:59:59Z)'),
  aggregate: z.boolean().optional().describe('Whether to return aggregate metrics instead of raw data'),
  Interval: z.enum(['Daily', 'Weekly', 'Monthly']).optional().describe('Time interval for aggregation (required if aggregate=true)'),
});

const GetDeploymentAuditSchema = z.object({
  StartDate: z.string().refine((date) => {
    return !isNaN(Date.parse(date));
  }, { message: 'StartDate must be a valid ISO 8601 date string' }).describe('Start date/time in UTC format (e.g., 2024-01-01T00:00:00Z)'),
  EndDate: z.string().refine((date) => {
    return !isNaN(Date.parse(date));
  }, { message: 'EndDate must be a valid ISO 8601 date string' }).describe('End date/time in UTC format (e.g., 2024-01-31T23:59:59Z)'),
  OptionalParameters: z.array(z.enum(['JiraTickets', 'AsanaTasks', 'AzureDevOpsWorkItems', 'AnonymousApexExecutions'])).optional().describe('Optional data to include in response'),
});

const GetCIJobRunsAuditSchema = z.object({
  jobId: z.string().describe('The CI job ID to get runs for'),
  StartDate: z.string().refine((date) => {
    return !isNaN(Date.parse(date));
  }, { message: 'StartDate must be a valid ISO 8601 date string' }).describe('Start date/time in UTC format (e.g., 2024-01-01T00:00:00Z)'),
  EndDate: z.string().refine((date) => {
    return !isNaN(Date.parse(date));
  }, { message: 'EndDate must be a valid ISO 8601 date string' }).describe('End date/time in UTC format (e.g., 2024-01-31T23:59:59Z)'),
});

const GetAnonymousApexAuditSchema = z.object({
  StartDate: z.string().refine((date) => {
    return !isNaN(Date.parse(date));
  }, { message: 'StartDate must be a valid ISO 8601 date string' }).describe('Start date/time in UTC format (e.g., 2024-01-01T00:00:00Z)'),
  EndDate: z.string().refine((date) => {
    return !isNaN(Date.parse(date));
  }, { message: 'EndDate must be a valid ISO 8601 date string' }).describe('End date/time in UTC format (e.g., 2024-01-31T23:59:59Z)'),
  OrgUsername: z.string().optional().describe('The Salesforce org username to filter by'),
  Username: z.string().optional().describe('The Gearset username to filter by'),
});

const GetAuditEventsSchema = z.object({
  resourceId: z.string().optional().describe('The resource ID to get audit events for (e.g., job ID)'),
  limit: z.number().optional().describe('Maximum number of events to return'),
});

const GetOperationStatusSchema = z.object({
  operationId: z.string().describe('The operation ID to check status for'),
});

const GetOperationResultSchema = z.object({
  operationId: z.string().describe('The operation ID to get results for'),
});

const CancelCIJobSchema = z.object({
  jobId: z.string().describe('The CI job ID to cancel'),
});

const GetUnitTestJobStatusSchema = z.object({
  jobId: z.string().describe('The unit testing job ID to check status for'),
});

const StartUnitTestJobSchema = z.object({
  jobId: z.string().describe('The unit testing job ID to start'),
});

const GetUnitTestJobRunStatusSchema = z.object({
  jobId: z.string().describe('The unit testing job ID'),
  runRequestId: z.string().describe('The run request ID to check status for'),
});

const CancelUnitTestJobSchema = z.object({
  jobId: z.string().describe('The unit testing job ID to cancel'),
});

const CreateExternalTestRunSchema = z.object({
  ciRunId: z.string().describe('The CI job run ID'),
  provider: z.string().describe('The provider (software/system/product) of the external testing data'),
  statusClass: z.enum(['Succeeded', 'Failed', 'Warning', 'InProgress', 'Scheduled', 'NotRun']).describe('The status class of the test run'),
  providerRunId: z.string().optional().describe('An optional ID to identify the test run in the provider'),
  resultsUrl: z.string().optional().describe('An optional link to the external test run results'),
  status: z.string().optional().describe('An optional status from the provider'),
  statusMessage: z.string().optional().describe('An optional message providing additional information'),
  startTimeUtc: z.string().optional().describe('The optional UTC start time of the test run'),
  endTimeUtc: z.string().optional().describe('The optional UTC end time of the test run'),
});

const UpdateExternalTestRunSchema = z.object({
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
});

const GetPipelineEditHistorySchema = z.object({
  pipelineId: z.string().describe('The pipeline ID to get edit history for'),
  StartDate: z.string().refine((date) => {
    return !isNaN(Date.parse(date));
  }, { message: 'StartDate must be a valid ISO 8601 date string' }).describe('Start date/time in UTC format (e.g., 2024-01-01T00:00:00Z)'),
  EndDate: z.string().refine((date) => {
    return !isNaN(Date.parse(date));
  }, { message: 'EndDate must be a valid ISO 8601 date string' }).describe('End date/time in UTC format (e.g., 2024-01-31T23:59:59Z)'),
});

const GetManualCIJobRunsSchema = z.object({
  jobId: z.string().describe('The CI job ID to get manually triggered runs for'),
  StartDate: z.string().refine((date) => {
    return !isNaN(Date.parse(date));
  }, { message: 'StartDate must be a valid ISO 8601 date string' }).describe('Start date/time in UTC format (e.g., 2024-01-01T00:00:00Z)'),
  EndDate: z.string().refine((date) => {
    return !isNaN(Date.parse(date));
  }, { message: 'EndDate must be a valid ISO 8601 date string' }).describe('End date/time in UTC format (e.g., 2024-01-31T23:59:59Z)'),
});

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_ci_job_status',
        description: 'Get the current status of a Gearset continuous integration job',
        inputSchema: zodToJsonSchema(GetCIJobStatusSchema),
      },
      {
        name: 'start_ci_job',
        description: 'Start a Gearset continuous integration job',
        inputSchema: zodToJsonSchema(StartCIJobSchema),
      },
      {
        name: 'get_job_run_status',
        description: 'Get the status of a specific CI job run',
        inputSchema: zodToJsonSchema(GetJobRunStatusSchema),
      },
      {
        name: 'list_ci_jobs',
        description: 'List all available Gearset CI jobs',
        inputSchema: zodToJsonSchema(ListCIJobsSchema),
      },
      {
        name: 'get_deployment_frequency',
        description: 'Get deployment frequency data or metrics (DORA metric) from the Reporting API',
        inputSchema: zodToJsonSchema(GetDeploymentFrequencySchema),
      },
      {
        name: 'get_lead_time_for_changes',
        description: 'Get lead time for changes data or metrics (DORA metric) from the Reporting API',
        inputSchema: zodToJsonSchema(GetLeadTimeForChangesSchema),
      },
      {
        name: 'get_change_failure_rate',
        description: 'Get change failure rate data (DORA metric) from the Reporting API',
        inputSchema: zodToJsonSchema(GetChangeFailureRateSchema),
      },
      {
        name: 'get_time_to_restore',
        description: 'Get time to restore data (DORA metric) from the Reporting API',
        inputSchema: zodToJsonSchema(GetTimeToRestoreSchema),
      },
      {
        name: 'get_deployment_audit',
        description: 'Get deployment audit data from the Audit API',
        inputSchema: zodToJsonSchema(GetDeploymentAuditSchema),
      },
      {
        name: 'get_all_ci_job_runs_via_reporting',
        description: 'Get ALL CI job runs data using the Reporting API (async operation) - includes manually triggered, scheduled, and webhook runs',
        inputSchema: zodToJsonSchema(GetCIJobRunsAuditSchema),
      },
      {
        name: 'get_anonymous_apex_audit',
        description: 'Get anonymous Apex execution audit data from the Audit API',
        inputSchema: zodToJsonSchema(GetAnonymousApexAuditSchema),
      },
      {
        name: 'get_audit_events',
        description: 'Get audit events for CI jobs using the Audit API (legacy method)',
        inputSchema: zodToJsonSchema(GetAuditEventsSchema),
      },
      {
        name: 'get_operation_status',
        description: 'Get the status of a reporting API operation',
        inputSchema: zodToJsonSchema(GetOperationStatusSchema),
      },
      {
        name: 'get_operation_result',
        description: 'Get the result of a completed reporting API operation',
        inputSchema: zodToJsonSchema(GetOperationResultSchema),
      },
      {
        name: 'cancel_ci_job',
        description: 'Cancel a running CI job',
        inputSchema: zodToJsonSchema(CancelCIJobSchema),
      },
      {
        name: 'get_unit_test_job_status',
        description: 'Get the current status of a unit testing job',
        inputSchema: zodToJsonSchema(GetUnitTestJobStatusSchema),
      },
      {
        name: 'start_unit_test_job',
        description: 'Start a unit testing job',
        inputSchema: zodToJsonSchema(StartUnitTestJobSchema),
      },
      {
        name: 'get_unit_test_job_run_status',
        description: 'Get the status of a specific unit test job run',
        inputSchema: zodToJsonSchema(GetUnitTestJobRunStatusSchema),
      },
      {
        name: 'cancel_unit_test_job',
        description: 'Cancel a running unit testing job',
        inputSchema: zodToJsonSchema(CancelUnitTestJobSchema),
      },
      {
        name: 'create_external_test_run',
        description: 'Create an external test run for a CI job run',
        inputSchema: zodToJsonSchema(CreateExternalTestRunSchema),
      },
      {
        name: 'update_external_test_run',
        description: 'Update an external test run for a CI job run',
        inputSchema: zodToJsonSchema(UpdateExternalTestRunSchema),
      },
      {
        name: 'get_pipeline_edit_history',
        description: 'Get edit history for a specified pipeline from the Audit API',
        inputSchema: zodToJsonSchema(GetPipelineEditHistorySchema),
      },
      {
        name: 'get_manual_ci_job_runs_via_audit',
        description: 'Get manually triggered CI job runs from the Audit API (requires Teams/Enterprise license) - only runs where user clicked "play" button',
        inputSchema: zodToJsonSchema(GetManualCIJobRunsSchema),
      },
    ],
  };
});

// Tool implementations
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_ci_job_status': {
        const { jobId } = GetCIJobStatusSchema.parse(args);
        const status = await gearsetClient.getCIJobStatus(jobId);
        
        return {
          content: [
            {
              type: 'text',
              text: `CI Job Status: ${JSON.stringify(status, null, 2)}`,
            },
          ],
        };
      }

      case 'start_ci_job': {
        const { jobId } = StartCIJobSchema.parse(args);
        const result = await gearsetClient.startCIJob(jobId);
        
        return {
          content: [
            {
              type: 'text',
              text: `CI Job Started: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'get_job_run_status': {
        const { jobId, runRequestId } = GetJobRunStatusSchema.parse(args);
        const status = await gearsetClient.getJobRunStatus(jobId, runRequestId);
        
        return {
          content: [
            {
              type: 'text',
              text: `Job Run Status: ${JSON.stringify(status, null, 2)}`,
            },
          ],
        };
      }

      case 'list_ci_jobs': {
        const { limit } = ListCIJobsSchema.parse(args);
        const jobs = await gearsetClient.listCIJobs(limit);
        
        return {
          content: [
            {
              type: 'text',
              text: `Available CI Jobs:\\n${JSON.stringify(jobs, null, 2)}`,
            },
          ],
        };
      }

      case 'get_deployment_frequency': {
        const { PipelineId, StartDate, EndDate, aggregate, Interval, GroupBy } = GetDeploymentFrequencySchema.parse(args);
        
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
              text: `Deployment Frequency Operation Started:\\nOperation ID: ${operation.OperationStatusId}\\nStatus: ${operation.Status}\\n\\nUse get_operation_status with this ID to check progress, then get_operation_result to retrieve data when completed.`,
            },
          ],
        };
      }

      case 'get_lead_time_for_changes': {
        const { pipelineId, StartDate, EndDate, aggregate, Interval, Exclude } = GetLeadTimeForChangesSchema.parse(args);
        
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
              text: `Lead Time for Changes Operation Started:\\nOperation ID: ${operation.OperationStatusId}\\nStatus: ${operation.Status}\\n\\nUse get_operation_status with this ID to check progress, then get_operation_result to retrieve data when completed.`,
            },
          ],
        };
      }

      case 'get_change_failure_rate': {
        const { environmentId, StartDate, EndDate, aggregate, Interval } = GetChangeFailureRateSchema.parse(args);
        
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
              text: `Change Failure Rate Operation Started:\\nOperation ID: ${operation.OperationStatusId}\\nStatus: ${operation.Status}\\n\\nUse get_operation_status with this ID to check progress, then get_operation_result to retrieve data when completed.`,
            },
          ],
        };
      }

      case 'get_time_to_restore': {
        const { environmentId, StartDate, EndDate, aggregate, Interval } = GetTimeToRestoreSchema.parse(args);
        
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
              text: `Time to Restore Operation Started:\\nOperation ID: ${operation.OperationStatusId}\\nStatus: ${operation.Status}\\n\\nUse get_operation_status with this ID to check progress, then get_operation_result to retrieve data when completed.`,
            },
          ],
        };
      }

      case 'get_deployment_audit': {
        const { StartDate, EndDate, OptionalParameters } = GetDeploymentAuditSchema.parse(args);
        const query = { StartDate, EndDate, OptionalParameters };
        const deployments = await gearsetClient.getDeploymentAudit(query);
        
        return {
          content: [
            {
              type: 'text',
              text: `Deployment Audit Data:\\n${JSON.stringify(deployments, null, 2)}`,
            },
          ],
        };
      }

      case 'get_all_ci_job_runs_via_reporting': {
        // REPORTING API: Get ALL runs (manual + automatic) via async operation
        const { jobId, StartDate, EndDate } = GetCIJobRunsAuditSchema.parse(args);
        const query = { StartDate, EndDate };
        const operation = await gearsetClient.startCIJobRunsReportingOperation(jobId, query);
        
        return {
          content: [
            {
              type: 'text',
              text: `CI Job Runs Operation Started (Reporting API - ALL runs):\\nOperation ID: ${operation.OperationStatusId}\\nStatus: ${operation.Status}\\n\\nUse get_operation_status with this ID to check progress, then get_operation_result to retrieve data when completed.`,
            },
          ],
        };
      }

      case 'get_anonymous_apex_audit': {
        const { StartDate, EndDate, OrgUsername, Username } = GetAnonymousApexAuditSchema.parse(args);
        const query = { StartDate, EndDate, OrgUsername, Username };
        const executions = await gearsetClient.getAnonymousApexAudit(query);
        
        return {
          content: [
            {
              type: 'text',
              text: `Anonymous Apex Audit Data:\\n${JSON.stringify(executions, null, 2)}`,
            },
          ],
        };
      }

      case 'get_audit_events': {
        const { resourceId, limit } = GetAuditEventsSchema.parse(args);
        const events = await gearsetClient.getAuditEvents(resourceId, limit);
        
        return {
          content: [
            {
              type: 'text',
              text: `Audit Events:\\n${JSON.stringify(events, null, 2)}`,
            },
          ],
        };
      }

      case 'get_operation_status': {
        const { operationId } = GetOperationStatusSchema.parse(args);
        const status = await gearsetClient.getOperationStatus(operationId);
        
        return {
          content: [
            {
              type: 'text',
              text: `Operation Status:\\n${JSON.stringify(status, null, 2)}`,
            },
          ],
        };
      }

      case 'get_operation_result': {
        const { operationId } = GetOperationResultSchema.parse(args);
        const result = await gearsetClient.getOperationResult(operationId);
        
        return {
          content: [
            {
              type: 'text',
              text: `Operation Result:\\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'cancel_ci_job': {
        const { jobId } = CancelCIJobSchema.parse(args);
        await gearsetClient.cancelCIJob(jobId);
        
        return {
          content: [
            {
              type: 'text',
              text: `CI Job ${jobId} cancellation requested successfully.`,
            },
          ],
        };
      }

      case 'get_unit_test_job_status': {
        const { jobId } = GetUnitTestJobStatusSchema.parse(args);
        const status = await gearsetClient.getUnitTestJobStatus(jobId);
        
        return {
          content: [
            {
              type: 'text',
              text: `Unit Test Job Status: ${JSON.stringify(status, null, 2)}`,
            },
          ],
        };
      }

      case 'start_unit_test_job': {
        const { jobId } = StartUnitTestJobSchema.parse(args);
        const result = await gearsetClient.startUnitTestJob(jobId);
        
        return {
          content: [
            {
              type: 'text',
              text: `Unit Test Job Started: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'get_unit_test_job_run_status': {
        const { jobId, runRequestId } = GetUnitTestJobRunStatusSchema.parse(args);
        const status = await gearsetClient.getUnitTestJobRunStatus(jobId, runRequestId);
        
        return {
          content: [
            {
              type: 'text',
              text: `Unit Test Job Run Status: ${JSON.stringify(status, null, 2)}`,
            },
          ],
        };
      }

      case 'cancel_unit_test_job': {
        const { jobId } = CancelUnitTestJobSchema.parse(args);
        const result = await gearsetClient.cancelUnitTestJob(jobId);
        
        return {
          content: [
            {
              type: 'text',
              text: `Unit Test Job Cancelled: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'create_external_test_run': {
        const { ciRunId, provider, statusClass, providerRunId, resultsUrl, status, statusMessage, startTimeUtc, endTimeUtc } = CreateExternalTestRunSchema.parse(args);
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
      }

      case 'update_external_test_run': {
        const { ciRunId, externalTestRunId, provider, statusClass, providerRunId, resultsUrl, status, statusMessage, startTimeUtc, endTimeUtc } = UpdateExternalTestRunSchema.parse(args);
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
      }

      case 'get_pipeline_edit_history': {
        const { pipelineId, StartDate, EndDate } = GetPipelineEditHistorySchema.parse(args);
        const query = { StartDate, EndDate };
        const history = await gearsetClient.getPipelineEditHistory(pipelineId, query);
        
        return {
          content: [
            {
              type: 'text',
              text: `Pipeline Edit History:\\n${JSON.stringify(history, null, 2)}`,
            },
          ],
        };
      }

      case 'get_manual_ci_job_runs_via_audit': {
        // AUDIT API: Get only MANUALLY TRIGGERED runs (requires Teams/Enterprise license)
        const { jobId, StartDate, EndDate } = GetManualCIJobRunsSchema.parse(args);
        const query = { StartDate, EndDate };
        const runs = await gearsetClient.getCIJobRunsAudit(jobId, query);
        
        return {
          content: [
            {
              type: 'text',
              text: `Manual CI Job Runs (Audit API - manual runs only):\\n${JSON.stringify(runs, null, 2)}`,
            },
          ],
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid parameters: ${error.message}`
      );
    }
    
    throw error;
  }
});

// Error handling
server.onerror = (error): void => {
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
  console.error('Gearset MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});