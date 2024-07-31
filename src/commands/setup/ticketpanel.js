const Discord = require('discord.js');
const ticketSchema = require("../../database/models/tickets");

module.exports = async (client, interaction, args) => {
    const name = interaction.options.getString('name');
    const description = interaction.options.getString('description');
    const panelName = interaction.options.getString('panelName'); // New field for unique panel identifier

    ticketSchema.findOne({ Guild: interaction.guild.id, PanelName: panelName }, async (err, ticketData) => {
        if (err) {
            return client.errNormal({
                error: `An error occurred while fetching the ticket data.`,
                type: 'editreply'
            }, interaction);
        }

        const channel = interaction.guild.channels.cache.get(ticketData ? ticketData.Channel : null);
        const button = new Discord.ButtonBuilder()
            .setCustomId(`Bot_openticket_${panelName}`)
            .setLabel(name)
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji('🎫');

        const row = new Discord.ActionRowBuilder()
            .addComponents(button);

        if (ticketData) {
            // Update existing panel
            client.embed({
                title: name,
                desc: description,
                components: [row]
            }, channel);

            client.succNormal({
                text: `Ticket panel "${panelName}" has been updated successfully!`,
                type: 'editreply'
            }, interaction);
        } else {
            // Create new panel
            const newTicketData = new ticketSchema({
                Guild: interaction.guild.id,
                PanelName: panelName,
                Channel: interaction.channel.id
            });

            await newTicketData.save();

            client.embed({
                title: name,
                desc: description,
                components: [row]
            }, interaction.channel);

            client.succNormal({
                text: `Ticket panel "${panelName}" has been created successfully!`,
                type: 'editreply'
            }, interaction);
        }
    });
};

 