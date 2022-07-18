import {SlashCommandBuilder} from '@discordjs/builders';
import {Role} from '@prisma/client';
import {CommandInteraction, Interaction} from 'discord.js';

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

export type SessionUser = {
  id: string;
  username: string;
  name?: string;
  role: Role;
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
  logChannel: string;
}

export type Config = {
  void: Void;
  neutron: Neutron;
}
