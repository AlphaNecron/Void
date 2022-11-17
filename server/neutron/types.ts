import type {
  APIEmbedField,
  ChatInputCommandInteraction,
  Interaction,
  InteractionReplyOptions,
  InteractionResponse,
  ModalSubmitInteraction
} from 'discord.js';
import {ButtonBuilder} from 'discord.js';

export abstract class NeutronCommandGroup {
  abstract name: string;
  abstract commands: NeutronCommand[];
  description = 'Neutron';

  async execute(context: Context<ChatInputCommandInteraction>, user: User) {
    const sub = context.options.getSubcommand();
    const handler = this.commands.find(cmd => cmd.name === sub);
    await handler.execute(context, user);
  }
}

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
  paginate: <TItem>(params: PaginationParameter<TItem>) => Promise<void>;
  whisper: (message: string | InteractionReplyOptions) => Promise<InteractionResponse>;
  getUser: () => Promise<User>;
} & T;

export type PaginationParameter<T> = {
  initialItems: T[];
  getItems: () => Promise<T[]>,
  itemBuilder: (item: T) => Item;
  onButtonInvoked: (id: string, item: T, mutate: () => Promise<void>) => void;
}

type Item = {
  title: string;
  fields: APIEmbedField[];
  buttons?: ButtonBuilder[];
}
