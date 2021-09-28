export interface Core {
  secure: boolean;
  secret: string;
  host: string;
  port: number;
  database_url: string
}

export interface Bot {
  enabled: boolean;
  prefix: string;
  token: string;
  admin: string[];
  log_channel: string;
  hostname: string;
}

export interface Shortener {
  allow_vanity: boolean;
  length: number;
  route: string;
}

export interface Uploader {
  length: number;
  directory: string;
  blacklisted: string[];
}

export interface Config {
  core: Core;
  bot: Bot;
  shortener: Shortener;
  uploader: Uploader;
}