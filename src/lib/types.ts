export type Void = {
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
  discordProvider: Provider;
  upload: UploadOptions;
}

export type Provider = {
  clientId: string;
  clientSecret: string;
}

export type UrlOptions = {
  allowVanityUrl: boolean;
  length: number;
}

export type UploadOptions = {
  outputDirectory: string;
  blacklistedExtensions: string[];
}

export type Config = {
  void: Void;
}
