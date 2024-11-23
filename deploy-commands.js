// deploy-commands.js
import { REST, Routes } from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';
import * as pingCommand from './commands/ping.js';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load config
const config = JSON.parse(
    readFileSync('./config.json', 'utf-8')
);

const commands = [
    pingCommand.data.toJSON()
];

const rest = new REST().setToken(config.token);

async function deployCommands() {
    try {
        console.log('Started refreshing application (/) commands.');

        // Deploy commands globally
        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error deploying commands:', error);
    }
}

deployCommands();