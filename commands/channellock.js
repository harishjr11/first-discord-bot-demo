import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export const lockCommand = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a channel to prevent members from sending messages')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('The channel to lock (defaults to current channel)')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for locking the channel')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        content: '❌ I don\'t have permission to manage this channel!',
        ephemeral: true,
      });
    }

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: false,
      }, { reason: `${reason} - By ${interaction.user.tag}` });

      const embed = new EmbedBuilder()
        .setTitle('🔒 Channel Locked')
        .setDescription(`${channel} has been locked by ${interaction.user}`)
        .setColor('#FF0000')
        .addFields({ name: 'Reason', value: reason })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `❌ Failed to lock the channel: ${error.message}`,
        ephemeral: true,
      });
    }
  },
};

export const unlockCommand = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a channel to allow members to send messages')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('The channel to unlock (defaults to current channel)')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for unlocking the channel')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        content: '❌ I don\'t have permission to manage this channel!',
        ephemeral: true,
      });
    }

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: null,
      }, { reason: `${reason} - By ${interaction.user.tag}` });

      const embed = new EmbedBuilder()
        .setTitle('🔓 Channel Unlocked')
        .setDescription(`${channel} channel has been unlocked by ${interaction.user}`)
        .setColor('#00FF00')
        .addFields({ name: 'Reason', value: reason })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `❌ Failed to unlock the channel: ${error.message}`,
        ephemeral: true,
      });
    }
  },
};
