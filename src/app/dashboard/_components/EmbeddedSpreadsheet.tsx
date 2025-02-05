"use client";

import { useEffect, useRef } from "react";
import { Skeleton } from "~/components/ui/skeleton";

interface EmbeddedSpreadsheetProps {
  spreadsheetId: string;
  height?: string;
}

export function EmbeddedSpreadsheet({
  spreadsheetId,
  height = "100%",
}: EmbeddedSpreadsheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSpreadsheet = () => {
      if (!containerRef.current) return;

      const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?embedded=true`;
      const iframe = document.createElement("iframe");

      iframe.src = spreadsheetUrl;
      iframe.style.width = "100%";
      iframe.style.height = height;
      iframe.style.border = "none";

      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(iframe);
    };

    loadSpreadsheet();
  }, [spreadsheetId, height]);

  return (
    <div ref={containerRef} style={{ width: "100%", height }}>
      <Skeleton className="h-full w-full" />
    </div>
  );
}
