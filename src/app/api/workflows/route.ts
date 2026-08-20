import { NextResponse } from "next/server";

export async function GET() {
  const dummyWorkflows = [
    { id: 1, name: "Data Ingestion Pipeline", status: "active", lastRun: "2 mins ago", successRate: 98, duration: "45s" },
    { id: 2, name: "Nightly Backup", status: "paused", lastRun: "12 hours ago", successRate: 100, duration: "12m" },
    { id: 3, name: "Customer Sync", status: "failed", lastRun: "1 hour ago", successRate: 85, duration: "2m 10s" },
    { id: 4, name: "Generate Reports", status: "active", lastRun: "5 mins ago", successRate: 99, duration: "15s" },
  ];

  return NextResponse.json(dummyWorkflows);
}
