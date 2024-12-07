import crypto from "crypto";

// Generate PKCE Code Verifier
export const generateCodeVerifier = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

// Generate PKCE Code Challenge
export const generateCodeChallenge = (verifier: string): string => {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
};

// Exchange Authorization Code for Tokens
export const exchangeToken = async (
  provider: any,
  code: string,
  redirectUri: string,
  codeVerifier?: string
): Promise<any> => {
  const params: Record<string, string> = {
    client_id: provider.clientId,
    client_secret: provider.clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  };

  if (codeVerifier && provider.supportsPKCE) {
    params.code_verifier = codeVerifier;
  }

  const response = await fetch(provider.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });

  return response.json();
};
