import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Get info about the server');

export async function execute(interaction) {
    const { guild } = interaction;
    
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`${guild.name}`)
        .setThumbnail(guild.iconURL())
        .addFields(
            { name: 'Total Members', value: `${guild.memberCount}`, inline: true },
            { name: 'Created On', value: guild.createdAt.toDateString(), inline: true },
            { name: 'Boost Level', value: `${guild.premiumTier}`, inline: true },
            { name: 'Total Roles', value: `${guild.roles.cache.size}`, inline: true }
        )
        .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }