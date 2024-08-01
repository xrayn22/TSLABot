const Discord = require('discord.js');
const ticketSchema = require("../../database/models/tickets");
const ticketChannels = require("../../database/models/ticketChannels");
const ticketMessageConfig = require("../../database/models/ticketMessage");

module.exports = async (client, interaction, args) => {
    try {
        let reason = "Not given";
        if (interaction.options) reason = interaction.options.getString('reason') || "Not given";

        let type = interaction.isCommand() ? 'editreply' : 'reply';

        const existingTicket = await ticketChannels.findOne({ Guild: interaction.guild.id, creator: interaction.user.id, resolved: false });
        if (existingTicket) {
            return client.errNormal({
                error: "Ticket limit reached. 1/1",
                type: interaction.isCommand() ? 'ephemeraledit' : 'ephemeral'
            }, interaction);
        }

        const TicketData = await ticketSchema.findOne({ Guild: interaction.guild.id });
        if (TicketData) {
            const logsChannel = interaction.guild.channels.cache.get(TicketData.Logs);
            const ticketCategory = interaction.guild.channels.cache.get(TicketData.Category);
            const ticketRole = interaction.guild.roles.cache.get(TicketData.Role);
            const role = interaction.guild.roles.cache.find(r => r.id === ticketRole.id);

            try {
                let openTicket = "Thanks for creating a ticket! \nSupport will be with you shortly \n\n🔒 - Close ticket \n✋ - Claim ticket \n📝 - Save transcript \n🔔 - Send a notification";
                const ticketMessageData = await ticketMessageConfig.findOne({ Guild: interaction.guild.id });
                if (ticketMessageData) {
                    openTicket = ticketMessageData.openTicket;
                }

                const row = new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId('Bot_closeticket')
                            .setEmoji('🔒')
                            .setStyle(Discord.ButtonStyle.Primary),
                        new Discord.ButtonBuilder()
                            .setCustomId('Bot_claimticket')
                            .setEmoji('✋')
                            .setStyle(Discord.ButtonStyle.Secondary),
                        new Discord.ButtonBuilder()
                            .setCustomId('Bot_savetranscript')
                            .setEmoji('📝')
                            .setStyle(Discord.ButtonStyle.Success),
                        new Discord.ButtonBuilder()
                            .setCustomId('Bot_sendnotification')
                            .setEmoji('🔔')
                            .setStyle(Discord.ButtonStyle.Danger)
                    );

                // Create the ticket channel and send the message
                const ticketChannel = await interaction.guild.channels.create({
                    name: `ticket-${interaction.user.username}`,
                    type: Discord.ChannelType.GuildText,
                    parent: ticketCategory.id,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [Discord.PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: interaction.user.id,
                            allow: [Discord.PermissionsBitField.Flags.ViewChannel, Discord.PermissionsBitField.Flags.SendMessages],
                        },
                        {
                            id: role.id,
                            allow: [Discord.PermissionsBitField.Flags.ViewChannel, Discord.PermissionsBitField.Flags.SendMessages],
                        }
                    ],
                });

                await ticketChannel.send({
                    content: openTicket,
                    components: [row]
                });

                await ticketChannels.create({
                    Guild: interaction.guild.id,
                    channelID: ticketChannel.id,
                    creator: interaction.user.id,
                    resolved: false
                });

                return client.simpleEmbed({
                    desc: `Ticket created successfully!`,
                    type: type
                }, interaction);

            } catch (err) {
                console.error("Error creating ticket:", err);
                return client.errNormal({
                    error: "An error occurred while creating the ticket. Please try again later.",
                    type: type
                }, interaction);
            }
        } else {
            return client.errNormal({
                error: "Ticket system not set up. Please contact an administrator.",
                type: type
            }, interaction);
        }
    } catch (err) {
        console.error("An unexpected error occurred:", err);
        return client.errNormal({
            error: "An unexpected error occurred. Please try again later.",
            type: 'reply'
        }, interaction);
    }
};