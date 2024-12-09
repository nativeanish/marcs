import { createProvider } from "./provider-template";
import { type ProviderConfig, type BaseProfile } from "../types/auth";
import { config } from "../config";

const discordConfig: ProviderConfig = {
  id: "discord",
  name: "Discord",
  authorizationUrl: "https://discord.com/oauth2/authorize",
  tokenUrl: "https://discord.com/api/oauth2/token",
  userInfoUrl: "https://discord.com/api/v10/users/@me",
  clientId: config.DISCORD_CLIENT_ID,
  clientSecret: config.DISCORD_CLIENT_SECRET,
  scope: "email identify",
  supportsPKCE: true,
  supportsRefreshTokens: false,
  customParams: {},
  profile: (data: any): BaseProfile => ({
    id: data.sub,
    email: data.email,
    name: data.name,
    picture: data.picture,
  }),
  getProfile: async ({ access_token }): Promise<BaseProfile> => {
    const response = await fetch("https://discord.com/api/v10/users/@me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const data = await response.json();
    console.log(JSON.stringify(data));
    return {
      id: data.sub,
      email: data.email,
      name: data.name,
      picture: data.picture,
    };
  },
};

export const discordProvider = createProvider(discordConfig);
