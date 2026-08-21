import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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
      // Fetch all active keys. 
      // Note: In a large scale production system, API keys should be generated with an ID prefix 
      // (e.g. `sk_live_<id>_<secret>`) to avoid O(N) bcrypt comparisons, or hashed via SHA-256.
      // For this implementation, we preserve existing bcrypt functionality.
      const activeKeys = await prisma.apiKey.findMany({
        where: { revokedAt: null },
      });

      for (const apiKey of activeKeys) {
        const isValid = await bcrypt.compare(token, apiKey.keyHash);
        if (isValid) {
          // Fire and forget updating lastUsed
          prisma.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsed: new Date() },
          }).catch(console.error);

          return { userId: apiKey.userId };
        }
      }
    }
  }

  return null;
}
