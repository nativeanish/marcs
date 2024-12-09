import { ProviderConfig } from "../types/auth";
import { googleProvider } from "./google";
import { discordProvider } from "./discord";
import { githubProvider } from "./github";
import { redditProvider } from "./reddit";
export const providers: Record<string, ProviderConfig> = {
  google: googleProvider,
  discord: discordProvider,
  github: githubProvider,
  reddit: redditProvider,
};
