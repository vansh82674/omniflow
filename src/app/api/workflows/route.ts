import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// Static workflow definitions — these will be wired to a real DB in Sprint 4
const workflowDefinitions = [
  {
    id: 1,
    name: 'Document Extraction',
    description: 'Extract structured data from uploaded documents using Gemini AI.',
    status: 'active',
    trigger: 'File Upload',
    successRate: null,
    duration: null,
  },
];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(workflowDefinitions);
}
