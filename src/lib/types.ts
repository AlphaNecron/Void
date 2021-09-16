export interface Core {
  secure: boolean;
  secret: string;
  host: string;
  port: number;
  database_url: string
}

export interface Uploader {
  length: number;
  directory: string;
  blacklisted: string[];
}

export interface Config {
  core: Core;
  uploader: Uploader;
}