const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
// Assuming you have a MongoDB model set up for bans called 'Ban'
const Ban = require('../models/Ban');

module.exports = {
    register_command: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the ban')),
    async execute(client, interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            await interaction.guild.members.ban(target, { reason });

            // Log ban to MongoDB
            const ban = new Ban({
                userId: target.id,
                moderatorId: interaction.user.id,
                reason: reason,
                timestamp: Date.now()
            });
            await ban.save();

            await interaction.reply(`${target.tag} has been banned. Reason: ${reason}`);
        } catch (error) {
            console.error(error);
            await interaction.reply(`Failed to ban ${target.tag}`);
        }
    },
};