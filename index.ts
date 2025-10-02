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
server.onerror = (error) => {
  console.error('[MCP Error]', error);
};

process.on('SIGINT', async () => {
  await server.close();
  process.exit(0);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Gearset MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});