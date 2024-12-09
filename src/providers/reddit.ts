import { createProvider } from "./provider-template";
import { type ProviderConfig, type BaseProfile } from "../types/auth";
import { config } from "../config";

const redditConfig: ProviderConfig = {
  id: "reddit",
  name: "Reddit",
  authorizationUrl: "https://www.reddit.com/api/v1/authorize",
  tokenUrl: "https://www.reddit.com/api/v1/access_token",
  userInfoUrl: "https://oauth.reddit.com/api/v1/me",
  clientId: config.REDDIT_CLIENT_ID,
  clientSecret: config.REDDIT_CLIENT_SECRET,
  scope: "identity mysubreddit",
  supportsPKCE: true,
  supportsRefreshTokens: true,
  customParams: {
    duration: "permanent",
  },
  profile: (data: any): BaseProfile => ({
    id: data.sub,
    email: data.email,
    name: data.name,
    picture: data.picture,
  }),
  getProfile: async ({ access_token }): Promise<BaseProfile> => {
    const response = await fetch("https://oauth.reddit.com/api/v1/me", {
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

export const redditProvider = createProvider(redditConfig);
