import React from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh w-full bg-zinc-950 text-zinc-50 font-sans overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 flex flex-col min-w-0 relative">
        {children}
      </main>
    </div>
  );
}
