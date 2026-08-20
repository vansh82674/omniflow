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

  const dummyWorkflows = [
    { id: 1, name: "Data Ingestion Pipeline", status: "active", lastRun: "2 mins ago", successRate: 98, duration: "45s" },
    { id: 2, name: "Nightly Backup", status: "paused", lastRun: "12 hours ago", successRate: 100, duration: "12m" },
    { id: 3, name: "Customer Sync", status: "failed", lastRun: "1 hour ago", successRate: 85, duration: "2m 10s" },
    { id: 4, name: "Generate Reports", status: "active", lastRun: "5 mins ago", successRate: 99, duration: "15s" },
    { id: 5, name: "Abandoned Workflow", status: "paused", lastRun: "Never", successRate: 0, duration: "0s" },
  ];

  return NextResponse.json(dummyWorkflows);
}
