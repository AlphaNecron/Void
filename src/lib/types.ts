import {Role} from '@prisma/client';

// void related

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

export type LogLevel = 'success' | 'info' | 'error' | 'warn' | 'debug';

export type LogEntry = {
  prefix: string;
  timestamp: Date | string;
  level: LogLevel;
  message: string;
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

// neutron related

export type Neutron = {
  enabled: boolean;
  token: string;
  clientId: string;
  guildId: string;
}

export type Config = {
  void: Void;
  neutron: Neutron;
}

// client

export type SessionUser = {
  id: string;
  username: string;
  name?: string;
  role: Role;
}
