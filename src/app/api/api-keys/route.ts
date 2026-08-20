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

  const dummyApiKeys = [
    { id: 1, name: "Production Key", key: "sk_prod_...", created: "2024-01-10", lastUsed: "10 mins ago" },
    { id: 2, name: "Development Key", key: "sk_test_...", created: "2024-02-15", lastUsed: "1 day ago" },
    { id: 3, name: "Revoked Key", key: "sk_revoked_...", created: "2023-10-01", lastUsed: "6 months ago" },
  ];

  return NextResponse.json(dummyApiKeys);
}
