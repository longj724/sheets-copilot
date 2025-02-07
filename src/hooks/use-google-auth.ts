// External Dependencies
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface TokenData {
  hasValidTokens: boolean;
  tokens: {
    accessToken: string;
    refreshToken?: string;
    expiryDate?: number;
  } | null;
}

interface GoogleAuthResponse {
  url: string;
}

interface GoogleAuthSuccessEvent {
  type: "GOOGLE_AUTH_SUCCESS";
  tokens: TokenData["tokens"];
}

export function useGoogleAuth() {
  const queryClient = useQueryClient();

  const { data: tokenData, isLoading } = useQuery<TokenData>({
    queryKey: ["google-tokens"],
    queryFn: async () => {
      const response = await fetch("/api/auth/google/tokens");
      if (!response.ok) {
        throw new Error("Failed to fetch tokens");
      }
      return response.json();
    },
    // Refresh every 4 minutes to ensure we always have a valid token
    refetchInterval: 4 * 60 * 1000,
  });

  const initiateAuth = async () => {
    const response = await fetch("/api/auth/google");
    const data = (await response.json()) as GoogleAuthResponse;
    
    if (data.url) {
      const popup = window.open(
        data.url,
        "Google Auth",
        "width=800,height=600"
      );

      return new Promise<TokenData["tokens"]>((resolve, reject) => {
        // Set a timeout to reject the promise if auth takes too long
        const timeoutId = setTimeout(() => {
          if (popup) popup.close();
          reject(new Error("Authentication timed out"));
        }, 5 * 60 * 1000); // 5 minutes timeout

        const handleMessage = (event: MessageEvent) => {
          const data = event.data as GoogleAuthSuccessEvent;
          if (data?.type === "GOOGLE_AUTH_SUCCESS") {
            clearTimeout(timeoutId);
            if (popup) popup.close();
            window.removeEventListener("message", handleMessage);
            
            void queryClient.invalidateQueries({ queryKey: ["google-tokens"] });
            resolve(data.tokens);
          }
        };

        window.addEventListener("message", handleMessage);
      });
    }
    throw new Error("Failed to get auth URL");
  };

  return {
    tokens: tokenData?.tokens,
    hasValidTokens: tokenData?.hasValidTokens ?? false,
    isLoading,
    initiateAuth,
  };
} 