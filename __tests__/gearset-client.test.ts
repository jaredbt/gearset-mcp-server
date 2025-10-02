/**
 * Basic tests for the Gearset client to verify setup
 */

import { GearsetClient } from '../lib/gearset-client';

describe('GearsetClient', () => {
  describe('constructor', () => {
    it('should create a new instance with API token', () => {
      const client = new GearsetClient('test-token');
      expect(client).toBeInstanceOf(GearsetClient);
    });

    it('should throw error for empty token', () => {
      expect(() => new GearsetClient('')).toThrow();
    });
  });

  describe('API methods', () => {
    let client: GearsetClient;
    
    beforeEach(() => {
      client = new GearsetClient('test-token');
    });

    it('should have getCIJobStatus method', () => {
      expect(typeof client.getCIJobStatus).toBe('function');
    });

    it('should have startCIJob method', () => {
      expect(typeof client.startCIJob).toBe('function');
    });

    it('should have getJobRunStatus method', () => {
      expect(typeof client.getJobRunStatus).toBe('function');
    });

    it('should have listCIJobs method', () => {
      expect(typeof client.listCIJobs).toBe('function');
    });
  });
});