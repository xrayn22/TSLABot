const Discord = require('discord.js');
const ticketSchema = require("../../database/models/tickets");

module.exports = async (client, interaction, args) => {
    const category = interaction.options.getChannel('category');
    const role = interaction.options.getRole('role');
    const channel = interaction.options.getChannel('channel');
    const logs = interaction.options.getChannel('logs');
    const panelName = interaction.options.getString('panelName'); // New field for unique panel identifier

    ticketSchema.findOne({ Guild: interaction.guild.id, PanelName: panelName }, async (err, data) => {
        if (data) {
            data.Category = category.id;
            data.Role = role.id;
            data.Channel = channel.id;
            data.Logs = logs.id;
            data.save();
        } else {
            new ticketSchema({
                Guild: interaction.guild.id,
                PanelName: panelName,
                Category: category.id,
                Role: role.id,
                Channel: channel.id,
                Logs: logs.id
            }).save();
        }
    });

    client.succNormal({
        text: `Ticket panel "${panelName}" has been set up successfully!`,
        type: 'editreply'
    }, interaction);
}

 