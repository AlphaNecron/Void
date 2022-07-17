import {CommandInteraction, ModalSubmitInteraction} from 'discord.js';

export type CachedUser = {
  id?: string;
  isAdmin?: boolean;
}

export type NeutronCommand = {
  name: string;
  description: string;
  requiresAdmin?: boolean;
  execute: (interaction: CommandInteraction, user: CachedUser) => Promise<void>;
}

export type NeutronModal = {
  id: string;
  handle: (interaction: ModalSubmitInteraction, user: CachedUser) => Promise<void>;
}
