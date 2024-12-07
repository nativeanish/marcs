import { ProviderConfig, ProviderConfigSchema } from "../types/auth";

export const createProvider = (config: ProviderConfig): ProviderConfig => {
  const validatedConfig = ProviderConfigSchema.parse({
    ...config,
  });

  return validatedConfig;
};
