"use client";

// External Dependencies
import React, { useState, useEffect } from "react";
import { Table, ArrowRight, Loader2 } from "lucide-react";

interface MainContentProps {
  projectId?: string;
}

interface GoogleSheet {
  id: string;
  name: string;
}

interface GoogleAuthResponse {
  url: string;
}

interface GoogleAuthSuccessEvent {
  type: "GOOGLE_AUTH_SUCCESS";
  tokens: {
    accessToken: string;
    refreshToken?: string;
    expiryDate?: number;
  };
}

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

const MainContent: React.FC<MainContentProps> = ({ projectId }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [authTokens, setAuthTokens] = useState<
    GoogleAuthSuccessEvent["tokens"] | null
  >(null);

  const suggestions = [
    "Analyze the trends in my sales data",
    "Create a summary of my monthly revenue",
    "Find outliers in my customer data",
  ];

  useEffect(() => {
    // Load the Google Picker API
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => {
      window.gapi.load("picker", () => {
        console.log("Picker API loaded");
      });
    };
    document.body.appendChild(script);
  }, []);

  const createPicker = (accessToken: string) => {
    const picker = new window.google.picker.PickerBuilder()
      .addView(window.google.picker.ViewId.SPREADSHEETS)
      .setOAuthToken(accessToken)
      .setDeveloperKey(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!)
      .setCallback(async (data: any) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const sheet = data.docs[0];
          await handleSaveSpreadsheet({
            id: sheet.id,
            name: sheet.name,
          });
        }
      })
      .build();
    picker.setVisible(true);
  };

  const handleConnectSheet = async () => {
    try {
      setIsConnecting(true);
      const response = await fetch("/api/auth/google");
      const data = (await response.json()) as GoogleAuthResponse;

      if (data.url) {
        // Open Google auth in a popup
        const popup = window.open(
          data.url,
          "Google Auth",
          "width=800,height=600",
        );

        // Listen for the callback
        window.addEventListener(
          "message",
          (event: MessageEvent<GoogleAuthSuccessEvent>) => {
            if (event.data?.type === "GOOGLE_AUTH_SUCCESS") {
              setAuthTokens(event.data.tokens);
              if (popup) popup.close();

              // Load the Google Picker API script
              const script = document.createElement("script");
              script.src = "https://apis.google.com/js/api.js?onload=onApiLoad";
              document.body.appendChild(script);

              // Create and show the picker
              createPicker(event.data.tokens.accessToken);
            }
          },
        );
      }
    } catch (error) {
      console.error("Error connecting to Google:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSaveSpreadsheet = async (sheet: GoogleSheet) => {
    if (!projectId || !authTokens) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/projects/${projectId}/spreadsheets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          spreadsheetId: sheet.id,
          spreadsheetName: sheet.name,
          accessToken: authTokens.accessToken,
          refreshToken: authTokens.refreshToken,
          tokenExpiryDate: authTokens.expiryDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save spreadsheet");
      }

      // Clear the auth tokens after saving
      setAuthTokens(null);
    } catch (error) {
      console.error("Error saving spreadsheet:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen flex-1">
      {/* Left Panel - Spreadsheet View */}
      <div className="flex w-1/2 border-r">
        <div className="flex flex-1 flex-col items-center justify-center p-8">
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-8">
            <Table className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="text-xl font-semibold">Connect a Google Sheet</h3>
            <p className="mb-4 text-center text-gray-500">
              Connect your Google Sheet to start analyzing and chatting with
              your data
            </p>
            <button
              onClick={handleConnectSheet}
              disabled={isConnecting || isSaving}
              className="flex items-center gap-2 rounded-md bg-[#0f172a] px-4 py-2 text-white disabled:opacity-50"
            >
              {isConnecting || isSaving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Table className="h-5 w-5" />
              )}
              {isConnecting
                ? "Connecting..."
                : isSaving
                  ? "Saving..."
                  : "Connect Sheet"}
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Chat Interface */}
      <div className="flex w-1/2 flex-col p-8">
        <h1 className="text-2xl font-bold">Chat Assistant</h1>

        <div className="flex flex-1 flex-col items-center justify-center">
          <h2 className="mb-4 text-4xl font-bold">Hi,</h2>
          <p className="mb-12 text-xl text-gray-500">
            How can I assist you today?
          </p>

          <div className="flex w-full max-w-xl flex-col gap-4">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="flex items-center justify-between rounded-lg border p-4 text-left hover:bg-gray-50"
              >
                <span>{suggestion}</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
