const { CommandInteraction, Client, PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Manage roles for users')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a role to a user')
                .addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(true))
                .addRoleOption(option => option.setName('role').setDescription('Select a role').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a role from a user')
                .addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(true))
                .addRoleOption(option => option.setName('role').setDescription('Select a role').setRequired(true))
        ),

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */

    run: async (client, interaction) => {
        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');

        // Check if the user has the required role or permission
        const hasSpecialRole = interaction.member.roles.cache.has('1252447421146071082');
        const hasManageRolesPermission = interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles);

        if (!hasSpecialRole && !hasManageRolesPermission) {
            return interaction.reply({ content: 'You do not have permission to manage roles.', ephemeral: true });
        }

        const member = await interaction.guild.members.fetch(user.id);
        const memberHighestRole = interaction.member.roles.highest;
        const targetRole = interaction.guild.roles.cache.get(role.id);

        // Ensure the user cannot manage roles higher than their own highest role
        if (targetRole.position >= memberHighestRole.position) {
            return interaction.reply({ content: 'You cannot manage a role that is equal to or higher than your highest role.', ephemeral: true });
        }

        if (subcommand === 'add') {
            if (member.roles.cache.has(role.id)) {
                return interaction.reply({ content: `User already has the ${role.name} role.`, ephemeral: true });
            }

            await member.roles.add(role);
            return interaction.reply({ content: `${interaction.user} added the ${role.name} role to ${user}.` });
        } else if (subcommand === 'remove') {
            if (!member.roles.cache.has(role.id)) {
                return interaction.reply({ content: `User does not have the ${role.name} role.`, ephemeral: true });
            }

            await member.roles.remove(role);
            return interaction.reply({ content: `${interaction.user} removed the ${role.name} role from ${user}.` });
        }
    },
};
