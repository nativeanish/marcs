import { createProvider } from "./provider-template";
import { type ProviderConfig, type BaseProfile } from "../types/auth";
import { config } from "../config";

const githubConfig: ProviderConfig = {
  id: "github",
  name: "GitHub",
  authorizationUrl: "https://github.com/login/oauth/authorize",
  tokenUrl: "https://github.com/login/oauth/access_token",
  userInfoUrl: "https://api.github.com/user",
  clientId: config.GITHUB_CLIENT_ID,
  clientSecret: config.GITHUB_CLIENT_SECRET,
  scope: "read:user user:email user:follow",
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
    const response = await fetch("https://api.github.com/user", {
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

export const githubProvider = createProvider(githubConfig);
