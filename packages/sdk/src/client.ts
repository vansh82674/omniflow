import { OmniFlowOptions, UploadOptions, UploadResponse, JobResult } from './types';

export class OmniFlowClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(options: OmniFlowOptions) {
    if (!options.apiKey) {
      throw new Error('OmniFlow API Key is required');
    }
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || 'https://omniflow.dev/api';
  }

  private get headers(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
    };
  }

  public documents = {
    /**
     * Upload a document for extraction
     */
    extract: async (options: UploadOptions): Promise<UploadResponse> => {
      const formData = new FormData();
      formData.append('content', options.content);

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        headers: this.headers,
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = 'Failed to upload document';
        try {
          const errData = await response.json();
          if (errData.error) errorMsg = errData.error;
        } catch (e) {
          errorMsg = await response.text();
        }
        throw new Error(errorMsg);
      }

      return response.json();
    }
  };

  public jobs = {
    /**
     * Get the current status of a job
     */
    get: async (id: string): Promise<JobResult> => {
      const response = await fetch(`${this.baseUrl}/job/${id}`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch job ${id}`);
      }

      return response.json();
    },

    /**
     * Poll a job until it completes or fails
     */
    waitForCompletion: async (id: string, pollIntervalMs = 2000): Promise<JobResult> => {
      return new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
          try {
            const job = await this.jobs.get(id);
            if (job.status === 'completed') {
              clearInterval(interval);
              resolve(job);
            } else if (job.status === 'failed') {
              clearInterval(interval);
              reject(new Error(`Job failed: ${job.failedReason}`));
            }
            // If waiting or active, keep polling
          } catch (error) {
            clearInterval(interval);
            reject(error);
          }
        }, pollIntervalMs);
      });
    }
  };
}
