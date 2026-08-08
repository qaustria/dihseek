import { SlashCommandBuilder } from 'discord.js';
import type {
  SlashCommandOptionsOnlyBuilder,
  ChatInputCommandInteraction
} from 'discord.js';
import { askDeepSeek, DEFAULT_MODEL } from '../utils/deepseek.js';

type ChatCommand = {
  data: SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction, apiKey: string) => Promise<void>;
};

const chatCommand: ChatCommand = {
  data: new SlashCommandBuilder()
    .setName('chat')
    .setDescription('Chat with DeepSeek.')
    .addStringOption((option) =>
      option.setName('input').setDescription('What to ask').setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('model')
        .setDescription(`Which DeepSeek model? (default: ${DEFAULT_MODEL})`)
        .setRequired(false)
        .addChoices(
          { name: 'DeepSeek V4 Pro', value: 'deepseek-v4-pro' },
          { name: 'DeepSeek V4 Flash', value: 'deepseek-v4-flash' }
        )
    )
    .setIntegrationTypes(0, 1)
    .setContexts(0, 1, 2),
  async execute(interaction: ChatInputCommandInteraction, apiKey: string) {
    const input = interaction.options.getString('input');
    if (!input) return;

    const model = interaction.options.getString('model') ?? DEFAULT_MODEL;

    await interaction.deferReply();
    const reply = await askDeepSeek(apiKey, input, model);
    await interaction.editReply(reply);
  }
};

export default chatCommand;
