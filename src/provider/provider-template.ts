export interface ProviderConfig {
  id: string;
  name: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  supportsPKCE?: boolean;
  supportsRefreshTokens?: boolean;
  customParams?: Record<string, string>;
  profile?: (data: any) => Record<string, any>;
  profileUrl?: string;
}

export const createProvider = (config: ProviderConfig): ProviderConfig => {
  return {
    supportsPKCE: false,
    supportsRefreshTokens: false,
    customParams: {},
    profile: (data: any) => data,
    ...config,
  };
};
