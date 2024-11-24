// welcomeconfig.js - Command to configure welcome messages
import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

// Store welcome settings (in a real bot, you'd use a database)
const welcomeSettings = new Map();

export const data = new SlashCommandBuilder()
    .setName('welcomeconfig')
    .setDescription('Configure the welcome message')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(option =>
        option.setName('channel')
            .setDescription('The channel to send welcome messages')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('message')
            .setDescription('The welcome message (use {user} for mention, {server} for server name)')
            .setRequired(true))
    .addBooleanOption(option =>
        option.setName('embed')
            .setDescription('Send as an embed?')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('color')
            .setDescription('Embed color (hex code like #ff0000)')
            .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');
    const useEmbed = interaction.options.getBoolean('embed') ?? true;
    const color = interaction.options.getString('color') ?? '#00ff00';

    // Save settings
    welcomeSettings.set(interaction.guildId, {
        channelId: channel.id,
        message,
        useEmbed,
        color
    });

    await interaction.reply({
        content: `Welcome message configured!\nChannel: ${channel}\nMessage: ${message}\nEmbed: ${useEmbed}\nColor: ${color}`,
        ephemeral: true
    });
}

// Function to get welcome settings
export function getWelcomeSettings(guildId) {
    return welcomeSettings.get(guildId);
}