import { createProvider } from "./provider-template";
import { type ProviderConfig, type BaseProfile } from "../types/auth";
import { config } from "../config";

const googleConfig: ProviderConfig = {
  id: "google",
  name: "Google",
  authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  userInfoUrl: "https://www.googleapis.com/oauth2/v3/userinfo",
  clientId: config.GOOGLE_CLIENT_ID,
  clientSecret: config.GOOGLE_CLIENT_SECRET,
  scope: "openid email profile",
  supportsPKCE: true,
  supportsRefreshTokens: true,
  customParams: {},
  profile: (data: any): BaseProfile => ({
    id: data.sub,
    email: data.email,
    name: data.name,
    picture: data.picture,
  }),
  getProfile: async ({ access_token }): Promise<BaseProfile> => {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const data = await response.json();
    return {
      id: data.sub,
      email: data.email,
      name: data.name,
      picture: data.picture,
    };
  },
};

export const googleProvider = createProvider(googleConfig);
