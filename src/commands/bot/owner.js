const Discord = require('discord.js');

module.exports = async (client, interaction, args) => {
    client.embed({
        title: `📘・Owner information`,
        desc: `____________________________`,
        thumbnail: client.user.avatarURL({ dynamic: true, size: 1024 }),
        fields: [{
            name: "👑┆Owner name",
            value: `Ray`,
            inline: true,
        },
        {
            name: "🏷┆Discord tag",
            value: `xr.ay`,
            inline: true,
        },
        {
            name: "🏢┆Organization",
            value: `TSLA`,
            inline: true,
        },
        {
            name: "🌐┆Website",
            value: `discord.gg/tsla`,
            inline: true,
        }],
        type: 'editreply'
    }, interaction)
}

 