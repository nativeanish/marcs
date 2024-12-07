import { createProvider } from "./provider-template";

export const googleProvider = createProvider({
  id: "google",
  name: "Google",
  authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  userInfoUrl: "https://www.googleapis.com/oauth2/v3/userinfo",
  clientId:
    "20445096976-upr33jlhtv88t9fh0cn45fckr28kg4lf.apps.googleusercontent.com",
  clientSecret: "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",
  scope: "openid email profile",
  supportsPKCE: true,
  supportsRefreshTokens: true,
  profile: (data) => ({
    id: data.sub,
    email: data.email,
    name: data.name,
    picture: data.picture,
  }),
});
