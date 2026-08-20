import { NextResponse } from "next/server";

export async function GET() {
  const dummyApiKeys = [
    { id: 1, name: "Production Key", key: "sk_prod_...", created: "2024-01-10", lastUsed: "10 mins ago" },
    { id: 2, name: "Development Key", key: "sk_test_...", created: "2024-02-15", lastUsed: "1 day ago" },
  ];

  return NextResponse.json(dummyApiKeys);
}
