const Discord = require('discord.js');
const ticketSchema = require("../../database/models/tickets");
const ticketChannels = require("../../database/models/ticketChannels");
const { checkUserPerms } = require('../../utils/permissions');

module.exports = async (client, interaction, args) => {
    const data = await ticketSchema.findOne({ Guild: interaction.guild.id });
    const ticketData = await ticketChannels.findOne({ Guild: interaction.guild.id, channelID: interaction.channel.id });

    let type = interaction.isCommand() ? 'editreply' : 'reply';

    if (ticketData) {
        if (interaction.user.id !== ticketData.creator) {
            const hasPerms = await checkUserPerms(client, interaction, [Discord.PermissionsBitField.Flags.ManageMessages]);

            if (!hasPerms) {
                return client.errNormal({
                    error: "You do not have the required permissions!",
                    type: type
                }, interaction);
            }

            if (data) {
                if (!ticketData.claimed || ticketData.claimed === "None") {
                    const ticketCategory = interaction.guild.channels.cache.get(data.Category);

                    if (!ticketCategory) {
                        return client.errNormal({
                            error: "Do the ticket setup!",
                            type: type
                        }, interaction);
                    }

                    if (interaction.channel.parentId === ticketCategory.id) {
                        ticketData.claimed = interaction.user.id;
                        await ticketData.save();

                        return client.simpleEmbed({
                            desc: `You will now be assisted by <@!${interaction.user.id}>`,
                            type: type
                        }, interaction);
                    } else {
                        return client.errNormal({
                            error: "This is not a ticket!",
                            type: type
                        }, interaction);
                    }
                } else {
                    return client.errNormal({
                        error: "This ticket is already claimed!",
                        type: type
                    }, interaction);
                }
            } else {
                return client.errNormal({
                    error: "Ticket data not found!",
                    type: type
                }, interaction);
            }
        } else {
            return client.errNormal({
                error: "You cannot claim your own ticket!",
                type: type
            }, interaction);
        }
    } else {
        return client.errNormal({
            error: "Ticket data not found!",
            type: type
        }, interaction);
    }
};

 