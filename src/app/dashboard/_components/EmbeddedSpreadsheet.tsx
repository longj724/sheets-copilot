"use client";

import { useQuery } from "@tanstack/react-query";

interface EmbeddedSpreadsheetProps {
  spreadsheetId: string;
  height?: string;
}

export const EmbeddedSpreadsheet = ({
  spreadsheetId,
  height = "100%",
}: EmbeddedSpreadsheetProps) => {
  // Fetch access token for embedding
  const { data: tokenData, isLoading } = useQuery({
    queryKey: ["google-tokens"],
    queryFn: async () => {
      const response = await fetch("/api/auth/google/tokens");
      const data = (await response.json()) as {
        hasValidTokens: boolean;
        tokens: { accessToken: string } | null;
      };
      return data;
    },
  });

  console.log("tokenData", tokenData);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading spreadsheet...</p>
      </div>
    );
  }

  if (!tokenData?.hasValidTokens || !tokenData.tokens) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Unable to load spreadsheet. Please check authentication.</p>
      </div>
    );
  }

  // Include the access token in the URL
  const embedUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?usp=sharing&embedded=true&access_token=${tokenData.tokens.accessToken}`;

  return (
    <div className="h-full w-full">
      <iframe
        src={embedUrl}
        className="h-full w-full border-0"
        style={{ height }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
};
