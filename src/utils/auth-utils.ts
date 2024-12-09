import crypto from "crypto";
import { ProviderConfig, TokenResponse } from "../types/auth";

export const generateCodeVerifier = (): string => {
  return crypto.randomBytes(32).toString("base64url");
};

export const generateCodeChallenge = (verifier: string): string => {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
};

export const generateState = (): string => {
  return crypto.randomBytes(16).toString("hex");
};

export const generateAuthUrl = (
  provider: ProviderConfig,
  redirectUri: string,
  additionalParams: Record<string, string> = {}
): { url: string; codeVerifier?: string; state: string } => {
  const state = generateState();

  const queryParams: Record<string, string> = {
    client_id: provider.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: provider.scope,
    state,
    ...provider.customParams,
    ...additionalParams,
  };

  let codeVerifier: string | undefined;

  if (provider.supportsPKCE) {
    codeVerifier = generateCodeVerifier();
    queryParams.code_challenge = generateCodeChallenge(codeVerifier);
    queryParams.code_challenge_method = "S256";
  }

  const url = `${provider.authorizationUrl}?${new URLSearchParams(
    queryParams
  )}`;

  return { url, codeVerifier, state };
};

export const exchangeToken = async (
  provider: ProviderConfig,
  code: string,
  redirectUri: string,
  codeVerifier?: string
): Promise<TokenResponse> => {
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
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams(params),
  });

  if (!response.ok) {
    throw new Error("Token exchange failed");
  }

  return response.json();
};
