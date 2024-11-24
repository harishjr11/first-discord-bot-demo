// deploy-commands.js
import { REST, Routes } from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';
import * as pingCommand from './commands/ping.js';
import * as serverInfoCommand from './commands/serverinfo.js';
import * as userInfoCommand from './commands/userinfo.js';
import * as welcomeConfigCommand from './commands/welcomeconfig.js';
import * as testWelcomeCommand from './commands/testwelcome.js';
import * as lockCommand from './commands/channellock.js';
import * as unlockCommand from './commands/channellock.js';
import * as announceCommand from './commands/announce.js';


// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load config
const config = JSON.parse(
    readFileSync('./config.json', 'utf-8')
);

const commands = [
    pingCommand.data.toJSON(),
    serverInfoCommand.data.toJSON(),
    userInfoCommand.data.toJSON(),
    welcomeConfigCommand.data.toJSON(),
    testWelcomeCommand.data.toJSON(),
    announceCommand.data.toJSON(),
    lockCommand.lockCommand.data.toJSON(), // Add lock command
    unlockCommand.unlockCommand.data.toJSON(), // Add unlock command
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