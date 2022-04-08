export interface Void {
  useHttps: boolean;
  host: string;
  port: number;
  databaseUrl: string;
  url: Url;
  defaultRole: string;
  domains?: string[];
  authProviders: Record<string, Provider>;
  file: File;
}

export interface Provider {
  clientId: string;
  clientSecret: string;
}

export interface Url {
  allowVanityUrl: boolean;
  length: number;
}

export interface File {
  outputDirectory: string;
  blacklistedExtensions: string[];
}

export interface Config {
  void: Void;
}
