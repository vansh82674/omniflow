import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const docs = [
  {
    id: 1,
    title: 'Getting Started',
    excerpt: 'Learn how to upload your first document and view extraction results.',
    slug: 'getting-started',
  },
  {
    id: 2,
    title: 'API Reference',
    excerpt: 'Detailed reference for all available OmniFlow API endpoints.',
    slug: 'api-reference',
  },
  {
    id: 3,
    title: 'Webhooks Guide',
    excerpt: 'How to set up and verify webhooks for job completion events.',
    slug: 'webhooks',
  },
  {
    id: 4,
    title: 'Rate Limits',
    excerpt: "Understanding your plan's rate limits and quotas.",
    slug: 'rate-limits',
  },
];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(docs);
}
