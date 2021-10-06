export interface Core {
  secure: boolean;
  secret: string;
  host: string;
  port: number;
  database_url: string;
}

export interface Bot {
  enabled: boolean;
  prefix: string;
  token: string;
  admins: string[];
  log_channel: string;
  default_uid: number;
  hostname: string;
}

export interface Shortener {
  allow_vanity: boolean;
  length: number;
  route: string;
}

export interface Uploader {
  raw_route: string;
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