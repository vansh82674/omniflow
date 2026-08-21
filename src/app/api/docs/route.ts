import { NextResponse } from 'next/server';

export async function GET() {
  const swaggerSpec = {
    openapi: "3.0.0",
    info: {
      title: "OmniFlow API",
      version: "1.0.0",
      description: "API for extracting structured JSON from documents using AI."
    },
    servers: [
      {
        url: "https://api.omniflow.com",
        description: "Production"
      },
      {
        url: "http://localhost:3000",
        description: "Local Development"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "API Key"
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    paths: {
      "/api/upload": {
        post: {
          summary: "Upload a document for extraction",
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    content: {
                      type: "string",
                      format: "binary",
                      description: "The document file to extract (PDF, TXT, DOCX, CSV)"
                    },
                    webhookUrl: {
                      type: "string",
                      description: "Optional URL to POST the result to when completed"
                    },
                    extractionSchema: {
                      type: "string",
                      description: "Optional Zod-like JSON string defining custom fields"
                    }
                  },
                  required: ["content"]
                }
              }
            }
          },
          responses: {
            "202": {
              description: "Job successfully queued",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      jobId: { type: "string" },
                      bullmqId: { type: "string" },
                      message: { type: "string" }
                    }
                  }
                }
              }
            },
            "401": { description: "Unauthorized" },
            "429": { description: "Rate limit exceeded" }
          }
        }
      },
      "/api/job/{jobId}": {
        get: {
          summary: "Get the status of a specific job",
          parameters: [
            {
              name: "jobId",
              in: "path",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            "200": {
              description: "Job status and result",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      status: { type: "string", enum: ["created", "waiting", "active", "completed", "failed"] },
                      result: { type: "string" },
                      fileType: { type: "string" }
                    }
                  }
                }
              }
            },
            "401": { description: "Unauthorized" },
            "404": { description: "Job not found" }
          }
        }
      }
    }
  };

  return NextResponse.json(swaggerSpec);
}
