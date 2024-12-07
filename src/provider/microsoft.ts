import { createProvider } from "./provider-template";

export const microsoftProvider = createProvider({
  id: "microsoft",
  name: "Microsoft",
  authorizationUrl:
    "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
  tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
  userInfoUrl: "https://graph.microsoft.com/v1.0/me",
  clientId: process.env.MICROSOFT_CLIENT_ID || "",
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
  scope: "openid email profile offline_access",
  supportsPKCE: true,
  supportsRefreshTokens: true,
  profile: (data) => ({
    id: data.id,
    email: data.userPrincipalName,
    name: data.displayName,
  }),
});
