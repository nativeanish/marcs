import { ProviderConfig } from "../types/auth";
import { googleProvider } from "./google";

export const providers: Record<string, ProviderConfig> = {
  google: googleProvider,
};
