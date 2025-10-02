/**
 * Gearset API Client
 * 
 * A TypeScript client for interacting with Gearset's Automation API.
 * Implements rate limiting, error handling, and proper authentication.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

// API Response types based on Gearset documentation
export interface CIJobStatus {
  State: 'Idle' | 'Running' | 'Queued';
}

export interface StartCIJobResponse {
  RunRequestId: string;
}

export interface JobRunStatus {
  State: 'Queued' | 'Running' | 'Succeeded' | 'Failed' | 'Cancelled';
  RunId?: string;
  StartDateTime?: string;
  EndDateTime?: string;
  ErrorMessage?: string;
}

export interface CIJob {
  Id: string;
  Name: string;
  Description?: string;
  State?: string;
  LastRunDateTime?: string;
  SourceOrg?: string;
  TargetOrg?: string;
}

export class GearsetClient {
  private client: AxiosInstance;
  private baseURL = 'https://api.gearset.com/public/automation';
  
  constructor(private apiToken: string) {
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `token ${apiToken}`,
        'Content-Type': 'application/json',
        'api-version': '1', // Use version 1 as default
      },
      timeout: 30000, // 30 second timeout
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          throw new Error('Invalid Gearset API token. Please check your GEARSET_API_TOKEN.');
        }
        if (error.response?.status === 429) {
          throw new Error('Gearset API rate limit exceeded. Please wait before retrying.');
        }
        if (error.response?.status === 404) {
          throw new Error('Resource not found. Please check the job ID or endpoint.');
        }
        
        // Re-throw with more context
        const message = (error.response?.data as any)?.message || error.message;
        throw new Error(`Gearset API error (${error.response?.status || 'unknown'}): ${message}`);
      }
    );
  }

  /**
   * Get the current status of a CI job
   */
  async getCIJobStatus(jobId: string): Promise<CIJobStatus> {
    try {
      const response = await this.client.get<CIJobStatus>(
        `/continuous-integration-jobs/${jobId}/status`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get CI job status: ${error}`);
    }
  }

  /**
   * Start a CI job
   */
  async startCIJob(jobId: string): Promise<StartCIJobResponse> {
    try {
      const response = await this.client.post<StartCIJobResponse>(
        `/continuous-integration-jobs/${jobId}/run-requests`,
        {} // Empty body as per API docs
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to start CI job: ${error}`);
    }
  }

  /**
   * Get the status of a specific job run
   */
  async getJobRunStatus(jobId: string, runRequestId: string): Promise<JobRunStatus> {
    try {
      const response = await this.client.get<JobRunStatus>(
        `/continuous-integration-jobs/${jobId}/run-requests/${runRequestId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get job run status: ${error}`);
    }
  }

  /**
   * List all CI jobs (this would need to be implemented if Gearset provides such an endpoint)
   * Note: This is a placeholder - Gearset may not have a public endpoint for listing all jobs
   */
  async listCIJobs(limit?: number): Promise<CIJob[]> {
    try {
      // This is a placeholder implementation
      // In reality, you might need to maintain a list of job IDs
      // or Gearset might provide a different endpoint
      throw new Error('List CI jobs endpoint not yet implemented - please provide specific job IDs');
    } catch (error) {
      throw new Error(`Failed to list CI jobs: ${error}`);
    }
  }

  /**
   * Health check - verify the API token works
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Try to access a simple endpoint to verify authentication
      // This might need to be adjusted based on available endpoints
      const response = await this.client.get('/health', {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      console.warn('Gearset API health check failed:', error);
      return false;
    }
  }
}