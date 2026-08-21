export interface OmniFlowOptions {
  apiKey: string;
  baseUrl?: string;
}

export interface JobResult {
  id: string;
  name: string;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  result?: string;
  failedReason?: string;
  fileType?: string;
  timestamp: string;
}

export interface UploadOptions {
  content: string | Blob;
}

export interface UploadResponse {
  jobId: string;
  bullmqId: string;
  message: string;
}
