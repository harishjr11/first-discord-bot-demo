// ping.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('balls')
    .setDescription('Replies with bot latency information');


export async function execute(interaction) {
    const startTime = Date.now();
    await interaction.deferReply();
    
    const endTime = Date.now();
    const roundTripLatency = endTime - startTime;
    const wsLatency = interaction.client.ws.ping;

    const pingEmbed = new EmbedBuilder()
        .setTitle('🏓 Pong! nigga')
        .setColor('#00ff00')
        .addFields(
            { 
                name: 'Bot Latency', 
                value: `\`${roundTripLatency}ms\``, 
                inline: true 
            },
            { 
                name: 'WebSocket Latency', 
                value: `\`${wsLatency}ms\``, 
                inline: true 
            }
        )
        .setTimestamp();

    await interaction.editReply({ embeds: [pingEmbed] });
}