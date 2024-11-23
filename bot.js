import { Client, GatewayIntentBits, Collection, Events } from 'discord.js'; // Importing discord.js using ES module syntax
import dotenv from 'dotenv'; // Importing dotenv for environment variables
import { Client as GradioClient } from '@gradio/client'; // Importing Gradio client
import { ActivityType } from 'discord.js';


dotenv.config(); // Load environment variables from .env file

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Retrieve the tokens and API URL from environment variables
const BOT_TOKEN = process.env.BOT_TOKEN;
const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID;
const GRADIO_SPACE = process.env.GRADIO_SPACE || 'yuntian-deng/ChatGPT'; // Default Hugging Face Space if not provided

if (!BOT_TOKEN || !TARGET_CHANNEL_ID) {
  console.error('Missing BOT_TOKEN or TARGET_CHANNEL_ID in .env');
  process.exit(1);
}

import * as pingCommand from './commands/ping.js';

// Increase event listener limit to prevent warning
import { EventEmitter } from 'events';
EventEmitter.defaultMaxListeners = 15;


client.commands = new Collection();
client.commands.set(pingCommand.data.name, pingCommand);

client.once(Events.ClientReady, () => {
    console.log('Bot is ready!');
  client.user.setPresence({
        status: 'dnd', // Options: 'online', 'idle', 'dnd' (Do Not Disturb), 'invisible'
        activities: [{ 
          name: 'Standoff 2', 
          type: ActivityType.Playing, 
          url: 'https://twitch.tv/monster' 
      }], 
    })
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

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


// Cooldown map to prevent spam
const cooldowns = new Map();

// Function to query the Gradio Hugging Face Space
async function queryGradioSpace(input) {
  try {
    const client = await GradioClient.connect(GRADIO_SPACE);  // Connect to the Gradio Space

    // Prepare the payload
    const payload = {
      inputs: input, // The user's message is passed as 'inputs'
      top_p: 1, // Optional, set default value or customize based on user preferences
      temperature: 1, // Optional, set default value or customize
      chat_counter: 3, // Optional, customize as needed
      chatbot: [["Hello!", null]], // Optional, include previous chat context
    };

    // Call the Gradio Space's predict API
    const result = await client.predict("/predict", payload); // Use the '/predict' endpoint

    // Log the raw result for debugging
    console.log('API Response:', result);

    // Check if result.data is available and contains expected structure
    if (!result || !result.data || result.data.length === 0) {
      console.error('No valid response data received.');
      return 'Sorry, I cannot process your request right now.';
    }

    // Extract the response text from the structure (checking deeper layers)
    let response = null;

    if (Array.isArray(result.data) && Array.isArray(result.data[0])) {
      // If data[0] is an array of responses, pick the first one
      response = result.data[0][0][1];  // Extract the actual response
    }

    console.log("result.data structure:", result.data);

    // If still no response, log and return fallback message
    if (!response) {
      console.error('No valid response text found:', result);
      return 'Sorry, I cannot process your request right now.';
    }

    // Check if response is a string and trim it, otherwise return a fallback message
    if (typeof response === 'string') {
      return response.trim();
    } else {
      console.error('Invalid response type:', response);
      return 'Sorry, I cannot process your request right now.';
    }
  } catch (error) {
    console.error('Gradio Client Error:', error);
    return 'Sorry, I cannot process your request right now.';
  }
}


// Event handler when the bot is ready
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Event handler for new messages
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Handle specific commands
  if (message.content.toLowerCase() === 'nice') {
    return message.reply('nice too');
  }
  if (message.content.toLowerCase() === 'boobies') {
    return message.reply('classic');
  }
  if (message.content.toLowerCase() === '!hello') {
    return message.reply('Hello there!');
  }

  // Ensure the message is in the target channel
  if (message.channel.id === TARGET_CHANNEL_ID) {
    const userId = message.author.id;

    // Cooldown logic
    if (cooldowns.has(userId)) {
      const lastUsed = cooldowns.get(userId);
      if (Date.now() - lastUsed < 3000) {
        return message.reply('Please wait before using the bot again.');
      }
    }

    cooldowns.set(userId, Date.now());

    try {
      // Query the Gradio Space API
      const aiResponse = await queryGradioSpace(message.content);

      // Only send the response if it's not empty
      if (aiResponse) {
        return message.reply(aiResponse);
      } else {
        return message.reply('I received an empty response. Please try again later.');
      }
    } catch (error) {
      console.error('Error processing message:', error);
      return message.reply('Sorry, something went wrong.');
    }
  }
});

// Log in to Discord with the bot token
client.login(BOT_TOKEN);
