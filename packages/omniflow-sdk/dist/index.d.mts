interface OmniFlowConfig {
    apiKey: string;
    baseUrl?: string;
}
interface ExtractOptions {
    filename?: string;
    webhookUrl?: string;
    schema?: Record<string, any>;
}
interface ExtractionResponse {
    jobId: string;
    bullmqId?: string;
    message: string;
}
interface JobStatusResponse {
    id: string;
    status: "waiting" | "active" | "completed" | "failed";
    result?: Record<string, any>;
    failedReason?: string;
    createdAt: string;
    updatedAt: string;
}
declare class OmniFlowError extends Error {
    status: number;
    constructor(status: number, message: string);
}
declare class OmniFlow {
    private apiKey;
    private baseUrl;
    constructor(config: OmniFlowConfig);
    /**
     * Submit a document for AI extraction.
     * @param file The document file (Blob, File, or raw string content)
     * @param options Additional options (webhookUrl, custom schema)
     * @returns ExtractionResponse with the jobId to poll
     */
    extract(file: Blob | File | string, options?: ExtractOptions): Promise<ExtractionResponse>;
    /**
     * Poll the status of a submitted extraction job.
     * @param jobId The jobId returned from the extract() method
     * @returns JobStatusResponse containing the status and parsed JSON result
     */
    getJob(jobId: string): Promise<JobStatusResponse>;
}

export { type ExtractOptions, type ExtractionResponse, type JobStatusResponse, OmniFlow, type OmniFlowConfig, OmniFlowError };
