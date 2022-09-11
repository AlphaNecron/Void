import type {
  ChatInputCommandInteraction,
  Interaction,
  InteractionReplyOptions,
  InteractionResponse,
  ModalSubmitInteraction
} from 'discord.js';

export type NeutronCommand = {
  name: string;
  description: string;
  requiresAdmin?: boolean;
  execute: (context: Context<ChatInputCommandInteraction>, user: User) => Promise<void>;
}

export type NeutronModal = {
  id: string;
  handle: (context: Context<ModalSubmitInteraction>, user: User) => Promise<void>;
}

export type User = {
  id: string;
  canUseBot: boolean;
  isAdmin: boolean;
}

export type Context<T extends Interaction = Interaction> = {
  whisper: (message: string | InteractionReplyOptions) => Promise<InteractionResponse>;
  getUser: () => Promise<User>;
} & T;
