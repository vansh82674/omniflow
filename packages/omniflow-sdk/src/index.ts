export interface OmniFlowConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface ExtractOptions {
  filename?: string;
  webhookUrl?: string;
  schema?: Record<string, any>;
}

export interface ExtractionResponse {
  jobId: string;
  bullmqId?: string;
  message: string;
}

export interface JobStatusResponse {
  id: string;
  status: "waiting" | "active" | "completed" | "failed";
  result?: Record<string, any>;
  failedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export class OmniFlowError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'OmniFlowError';
  }
}

export class OmniFlow {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: OmniFlowConfig) {
    if (!config.apiKey) {
      throw new Error("OmniFlow API Key is required.");
    }
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || "https://omniflow-chi.vercel.app").replace(/\/$/, "");
  }

  /**
   * Submit a document for AI extraction.
   * @param file The document file (Blob, File, or raw string content)
   * @param options Additional options (webhookUrl, custom schema)
   * @returns ExtractionResponse with the jobId to poll
   */
  async extract(file: Blob | File | string, options: ExtractOptions = {}): Promise<ExtractionResponse> {
    const formData = new FormData();
    
    let content: string | Blob;
    if (typeof file === 'string') {
      content = file;
    } else {
      // Use the provided filename or fallback to the File object's name or a default
      const name = options.filename || (file as File).name || 'document';
      content = new File([file], name, { type: file.type });
    }

    formData.append('content', content);
    
    if (options.webhookUrl) {
      formData.append('webhookUrl', options.webhookUrl);
    }
    
    if (options.schema) {
      formData.append('extractionSchema', JSON.stringify(options.schema));
    }

    const response = await fetch(`${this.baseUrl}/api/upload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new OmniFlowError(response.status, errorData.error || `Upload failed with status ${response.status}`);
    }

    return response.json();
  }

  /**
   * Poll the status of a submitted extraction job.
   * @param jobId The jobId returned from the extract() method
   * @returns JobStatusResponse containing the status and parsed JSON result
   */
  async getJob(jobId: string): Promise<JobStatusResponse> {
    const response = await fetch(`${this.baseUrl}/api/job/${jobId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new OmniFlowError(response.status, errorData.error || `Failed to fetch job with status ${response.status}`);
    }

    const data = await response.json();
    
    // Attempt to parse the stringified JSON result if it exists
    if (data.result && typeof data.result === 'string') {
      try {
        data.result = JSON.parse(data.result);
      } catch (e) {
        // Keep it as a string if parsing fails
      }
    }

    return data;
  }
}
