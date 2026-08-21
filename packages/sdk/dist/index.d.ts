interface OmniFlowOptions {
    apiKey: string;
    baseUrl?: string;
}
interface ExtractOptions {
    file: Blob | Buffer;
    filename?: string;
    webhookUrl?: string;
    extractionSchema?: Record<string, any>;
}
interface ExtractionJob {
    jobId: string;
    bullmqId: string;
    message: string;
}
interface JobStatus {
    id: string;
    status: 'created' | 'waiting' | 'active' | 'completed' | 'failed' | 'processing';
    result?: string;
    error?: string;
}
declare class OmniFlowClient {
    private apiKey;
    private baseUrl;
    constructor(options: OmniFlowOptions);
    /**
     * Upload a document for AI extraction
     */
    extract(options: ExtractOptions): Promise<ExtractionJob>;
    /**
     * Get the status and result of a background job
     */
    getJob(jobId: string): Promise<JobStatus>;
}

export { type ExtractOptions, type ExtractionJob, type JobStatus, OmniFlowClient, type OmniFlowOptions, OmniFlowClient as default };
