import { NextResponse } from "next/server";

export async function GET() {
  const dummyDocs = [
    { id: 1, title: "Getting Started", excerpt: "Learn how to use OmniFlow in 5 minutes." },
    { id: 2, title: "API Reference", excerpt: "Detailed reference for all available endpoints." },
  ];

  return NextResponse.json(dummyDocs);
}
