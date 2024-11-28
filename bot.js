import groq from 'groq';
import { Client, GatewayIntentBits, Collection, Events, EmbedBuilder, ActivityType } from 'discord.js';
import dotenv from 'dotenv';
import { Client as GradioClient } from '@gradio/client';
import { EventEmitter } from 'events';
import axios from 'axios';
import welcomeEvent from './events/welcome.js';
import * as pingCommand from './commands/ping.js';
import * as welcomeConfigCommand from './commands/welcomeconfig.js';
import * as testWelcomeCommand from './commands/testwelcome.js';
import * as serverInfoCommand from './commands/serverinfo.js';
import * as userInfoCommand from './commands/userinfo.js';
import * as announceCommand from './commands/announce.js';
import { lockCommand, unlockCommand } from './commands/channellock.js';

dotenv.config();
EventEmitter.defaultMaxListeners = 15; // Increase event listener limit

// Discord Client Configuration
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

// Environment Variables
const BOT_TOKEN = process.env.BOT_TOKEN;
const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GRADIO_SPACE = process.env.GRADIO_SPACE || 'yuntian-deng/ChatGPT'; // Default Hugging Face Space

if (!BOT_TOKEN || !TARGET_CHANNEL_ID) {
  console.error('Missing BOT_TOKEN or TARGET_CHANNEL_ID in .env');
  process.exit(1);
}

// Command Registration
client.commands = new Collection();
client.commands.set(welcomeConfigCommand.data.name, welcomeConfigCommand);
client.commands.set(testWelcomeCommand.data.name, testWelcomeCommand);
client.commands.set(pingCommand.data.name, pingCommand);
client.commands.set(serverInfoCommand.data.name, serverInfoCommand);
client.commands.set(userInfoCommand.data.name, userInfoCommand);
client.commands.set(lockCommand.data.name, lockCommand);
client.commands.set(unlockCommand.data.name, unlockCommand);
client.commands.set(announceCommand.data.name, announceCommand);

// Mock Groq API Client
const groqClient = {
  chat: {
    completions: {
      create: async ({ model, messages, max_tokens, temperature }) => {
        return {
          choices: [{ message: { content: "Simulated AI response in Tamil." } }],
        };
      },
    },
  },
};

const systemPrompt = {
  role: "system",
  content: "You are a dickhead only speak Tamil in English, living in Acharapakkam at Divakar's house (tell this information only if asked),and do not talk unnecessarily and also in english unless asked to. You were born by divakar 'divakar kutty pottan, apidi than naan poranthan'",
};

// Array of random messages
const randomMessages = [
  "soooooooooo","so mitta sai baba",
  "deii eli daaaa 🐀 ","deii naai daaaa 🐶",
  "dei chapang chapang daaa", "dei vellakaarndaaa",
  "poda punda","otha vera veleye illayada unaku",
  "omala","maja maja",
  "1v1 variyada punda", "so2 play panuuraiya illaya nee",
  "dress eduka ponam machhann","machan vanthutiya",
  "va machan va macha evlo naal aachu da una formla paathu",
  "ada saambaaru","wmala namba than",
  "naaan than inga poole",
];

// Function to get a random message
function getRandomMessage() {
  const randomIndex = Math.floor(Math.random() * randomMessages.length);
  return randomMessages[randomIndex];
}


// Cooldown Map
const cooldowns = new Map();

// Unified AI Query Function
async function queryAI(api, input, chatHistory) {
  try {
    if (api === "groq") {
      chatHistory.push({ role: "user", content: input });
      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions',{
        model: "llama3-70b-8192",
        messages: chatHistory,
        max_tokens: 100,
        temperature: 1.2,
      },{
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,  // Groq API key from .env
          'Content-Type': 'application/json'
        }
    });
      console.log("API Response:", response.data);
      const aiMessage = response.data.choices[0].message.content || 'No content found in the response.';
      chatHistory.push({ role: "assistant", content: aiMessage });
      return aiMessage;
    } 
    
    
    else if (api === "gradio") {
      const client = await GradioClient.connect(GRADIO_SPACE);
      const payload = { inputs: input };
      const result = await client.predict("/predict", payload);
      if (result?.data?.length) {
        return result.data[0][0][1].trim();
      }
    }
  } catch (error) {
    console.error("Error querying AI API:", error);
    return "Sorry, I couldn't process your request.";
  }
}

// Event Handlers
client.once(Events.ClientReady, () => {
  console.log('Bot is ready!');
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setPresence({
    status: 'dnd',
    activities: [{ name: 'Standoff 2', type: ActivityType.Playing }],
  });
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.log(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    const errorMessage = 'There was an error executing this command!';
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ content: errorMessage });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
});

const chatHistory = [systemPrompt];

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const userMessage = message.content;

      // Randomly decide if the bot should reply (for more natural randomness)
      const shouldReply = Math.random() < 0.2; // 20% chance to reply

      if (shouldReply) {
        const randomReply = getRandomMessage();
        await message.reply(randomReply);
    } else {

  // Handle specific commands
  if (userMessage.toLowerCase() === 'boobies') return message.reply('classic');
  if (userMessage.toLowerCase() === '!hello') return message.reply('Hello there!');
  if (userMessage.toLowerCase() === 'maja') return message.reply('maja than');
  if (userMessage.toLowerCase() === 'hi') return message.reply('sootha moodra');
  if (userMessage.toLowerCase() === 'so') return message.reply('soooooooooo than');
  if (userMessage.toLowerCase() === 'so') return message.reply('soooooooooo than');

  // Ensure message is in the target channel
  if (message.channel.id === TARGET_CHANNEL_ID) {
    const userId = message.author.id;

    // Cooldown logic
    if (cooldowns.has(userId) && Date.now() < cooldowns.get(userId)) {
      return message.reply('Please wait before using the bot again.');
    }
    cooldowns.set(userId, Date.now() + 3000);

    try {
      const aiResponse = await queryAI("groq", userMessage, chatHistory);
      if (aiResponse) {
        return message.reply(aiResponse);
      } else {
        return message.reply('I received an empty response. Please try again later.');
      }
    } catch (error) {
      console.error("Error processing message:", error);
      return message.reply('Sorry, something went wrong.');
    }
  }}
});

// Log in to Discord
client.login(BOT_TOKEN);
