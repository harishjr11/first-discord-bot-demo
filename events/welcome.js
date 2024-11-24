import { Events, EmbedBuilder } from 'discord.js';
import { getWelcomeSettings } from '../commands/welcomeconfig.js';

let invitesCache = new Map();  // Cache to store invites for the guilds

export default {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const guild = member.guild;
        const settings = getWelcomeSettings(guild.id);
        if (!settings) return; // No welcome message configured

        // Fetch the invites for the guild
        const invites = await guild.invites.fetch();

        // Check if we have any previous invite data for the server
        const oldInvites = invitesCache.get(guild.id);

        // If there's no previous invites, just set the current one
        if (!oldInvites) {
            invitesCache.set(guild.id, invites);
            return;
        }

        // Compare the old and new invites to see which one was used
        const usedInvite = invites.find(inv => !oldInvites.has(inv.code) || oldInvites.get(inv.code).uses < inv.uses);

        let inviterName = 'Unknown'; // Default if no inviter found
        if (usedInvite) {
            // Get the inviter from the used invite
            const inviter = usedInvite.inviter;
            inviterName = inviter ? inviter.tag : 'Unknown'; // Fallback if no inviter
        }

        // Prepare the welcome message
        const channel = await guild.channels.fetch(settings.channelId);
        if (!channel) return; // Channel was deleted or bot can't access it

        const formattedMessage = settings.message
            .replace('{user}', member.user)
            .replace('{server}', guild.name)
            .replace('{inviter}', inviterName); // Include inviter in the message

        // Send the message
        if (settings.useEmbed) {
            const embed = new EmbedBuilder()
                .setColor(settings.color)
                .setDescription(formattedMessage)
                .setTimestamp()
                .setThumbnail(member.user.displayAvatarURL());

            await channel.send({ embeds: [embed] });
        } else {
            await channel.send(formattedMessage);
        }

        // Update the cache with the current invites
        invitesCache.set(guild.id, invites);
    },
};
