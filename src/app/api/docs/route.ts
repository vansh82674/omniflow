import { NextResponse } from "next/server";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET() {
  // Simulate network delay between 500ms and 1500ms
  await sleep(Math.random() * 1000 + 500);

  // Simulate server error on 10% of requests
  if (Math.random() < 0.1) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }

  // Simulate empty state on 10% of successful requests
  if (Math.random() < 0.1) {
    return NextResponse.json([]);
  }

  const dummyDocs = [
    { id: 1, title: "Getting Started", excerpt: "Learn how to use OmniFlow in 5 minutes." },
    { id: 2, title: "API Reference", excerpt: "Detailed reference for all available endpoints." },
    { id: 3, title: "Webhooks Guide", excerpt: "How to set up and verify webhooks for events." },
    { id: 4, title: "Rate Limits", excerpt: "Understanding your tier's rate limits and quotas." },
  ];

  return NextResponse.json(dummyDocs);
}
