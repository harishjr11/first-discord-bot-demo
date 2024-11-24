// userinfo.js - Shows information about a user
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get info about a user')
    .addUserOption(option => 
        option.setName('target')
            .setDescription('The user to get info about')
            .setRequired(false));

export async function execute(interaction) {
    const target = interaction.options.getUser('target') || interaction.user;
    const member = await interaction.guild.members.fetch(target.id);
    
    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('User Information')
        .setThumbnail(target.displayAvatarURL())
        .addFields(
            { name: 'Username', value: target.username, inline: true },
            { name: 'Joined Server', value: member.joinedAt.toDateString(), inline: true },
            { name: 'Account Created', value: target.createdAt.toDateString(), inline: true },
            { name: 'Roles', value: member.roles.cache.map(r => r.name).join(', ') || 'None' }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}