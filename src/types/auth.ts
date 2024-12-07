import { z } from "zod";

// Base profile type that all providers must implement
export const BaseProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  picture: z.string().url().optional(),
});

export type BaseProfile = z.infer<typeof BaseProfileSchema>;

// Provider-specific profile types
export const GoogleProfileSchema = z.object({
  sub: z.string(),
  email: z.string().email(),
  name: z.string(),
  picture: z.string().url().optional(),
});

export const MicrosoftProfileSchema = z.object({
  id: z.string(),
  userPrincipalName: z.string().email(),
  displayName: z.string(),
});

export type GoogleProfile = z.infer<typeof GoogleProfileSchema>;
export type MicrosoftProfile = z.infer<typeof MicrosoftProfileSchema>;

// Common provider configuration
export const ProviderConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  authorizationUrl: z.string().url(),
  tokenUrl: z.string().url(),
  userInfoUrl: z.string().url(),
  clientId: z.string(),
  clientSecret: z.string(),
  scope: z.string(),
  supportsPKCE: z.boolean().default(false),
  supportsRefreshTokens: z.boolean().default(false),
  customParams: z.record(z.string()).default({}),
  profile: z.function().args(z.any()).returns(z.custom<BaseProfile>()),
  getProfile: z
    .function()
    .args(z.object({ access_token: z.string() }))
    .returns(z.promise(z.custom<BaseProfile>())),
});

export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;

// Token response schema
export const TokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
  id_token: z.string().optional(),
});

export type TokenResponse = z.infer<typeof TokenResponseSchema>;

// Session state schema
export const AuthStateSchema = z.object({
  codeVerifier: z.string().optional(),
  state: z.string().optional(),
  provider: z.string().optional(),
});

export type AuthState = z.infer<typeof AuthStateSchema>;
