import { POST } from '@/app/api/upload/route';
import { prisma } from '@/lib/prisma';
import { authenticateApiRequest } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/rate-limit';

// We need to mock the Queue class from bullmq which is instantiated in the route
jest.mock('bullmq', () => {
  return {
    Queue: jest.fn().mockImplementation(() => {
      return {
        add: jest.fn().mockRejectedValue(new Error('Simulated network timeout')),
      };
    }),
  };
});

// Mock internal dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    job: {
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@/lib/api-auth', () => ({
  authenticateApiRequest: jest.fn(),
}));

jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn(),
}));

jest.mock('@/lib/redis', () => ({
  redis: {},
}));

describe('Upload API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default successful auth and rate limit
    (authenticateApiRequest as jest.Mock).mockResolvedValue({ userId: 'test-user-id' });
    (checkRateLimit as jest.Mock).mockResolvedValue(true);
  });

  it('CodeRabbit constraint: should not mark job as failed on ambiguous enqueue error', async () => {
    // Setup: Prisma create succeeds, but bullmq queue.add fails (mocked above)
    (prisma.job.create as jest.Mock).mockResolvedValue({ id: 'mock-job-id' });

    // Create a mock Request with form data
    const formData = new FormData();
    formData.append('content', 'Sample text file content');

    const request = new Request('http://localhost/api/upload', {
      method: 'POST',
      body: formData,
    });

    // Execute
    const response = await POST(request);
    const json = await response.json();

    // Verify
    expect(response.status).toBe(500);
    expect(json.error).toMatch(/timeout/i);

    // Verify the job was created with status 'created'
    expect(prisma.job.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'created',
          userId: 'test-user-id',
        }),
      })
    );

    // CRITICAL: Ensure we do NOT overwrite the status to 'failed'
    expect(prisma.job.update).not.toHaveBeenCalled();
  });
});
