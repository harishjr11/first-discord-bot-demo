import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Make an announcement in a specific channel.')
    .addChannelOption(option =>
        option.setName('channel')
            .setDescription('The channel to send the announcement in')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('message')
            .setDescription('The message content of the announcement')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('title')
            .setDescription('The title of the announcement')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('color')
            .setDescription('Color of the announcement embed (HEX, e.g., #FF5733)')
            .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export async function execute(interaction) {
    const targetChannel = interaction.options.getChannel('channel');
    const title = interaction.options.getString('title');
    const message = interaction.options.getString('message');
    const color = interaction.options.getString('color') || '#0099FF';

    // Check if the channel is a text-based channel
    if (!targetChannel.isTextBased()) {
        return interaction.reply({
            content: '❌ The selected channel is not a text channel.',
            ephemeral: true,
        });
    }

    // Check if the bot has permission to send messages and embeds in the target channel
    if (!targetChannel.permissionsFor(interaction.guild.members.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])) {
        return interaction.reply({
            content: '❌ I don\'t have permission to send messages or embeds in this channel.',
            ephemeral: true,
        });
    }

    // Validate the color code if provided
    const colorRegex = /^#[0-9A-F]{6}$/i;
    if (color && !colorRegex.test(color)) {
        return interaction.reply({
            content: '❌ The color code provided is not valid. Please use a HEX color code (e.g., #FF5733).',
            ephemeral: true,
        });
    }

    try {
        // Create an embed if a title is provided
        const embed = new EmbedBuilder()
            .setDescription(message)
            .setColor(color)
            .setFooter({ text: `Announcement by ${interaction.user.tag}` })
            .setTimestamp();

        if (title) {
            embed.setTitle(title); // Only add title if provided
        }

        await targetChannel.send({ embeds: [embed] });

        await interaction.reply({
            content: '✅ Announcement sent successfully!',
            ephemeral: true,
        });
    } catch (error) {
        console.error('Error sending announcement:', error);
        await interaction.reply({
            content: '❌ Failed to send the announcement. Please try again later.',
            ephemeral: true,
        });
    }
}
