import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { getWelcomeSettings } from './welcomeconfig.js';

export const data = new SlashCommandBuilder()
    .setName('testwelcome')
    .setDescription('Test the welcome message')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
    const settings = getWelcomeSettings(interaction.guildId);
    
    if (!settings) {
        return interaction.reply({
            content: 'Welcome message hasn\'t been configured yet! Use /welcomeconfig first.',
            ephemeral: true
        });
    }

    const channel = await interaction.guild.channels.fetch(settings.channelId);
    const formattedMessage = settings.message
        .replace('{user}', interaction.user)
        .replace('{server}', interaction.guild.name);

    if (settings.useEmbed) {
        const embed = new EmbedBuilder()
            .setColor(settings.color)
            .setDescription(formattedMessage)
            .setTimestamp();

        await channel.send({ embeds: [embed] });
    } else {
        await channel.send(formattedMessage);
    }

    await interaction.reply({
        content: 'Test welcome message sent!',
        ephemeral: true
    });
}