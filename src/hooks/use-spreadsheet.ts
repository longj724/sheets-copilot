import { useQuery } from "@tanstack/react-query";
import type { SpreadsheetResponse } from "~/app/api/projects/[projectId]/spreadsheets/route";

export function useSpreadsheet(projectId: string) {
  return useQuery<SpreadsheetResponse[]>({
    queryKey: ["spreadsheet", projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/spreadsheets`);
      if (!response.ok) {
        throw new Error("Failed to fetch spreadsheet");
      }

      const data = await response.json();
      return data ?? [];
    },
    enabled: !!projectId,
  });
} 