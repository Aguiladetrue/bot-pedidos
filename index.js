require('dotenv').config();
const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const token = process.env.TOKEN;
const guildId = process.env.GUILD_ID;

client.once(Events.ClientReady, () => {
    console.log(`Bot iniciado: ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'pedido') {
        const cliente = interaction.options.getString('cliente');
        const establecimiento = interaction.options.getString('establecimiento');
        const fecha = interaction.options.getString('fecha');
        const productos = [];

        for (let i = 1; i <= 4; i++) {
            const prod = interaction.options.getString(`producto${i}`);
            const cant = interaction.options.getInteger(`cantidad${i}`);
            if (prod && cant) productos.push(`${prod} x${cant}`);
        }

        const canal = interaction.guild.channels.cache.find(ch => ch.name === establecimiento);
        if (!canal) return interaction.reply({ content: '❌ Canal no encontrado', ephemeral: true });

        const botones = new ActionRowBuilder();
        botones.addComponents(
            new ButtonBuilder()
                .setCustomId('tomar_pedido')
                .setLabel('Tomar pedido')
                .setStyle(ButtonStyle.Primary)
        );

        try {
            await canal.send({
                content: `📦 **Pedido Nuevo**\nCliente: ${cliente}\nEstablecimiento: ${establecimiento}\nFecha: ${fecha}\nProductos:\n${productos.join('\n')}`,
                components: [botones]
            });
            await interaction.reply({ content: '✅ Pedido registrado correctamente', ephemeral: true });
        } catch (err) {
            console.error('Error enviando mensaje:', err);
            await interaction.reply({ content: '❌ Error al registrar el pedido', ephemeral: true });
        }
    }
});

client.login(token);
