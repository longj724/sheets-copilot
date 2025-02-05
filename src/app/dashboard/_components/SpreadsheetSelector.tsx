"use client";

import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { SpreadsheetResponse } from "~/app/api/projects/[projectId]/spreadsheets/route";

interface SpreadsheetSelectorProps {
  spreadsheets: SpreadsheetResponse[];
  selectedSpreadsheet: SpreadsheetResponse | null;
  onSpreadsheetChange: (spreadsheetId: string) => void;
  onAddSpreadsheet: () => void;
}

export function SpreadsheetSelector({
  spreadsheets,
  selectedSpreadsheet,
  onSpreadsheetChange,
  onAddSpreadsheet,
}: SpreadsheetSelectorProps) {
  return (
    <div className="flex items-center justify-between border-b p-4">
      <div className="flex items-center gap-4">
        <Select
          value={selectedSpreadsheet?.spreadsheetId ?? ""}
          onValueChange={onSpreadsheetChange}
        >
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a spreadsheet" />
          </SelectTrigger>
          <SelectContent>
            {spreadsheets.map((sheet) => (
              <SelectItem key={sheet.spreadsheetId} value={sheet.spreadsheetId}>
                {sheet.spreadsheetName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onAddSpreadsheet} variant="outline" size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Add Spreadsheet
      </Button>
    </div>
  );
}
