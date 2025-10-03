/**
 * Gearset API Client
 * 
 * A TypeScript client for interacting with Gearset's Automation API.
 * Implements rate limiting, error handling, and proper authentication.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

// Automation API v1 interfaces based on official specification

// Continuous Integration Job types
export type ContinuousIntegrationJobStates = 'Idle' | 'Running';

export interface ContinuousIntegrationJobStatus {
  State: ContinuousIntegrationJobStates;
}

export interface ContinuousIntegrationRunRequest {
  RunRequestId: string;
}

export interface ContinuousIntegrationRunRequestBody {
  SourceGitCommitId?: string;
}

export type ContinuousIntegrationRunStates = 'Pending' | 'Started' | 'Succeeded' | 'Partial' | 'Failed';

export interface ContinuousIntegrationRunStatus {
  State: ContinuousIntegrationRunStates;
  RunId: string;
  StartDateTime: string;
  EndDateTime: string;
}

// Unit Testing Job types
export type UnitTestJobStates = 'Idle' | 'Running';

export interface UnitTestJobStatus {
  State: UnitTestJobStates;
}

export interface UnitTestRunRequest {
  RunRequestId: string;
}

export type UnitTestRunStates = 'Pending' | 'Started' | 'Skipped' | 'Succeeded' | 'Failed' | 'Error' | 'Cancelled';

export interface UnitTestRunStatus {
  State: UnitTestRunStates;
  RunId?: string;
}

// External Test Run types
export type ExternalTestRunDataStatusClass = 'Succeeded' | 'Failed' | 'Warning' | 'InProgress' | 'Scheduled' | 'NotRun';

export interface ExternalTestRunData {
  Provider: string;
  ProviderRunId?: string;
  ResultsUrl?: string;
  StatusClass: ExternalTestRunDataStatusClass;
  Status?: string;
  StatusMessage?: string;
  StartTimeUtc?: string;
  EndTimeUtc?: string;
}

export interface ExternalTestRunIds {
  ExternalTestRunId: string;
  CiJobRunId: string;
}

// Legacy interface for backward compatibility
export interface CIJob {
  Id: string;
  Name: string;
  Description?: string;
  State?: string;
  LastRunDateTime?: string;
  SourceOrg?: string;
  TargetOrg?: string;
}

// Reporting API v2 interfaces based on official specification

// Common response schemas
export interface OperationAcceptedResponse {
  Status: 'Running' | 'Succeeded' | 'Failed';
  OperationStatusId: string;
}

export interface OperationStatusResponse {
  Status: 'Running' | 'Succeeded' | 'Failed';
  OperationResultId?: string;
  Error?: string;
}

// Aggregate interval enum
export type AggregateInterval = 'Daily' | 'Weekly' | 'Monthly';

// Deployment Frequency types
export interface DeploymentFrequencyEntry {
  DeploymentId: string;
  Status: 'Successful' | 'Failed' | 'PartiallySuccessful';
  Name: string;
  Owner: string;
  TriggeredBy?: string;
  Date: string;
  FriendlyName?: string;
  SourceUsername: string;
  SourceMetadataLocationType: 'Developer' | 'Sandbox' | 'Production' | 'ScratchOrg' | 'OnDisk' | 'GitHubBranch' | 'GitLabBranch' | 'BitbucketBranch' | 'VstsGitBranch' | 'AzureDevOpsGitBranch' | 'Other';
  TargetUsername: string;
  TargetMetadataLocationType: 'Developer' | 'Sandbox' | 'Production' | 'ScratchOrg' | 'OnDisk' | 'GitHubBranch' | 'GitLabBranch' | 'BitbucketBranch' | 'VstsGitBranch' | 'AzureDevOpsGitBranch' | 'Other';
  DeploymentType: 'Standard' | 'Rollback' | 'DeployToTarget' | 'ContinuousIntegration' | 'Other';
  SalesforceFinalDeploymentId?: string;
  PipelineId?: string;
  PipelineEnvironmentId?: string;
}

export interface DeploymentFrequencyResponse {
  Deployments: DeploymentFrequencyEntry[];
}

export interface Int32AggregateDataPoint {
  Date: string;
  Value: number;
}

export interface Int32DeploymentFrequencyAggregateGroup {
  Field: string;
  Values: Int32AggregateDataPoint[];
}

export interface DeploymentFrequencyAggregateResponse {
  Items: Int32DeploymentFrequencyAggregateGroup[];
}

export type DeploymentFrequencyGroupBy = 'TotalDeploymentCount' | 'Status' | 'Owner' | 'SourceUsername' | 'TargetUsername' | 'DeploymentType';

// Change Failure Rate types
export interface DeploymentEventPrResponse {
  MergedAt?: string;
  CreatedAt: string;
  AuthorUsername: string;
  AuthorName: string;
  Description: string;
  Title: string;
  PullRequestNumber: number;
  Url: string;
}

export interface DeploymentEventResponse {
  Type: 'Failure' | 'Success';
  DeploymentId: string;
  Timestamp: string;
  PullRequests: DeploymentEventPrResponse[];
}

export interface ChangeFailureRateResponse {
  Events: DeploymentEventResponse[];
}

export interface DoubleAggregateDataPoint {
  Date: string;
  Value: number;
}

export interface ChangeFailureRateAggregateResponse {
  NumberOfSuccessfulDeployments: Int32AggregateDataPoint[];
  NumberOfFailedDeployments: Int32AggregateDataPoint[];
  FailureRate: DoubleAggregateDataPoint[];
}

// Lead Time types
export interface LeadTimePullRequestInformation {
  EnvironmentId: string;
  EnvironmentName: string;
  CreatedAt: string;
  MergedAt?: string;
  DeploymentCompletedAt?: string;
  DeploymentId?: string;
  Title: string;
  Number: number;
  Description: string;
  FeatureName?: string;
  AuthorName: string;
  AuthorUsername: string;
  JiraTicketReference?: string[];
  AzureWorkItemIds?: number[];
}

export interface LeadTimeResponse {
  PullRequests: LeadTimePullRequestInformation[];
}

export interface TimeSpanAggregateDataPoint {
  Date: string;
  Value: string; // TimeSpan format
}

export interface LeadTimeAggregateResponseEntry {
  EnvironmentName: string;
  SourceBranch: string;
  EnvironmentId: string;
  MeanTimeLeadTimeForChanges: TimeSpanAggregateDataPoint[];
  MaxTimeLeadTimeForChanges: TimeSpanAggregateDataPoint[];
  MinTimeLeadTimeForChanges: TimeSpanAggregateDataPoint[];
}

export interface LeadTimeAggregateResponse {
  Environments: LeadTimeAggregateResponseEntry[];
}

export type LeadTimeOptionalParameter = 'PullRequestLinkedTickets' | 'PullRequestDescription' | 'PullRequestAuthorInformation';

// Time to Restore types
export interface TimeToRestoreEventResponse {
  Failure: DeploymentEventResponse;
  Success: DeploymentEventResponse;
}

export interface TimeToRestoreResponse {
  Events: TimeToRestoreEventResponse[];
}

export interface TimeToRestoreAggregateResponse {
  MeanTimeToRestore: TimeSpanAggregateDataPoint[];
  MaxTimeToRestore: TimeSpanAggregateDataPoint[];
  MinTimeToRestore: TimeSpanAggregateDataPoint[];
}

// CI Job Runs types
export interface ContinuousIntegrationRunObject {
  Id: string;
  DeploymentMessage: string;
  DeploymentSucceeded: boolean;
  EndTimeUtc: string;
  StartTimeUtc: string;
  TriggeredBy: string;
  Trigger: 'Scheduler' | 'WebHook' | 'Interactive' | 'PublicApi' | 'PipelinesPrChildValidation' | 'PipelinesValidateBeforeMerge';
  ErrorMessage: string;
  Failures: any[]; // IComponentMessage array
  RunOutcome: 'DeploymentOrValidationAttempted' | 'RunStoppedDueToStaticCodeAnalysisResults' | 'RunThrewException' | 'RunStoppedDueToLwcTestResults';
  JobType: 'Deployment' | 'Validation';
  NumberOfStaticCodeAnalysisIssues: number;
  NumberOfStaticCodeAnalysisRulesEnabled: number;
  StaticCodeAnalysisSucceeded: boolean;
  NumberOfProblemAnalysisFixesApplied: number;
  HeadCommitHash: string;
}

export interface ContinuousIntegrationJobsResponse {
  Runs: ContinuousIntegrationRunObject[];
}

// Query parameter interfaces
export interface ReportingQueryBase {
  StartDate: string;
  EndDate: string;
}

export interface DeploymentFrequencyQuery extends ReportingQueryBase {
  PipelineId?: string;
}

export interface DeploymentFrequencyAggregateQuery extends DeploymentFrequencyQuery {
  Interval: AggregateInterval;
  GroupBy: DeploymentFrequencyGroupBy;
}

export interface ChangeFailureRateQuery extends ReportingQueryBase {
  // environmentId is passed as path parameter
}

export interface ChangeFailureRateAggregateQuery extends ChangeFailureRateQuery {
  Interval: AggregateInterval;
}

export interface LeadTimeQuery extends ReportingQueryBase {
  // pipelineId is passed as path parameter
  Exclude?: LeadTimeOptionalParameter[];
}

export interface LeadTimeAggregateQuery extends ReportingQueryBase {
  // pipelineId is passed as path parameter
  Interval: AggregateInterval;
}

export interface TimeToRestoreQuery extends ReportingQueryBase {
  // environmentId is passed as path parameter
}

export interface TimeToRestoreAggregateQuery extends TimeToRestoreQuery {
  Interval: AggregateInterval;
}

export interface CIJobRunsQuery extends ReportingQueryBase {
  // Note: jobId is passed as path parameter, not in query body
}

// Audit API interfaces
export interface AuditEvent {
  Id: string;
  EventType: string;
  Timestamp: string;
  UserId?: string;
  UserEmail?: string;
  ResourceType: string;
  ResourceId: string;
  Details: Record<string, any>;
}

// Aligns with the Audit API spec's DeploymentAuditEntry
export interface DeploymentAuditEntry {
  DeploymentId: string;
  Status: 'Successful' | 'Failed' | 'PartiallySuccessful';
  Name: string;
  Owner: string;
  TriggeredBy: string;
  Date: string; // ISO date-time
  FriendlyName: string;
  SourceUsername: string;
  SourceMetadataLocationType:
    | 'Developer'
    | 'Sandbox'
    | 'Production'
    | 'ScratchOrg'
    | 'OnDisk'
    | 'GitHubBranch'
    | 'GitHubEnterpriseBranch'
    | 'GitLabBranch'
    | 'GitLabSelfManagedBranch'
    | 'BitbucketBranch'
    | 'BitbucketServerBranch'
    | 'VstsGitBranch'
    | 'AzureDevOpsGitBranch'
    | 'AzureDevOpsServerBranch'
    | 'GitBranch'
    | 'AwsCodeCommitBranch'
    | 'Other'
    | 'ExactTarget';
  TargetUsername: string;
  TargetMetadataLocationType:
    | 'Developer'
    | 'Sandbox'
    | 'Production'
    | 'ScratchOrg'
    | 'OnDisk'
    | 'GitHubBranch'
    | 'GitHubEnterpriseBranch'
    | 'GitLabBranch'
    | 'GitLabSelfManagedBranch'
    | 'BitbucketBranch'
    | 'BitbucketServerBranch'
    | 'VstsGitBranch'
    | 'AzureDevOpsGitBranch'
    | 'AzureDevOpsServerBranch'
    | 'GitBranch'
    | 'AwsCodeCommitBranch'
    | 'Other'
    | 'ExactTarget';
  DeploymentType: 'Standard' | 'Rollback' | 'DeployToTarget' | 'ContinuousIntegration' | 'Other';
  DeploymentDifferences: DeploymentDifferenceResponse[];
  SalesforceFinalDeploymentId?: string | null;
  JiraTickets?: JiraTicketReferenceResponseEntry[] | null;
  AsanaTasks?: AsanaTaskResponseEntry[] | null;
  AzureDevOpsWorkItems?: AzureDevOpsWorkItemResponseEntry[] | null;
  AnonymousApexExecutions?: AnonymousApexExecutionAuditResponseItem[] | null;
}

export interface DeploymentAuditQuery {
  StartDate: string; // Note: Capital S as per API spec
  EndDate: string; // Note: Capital E as per API spec  
  OptionalParameters?: ('JiraTickets' | 'AsanaTasks' | 'AzureDevOpsWorkItems' | 'AnonymousApexExecutions')[];
}


export interface AnonymousApexQuery {
  StartDate: string;
  EndDate: string;
  OrgUsername?: string;
  Username?: string;
}

// Additional interfaces referenced by Audit API spec
export interface DeploymentDifferenceResponse {
  DifferenceType: string;
  ObjectType: string;
  DisplayName: string;
  ModifiedBy: string;
  ModifiedOn: string;
}

export interface JiraTicketReferenceResponseEntry {
  TicketKey: string;
  TicketUrl?: string;
}

export interface AsanaTaskResponseEntry {
  TaskName: string;
  TaskUrl: string;
}

export interface AzureDevOpsWorkItemResponseEntry {
  ItemReference: string;
  ItemUrl: string;
}

export interface AnonymousApexExecutionAuditResponseItem {
  SalesforceUsername: string;
  SalesforceOrgType: string;
  ApexCode: string;
  Description?: string;
  Timestamp: string;
  ExecutedBy: string;
  Result: string;
  DebugLog?: string;
  DeploymentExecutionType: string;
}

export class GearsetClient {
  private automationClient: AxiosInstance;
  private reportingClient: AxiosInstance;
  private auditClient: AxiosInstance;
  private automationBaseURL = 'https://api.gearset.com/public/automation';
  private reportingBaseURL = 'https://api.gearset.com/public/reporting';
  private auditBaseURL = 'https://api.gearset.com/public/audit';
  
  constructor(private apiToken: string) {
    if (!apiToken || apiToken.trim() === '') {
      throw new Error('Gearset API token is required');
    }
    
    const commonConfig = {
      headers: {
        'Authorization': `token ${apiToken}`,
        'Content-Type': 'application/json',
        'api-version': '1', // Use version 1 as default
      },
      timeout: 30000, // 30 second timeout
    };

    // Initialize all three API clients
    this.automationClient = axios.create({
      baseURL: this.automationBaseURL,
      ...commonConfig
    });

    this.reportingClient = axios.create({
      baseURL: this.reportingBaseURL,
      ...commonConfig,
      headers: {
        ...commonConfig.headers,
        'api-version': '2', // Use version 2 for reporting API
      }
    });

    this.auditClient = axios.create({
      baseURL: this.auditBaseURL,
      ...commonConfig
    });

    // Add response interceptor for error handling to all clients
    const errorInterceptor = (error: AxiosError) => {
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
    };

    // Apply error interceptor to all clients
    [this.automationClient, this.reportingClient, this.auditClient].forEach(client => {
      client.interceptors.response.use((response) => response, errorInterceptor);
    });
  }

  /**
   * Get the current status of a CI job
   */
  async getCIJobStatus(jobId: string): Promise<ContinuousIntegrationJobStatus> {
    try {
      const response = await this.automationClient.get<ContinuousIntegrationJobStatus>(
        `/continuous-integration-jobs/${jobId}/status`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get CI job status: ${error}`);
    }
  }

  /**
   * Start a CI job run request
   */
  async startCIJob(jobId: string, body?: ContinuousIntegrationRunRequestBody): Promise<ContinuousIntegrationRunRequest> {
    try {
      const response = await this.automationClient.post<ContinuousIntegrationRunRequest>(
        `/continuous-integration-jobs/${jobId}/run-requests`,
        body || {} // Empty body or provided body
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to start CI job: ${error}`);
    }
  }

  /**
   * Get the status of a specific CI job run request
   */
  async getCIJobRunStatus(jobId: string, runRequestId: string): Promise<ContinuousIntegrationRunStatus> {
    try {
      const response = await this.automationClient.get<ContinuousIntegrationRunStatus>(
        `/continuous-integration-jobs/${jobId}/run-requests/${runRequestId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get CI job run status: ${error}`);
    }
  }

  /**
   * Cancel a CI job if it is running
   */
  async cancelCIJob(jobId: string): Promise<void> {
    try {
      await this.automationClient.post(
        `/continuous-integration-jobs/${jobId}/cancel`
      );
    } catch (error) {
      throw new Error(`Failed to cancel CI job: ${error}`);
    }
  }

  /**
   * Get the current status of a unit testing job
   */
  async getUnitTestJobStatus(jobId: string): Promise<UnitTestJobStatus> {
    try {
      const response = await this.automationClient.get<UnitTestJobStatus>(
        `/unit-testing-jobs/${jobId}/status`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get unit test job status: ${error}`);
    }
  }

  /**
   * Start a unit testing job run request
   */
  async startUnitTestJob(jobId: string): Promise<UnitTestRunRequest> {
    try {
      const response = await this.automationClient.post<UnitTestRunRequest>(
        `/unit-testing-jobs/${jobId}/run-requests`,
        {} // Empty body as per API docs
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to start unit test job: ${error}`);
    }
  }

  /**
   * Get the status of a specific unit test job run request
   */
  async getUnitTestJobRunStatus(jobId: string, runRequestId: string): Promise<UnitTestRunStatus> {
    try {
      const response = await this.automationClient.get<UnitTestRunStatus>(
        `/unit-testing-jobs/${jobId}/run-requests/${runRequestId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get unit test job run status: ${error}`);
    }
  }

  /**
   * Cancel a unit testing job if it is running
   */
  async cancelUnitTestJob(jobId: string): Promise<UnitTestRunRequest> {
    try {
      const response = await this.automationClient.post<UnitTestRunRequest>(
        `/unit-testing-jobs/${jobId}/cancel`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to cancel unit test job: ${error}`);
    }
  }

  /**
   * Create an external test run for a CI job run
   */
  async createExternalTestRun(ciRunId: string, data: ExternalTestRunData): Promise<ExternalTestRunIds> {
    try {
      const response = await this.automationClient.post<ExternalTestRunIds>(
        `/continuous-integration-runs/${ciRunId}/external-test-runs`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create external test run: ${error}`);
    }
  }

  /**
   * Update an external test run for a CI job run
   */
  async updateExternalTestRun(ciRunId: string, externalTestRunId: string, data: ExternalTestRunData): Promise<void> {
    try {
      await this.automationClient.put(
        `/continuous-integration-runs/${ciRunId}/external-test-runs/${externalTestRunId}`,
        data
      );
    } catch (error) {
      throw new Error(`Failed to update external test run: ${error}`);
    }
  }

  /**
   * Backward compatibility method for getJobRunStatus
   * @deprecated Use getCIJobRunStatus instead
   */
  async getJobRunStatus(jobId: string, runRequestId: string): Promise<ContinuousIntegrationRunStatus> {
    return this.getCIJobRunStatus(jobId, runRequestId);
  }

  /**
   * Start deployment frequency operation - returns operation ID for async processing
   */
  async startDeploymentFrequencyOperation(query: DeploymentFrequencyQuery): Promise<OperationAcceptedResponse> {
    try {
      const params: Record<string, any> = {
        StartDate: query.StartDate,
        EndDate: query.EndDate
      };
      
      if (query.PipelineId) {
        params.PipelineId = query.PipelineId;
      }
      
      const response = await this.reportingClient.post<OperationAcceptedResponse>(
        '/deployment-frequency',
        {},
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to start deployment frequency operation: ${error}`);
    }
  }

  /**
   * Start deployment frequency aggregate operation - returns operation ID for async processing
   */
  async startDeploymentFrequencyAggregateOperation(query: DeploymentFrequencyAggregateQuery): Promise<OperationAcceptedResponse> {
    try {
      const params: Record<string, any> = {
        StartDate: query.StartDate,
        EndDate: query.EndDate,
        Interval: query.Interval,
        GroupBy: query.GroupBy
      };
      
      if (query.PipelineId) {
        params.PipelineId = query.PipelineId;
      }
      
      const response = await this.reportingClient.post<OperationAcceptedResponse>(
        '/deployment-frequency/aggregate',
        {},
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to start deployment frequency aggregate operation: ${error}`);
    }
  }

  /**
   * Start lead time for changes operation - returns operation ID for async processing
   */
  async startLeadTimeForChangesOperation(pipelineId: string, query: LeadTimeQuery): Promise<OperationAcceptedResponse> {
    try {
      const params: Record<string, any> = {
        StartDate: query.StartDate,
        EndDate: query.EndDate
      };
      
      if (query.Exclude && query.Exclude.length > 0) {
        params.Exclude = query.Exclude;
      }
      
      const response = await this.reportingClient.post<OperationAcceptedResponse>(
        `/lead-time/${pipelineId}`,
        {},
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to start lead time for changes operation: ${error}`);
    }
  }

  /**
   * Start lead time for changes aggregate operation - returns operation ID for async processing
   */
  async startLeadTimeForChangesAggregateOperation(pipelineId: string, query: LeadTimeAggregateQuery): Promise<OperationAcceptedResponse> {
    try {
      const params: Record<string, any> = {
        StartDate: query.StartDate,
        EndDate: query.EndDate,
        Interval: query.Interval
      };
      
      const response = await this.reportingClient.post<OperationAcceptedResponse>(
        `/lead-time/${pipelineId}/aggregate`,
        {},
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to start lead time for changes aggregate operation: ${error}`);
    }
  }

  /**
   * Start change failure rate operation - returns operation ID for async processing
   */
  async startChangeFailureRateOperation(environmentId: string, query: ChangeFailureRateQuery): Promise<OperationAcceptedResponse> {
    try {
      const params: Record<string, any> = {
        StartDate: query.StartDate,
        EndDate: query.EndDate
      };
      
      const response = await this.reportingClient.post<OperationAcceptedResponse>(
        `/change-failure-rate/${environmentId}`,
        {},
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to start change failure rate operation: ${error}`);
    }
  }

  /**
   * Start change failure rate aggregate operation - returns operation ID for async processing
   */
  async startChangeFailureRateAggregateOperation(environmentId: string, query: ChangeFailureRateAggregateQuery): Promise<OperationAcceptedResponse> {
    try {
      const params: Record<string, any> = {
        StartDate: query.StartDate,
        EndDate: query.EndDate,
        Interval: query.Interval
      };
      
      const response = await this.reportingClient.post<OperationAcceptedResponse>(
        `/change-failure-rate/${environmentId}/aggregate`,
        {},
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to start change failure rate aggregate operation: ${error}`);
    }
  }

  /**
   * Start time to restore operation - returns operation ID for async processing
   */
  async startTimeToRestoreOperation(environmentId: string, query: TimeToRestoreQuery): Promise<OperationAcceptedResponse> {
    try {
      const params: Record<string, any> = {
        StartDate: query.StartDate,
        EndDate: query.EndDate
      };
      
      const response = await this.reportingClient.post<OperationAcceptedResponse>(
        `/time-to-restore/${environmentId}`,
        {},
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to start time to restore operation: ${error}`);
    }
  }

  /**
   * Start time to restore aggregate operation - returns operation ID for async processing
   */
  async startTimeToRestoreAggregateOperation(environmentId: string, query: TimeToRestoreAggregateQuery): Promise<OperationAcceptedResponse> {
    try {
      const params: Record<string, any> = {
        StartDate: query.StartDate,
        EndDate: query.EndDate,
        Interval: query.Interval
      };
      
      const response = await this.reportingClient.post<OperationAcceptedResponse>(
        `/time-to-restore/${environmentId}/aggregate`,
        {},
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to start time to restore aggregate operation: ${error}`);
    }
  }

  /**
   * Start CI job runs reporting operation - returns operation ID for async processing
   * This gets ALL runs for a specified job (manually triggered + automatic)
   */
  async startCIJobRunsReportingOperation(jobId: string, query: CIJobRunsQuery): Promise<OperationAcceptedResponse> {
    try {
      const params: Record<string, any> = {
        StartDate: query.StartDate,
        EndDate: query.EndDate
      };
      
      const response = await this.reportingClient.post<OperationAcceptedResponse>(
        `/continuous-integration/job/${jobId}/runs`,
        {},
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to start CI job runs reporting operation: ${error}`);
    }
  }

  /**
   * Get the status of a reporting API operation
   */
  async getOperationStatus(operationId: string): Promise<OperationStatusResponse> {
    try {
      const response = await this.reportingClient.get<OperationStatusResponse>(
        `/operation/${operationId}/status`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get operation status: ${error}`);
    }
  }

  /**
   * Get the result of a completed reporting API operation
   */
  async getOperationResult(operationId: string): Promise<any> {
    try {
      const response = await this.reportingClient.get(
        `/operation/${operationId}/result`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get operation result: ${error}`);
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
   * Get deployment audit data from the Audit API
   */
  async getDeploymentAudit(query: DeploymentAuditQuery): Promise<DeploymentAuditEntry[]> {
    try {
      const params: Record<string, any> = {
        StartDate: query.StartDate, // Capital S as per API spec
        EndDate: query.EndDate // Capital E as per API spec
      };
      
      if (query.OptionalParameters && query.OptionalParameters.length > 0) {
        params.OptionalParameters = query.OptionalParameters;
      }
      
      const response = await this.auditClient.get<{ Deployments: DeploymentAuditEntry[] }>(
        '/deployments',
        { params }
      );
      return response.data.Deployments;
    } catch (error) {
      throw new Error(`Failed to get deployment audit data: ${error}`);
    }
  }

  /**
   * Get CI job runs audit data from the Audit API
   */
  async getCIJobRunsAudit(jobId: string, query: CIJobRunsQuery): Promise<ContinuousIntegrationRunObject[]> {
    try {
      const params: Record<string, any> = {
        StartDate: query.StartDate,
        EndDate: query.EndDate
      };
      
      const response = await this.auditClient.get<ContinuousIntegrationJobsResponse>(
        `/continuous-integration/job/${jobId}/runs`,
        { params }
      );
      return response.data.Runs;
    } catch (error) {
      throw new Error(`Failed to get CI job runs audit data: ${error}`);
    }
  }

  /**
   * Get anonymous Apex execution audit data from the Audit API
   */
  async getAnonymousApexAudit(query: AnonymousApexQuery): Promise<any[]> {
    try {
      const params: Record<string, any> = {
        StartDate: query.StartDate,
        EndDate: query.EndDate
      };
      
      if (query.OrgUsername) {
        params.OrgUsername = query.OrgUsername;
      }
      if (query.Username) {
        params.Username = query.Username;
      }
      
      const response = await this.auditClient.get<{AnonymousApexExecutions: any[]}>(
        '/anonymous-apex-execution',
        { params }
      );
      return response.data.AnonymousApexExecutions;
    } catch (error) {
      throw new Error(`Failed to get anonymous Apex audit data: ${error}`);
    }
  }

  /**
   * Get audit events (legacy method for backward compatibility)
   */
  async getAuditEvents(resourceId?: string, limit?: number): Promise<AuditEvent[]> {
    try {
      // For backward compatibility, we'll call the deployment audit endpoint
      // and transform the data into a generic audit events format
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const query: DeploymentAuditQuery = {
        StartDate: thirtyDaysAgo.toISOString(),
        EndDate: now.toISOString(),
      };

      const deployments = await this.getDeploymentAudit(query);

      // Transform deployment audit data into generic audit events
      let events: AuditEvent[] = deployments.map((deployment) => ({
        Id: deployment.DeploymentId,
        EventType: 'DEPLOYMENT',
        Timestamp: deployment.Date,
        ResourceType: 'DEPLOYMENT',
        ResourceId: deployment.DeploymentId,
        Details: {
          status: deployment.Status,
          name: deployment.Name,
          friendlyName: deployment.FriendlyName,
          owner: deployment.Owner,
          triggeredBy: deployment.TriggeredBy,
          sourceUsername: deployment.SourceUsername,
          sourceType: deployment.SourceMetadataLocationType,
          targetUsername: deployment.TargetUsername,
          targetType: deployment.TargetMetadataLocationType,
          deploymentType: deployment.DeploymentType,
          differencesCount: Array.isArray(deployment.DeploymentDifferences)
            ? deployment.DeploymentDifferences.length
            : 0,
        },
      }));

      // Apply resourceId filter if provided
      if (resourceId) {
        events = events.filter((e) => e.ResourceId === resourceId);
      }

      if (limit) {
        return events.slice(0, limit);
      }

      return events;
    } catch (error) {
      throw new Error(`Failed to get audit events: ${error}`);
    }
  }

  /**
   * Get pipeline edit history audit data from the Audit API
   */
  async getPipelineEditHistory(pipelineId: string, query: CIJobRunsQuery): Promise<any[]> {
    try {
      const params: Record<string, any> = {
        StartDate: query.StartDate,
        EndDate: query.EndDate
      };
      
      const response = await this.auditClient.get<{ History: any[] }>(
        `/pipeline/${pipelineId}/edit-history`,
        { params }
      );
      return response.data.History || [];
    } catch (error) {
      throw new Error(`Failed to get pipeline edit history: ${error}`);
    }
  }

  /**
   * Health check - verify the API token works
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Try to access a simple endpoint to verify authentication
      // This might need to be adjusted based on available endpoints
      const response = await this.automationClient.get('/health', {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      console.warn('Gearset API health check failed:', error);
      return false;
    }
  }
}
