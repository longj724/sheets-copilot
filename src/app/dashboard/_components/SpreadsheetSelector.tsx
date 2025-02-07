"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import type { SpreadsheetResponse } from "~/app/api/projects/[projectId]/spreadsheets/route";

interface SpreadsheetSelectorProps {
  spreadsheets: SpreadsheetResponse[];
  selectedSpreadsheet: SpreadsheetResponse | null;
  onSpreadsheetChange: (spreadsheetId: string) => void;
  onAddSpreadsheet: () => void;
  onDeleteSpreadsheet: (spreadsheetId: string) => void;
}

export const SpreadsheetSelector: React.FC<SpreadsheetSelectorProps> = ({
  spreadsheets,
  selectedSpreadsheet,
  onSpreadsheetChange,
  onAddSpreadsheet,
  onDeleteSpreadsheet,
}) => {
  return (
    <div className="flex items-center gap-2 border-b p-4">
      <Select
        value={selectedSpreadsheet?.spreadsheetId}
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

      <Button variant="outline" size="icon" onClick={onAddSpreadsheet}>
        <Plus className="h-4 w-4" />
      </Button>

      {selectedSpreadsheet && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Spreadsheet</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this spreadsheet? This will only
                remove the connection and won&apos;t affect your Google Sheet.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={() =>
                  onDeleteSpreadsheet(selectedSpreadsheet.spreadsheetId)
                }
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};
