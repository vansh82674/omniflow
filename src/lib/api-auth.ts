import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function authenticateApiRequest(req: Request): Promise<{ userId: string } | null> {
  // 1. Try NextAuth session (for web dashboard calls)
  const session = await auth();
  if (session?.user?.id) {
    return { userId: session.user.id };
  }

  // 2. Try API Key (for SDK / external calls)
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token) {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      
      const apiKey = await prisma.apiKey.findUnique({
        where: { keyHash: hashedToken }
      });

      if (apiKey && !apiKey.revokedAt) {
        // Fire and forget updating lastUsed
        prisma.apiKey.update({
          where: { id: apiKey.id },
          data: { lastUsed: new Date() },
        }).catch(console.error);

        return { userId: apiKey.userId };
      }
    }
  }

  return null;
}
