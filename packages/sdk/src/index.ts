export interface OmniFlowOptions {
  apiKey: string;
  baseUrl?: string;
}

export interface ExtractOptions {
  file: Blob | Buffer;
  filename?: string;
  webhookUrl?: string;
  extractionSchema?: Record<string, any>;
}

export interface ExtractionJob {
  jobId: string;
  bullmqId: string;
  message: string;
}

export interface JobStatus {
  id: string;
  status: 'created' | 'waiting' | 'active' | 'completed' | 'failed' | 'processing';
  result?: string;
  error?: string;
}

export class OmniFlowClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(options: OmniFlowOptions) {
    if (!options.apiKey) {
      throw new Error('OmniFlow API key is required');
    }
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || 'https://api.omniflow.com';
  }

  /**
   * Upload a document for AI extraction
   */
  async extract(options: ExtractOptions): Promise<ExtractionJob> {
    const formData = new FormData();
    
    if (options.file instanceof Blob) {
      formData.append('content', options.file, options.filename || 'document');
    } else {
      // Node.js Buffer
      const blob = new Blob([options.file as BlobPart]);
      formData.append('content', blob, options.filename || 'document');
    }
    
    if (options.webhookUrl) {
      formData.append('webhookUrl', options.webhookUrl);
    }
    
    if (options.extractionSchema) {
      formData.append('extractionSchema', JSON.stringify(options.extractionSchema));
    }

    const response = await fetch(`${this.baseUrl}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
        // Do not set Content-Type, let the browser/fetch set it with the boundary for FormData
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to extract document: ${response.statusText}. ${errorData.error || ''}`);
    }

    return response.json();
  }

  /**
   * Get the status and result of a background job
   */
  async getJob(jobId: string): Promise<JobStatus> {
    const response = await fetch(`${this.baseUrl}/api/job/${jobId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch job ${jobId}: ${response.statusText}`);
    }

    return response.json();
  }
}

export default OmniFlowClient;
