export interface Void {
  useHttps: boolean;
  host: string;
  port: number;
  secret: string;
  rateLimit: number;
  databaseUrl: string;
  defaultDomain: string;
  url: UrlOptions;
  defaultRole: string;
  domains?: string[];
  authProviders: Record<string, Provider>;
  upload: UploadOptions;
}

export interface Provider {
  clientId: string;
  clientSecret: string;
}

export interface UrlOptions {
  allowVanityUrl: boolean;
  length: number;
}

export interface UploadOptions {
  outputDirectory: string;
  blacklistedExtensions: string[];
}

export interface Config {
  void: Void;
}
