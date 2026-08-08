import { Client, Events, GatewayIntentBits } from 'discord.js';
import { readFile } from 'node:fs/promises';
import { parse } from 'jsonc-parser';
import chat from './commands/chat.js';

interface Config {
  'bot-token': string;
  'deepseek-api-key': string;
}

function getRequired(config: Partial<Config>, key: keyof Config): string {
  const value = config[key];
  if (!value) {
    throw new Error(`Missing "${key}" in config.jsonc`);
  }
  return value;
}

async function loadConfig(): Promise<Config> {
  let raw: string;
  try {
    raw = await readFile('./config.jsonc', 'utf8');
  } catch {
    throw new Error(
      'config.jsonc not found. Copy config.example.jsonc to config.jsonc and fill in your keys.'
    );
  }

  const parsed = parse(raw) as Partial<Config>;
  return {
    'bot-token': getRequired(parsed, 'bot-token'),
    'deepseek-api-key': getRequired(parsed, 'deepseek-api-key')
  };
}

const config = await loadConfig();
const BOT_TOKEN = config['bot-token'];
const API_KEY = config['deepseek-api-key'];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on(Events.ClientReady, async () => {
  console.log('Client ready. Logged in as', client.user?.username);

  const application = client.application;
  if (!application) {
    console.warn('Application not available; /chat was not registered.');
    return;
  }

  await application.commands.set([chat.data.toJSON()]);
  console.log('Registered commands.');
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'chat') return;

  try {
    await chat.execute(interaction, API_KEY);
  } catch (error) {
    console.error('Chat command failed:', error);
    const content = 'Something went wrong. Try again later.';
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(content);
    } else {
      await interaction.reply({ content, ephemeral: true });
    }
  }
});

client.login(BOT_TOKEN);
