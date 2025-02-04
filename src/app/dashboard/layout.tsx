"use client";
// External Dependencies
import React, { useState } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Internal Dependencies
import Sidebar from "./_components/Sidebar";
import { Toaster } from "~/components/ui/sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        <div className="flex">
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            toggleSidebar={toggleSidebar}
          />
          {children}
        </div>
        <Toaster />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
