const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, REST, Routes, EmbedBuilder, Events } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: [Partials.Channel]
});

client.once(Events.ClientReady, () => {
    console.log(`Bot iniciado: ${client.user.tag}`);
});

// Comando slash
const commands = [
    new SlashCommandBuilder()
        .setName('pedido')
        .setDescription('Registrar un pedido')
        .addStringOption(option =>
            option.setName('nombre')
                .setDescription('Nombre del cliente')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('establecimiento')
                .setDescription('Nombre del establecimiento')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('productos')
                .setDescription('Productos con cantidad separados por ; ejemplo: cerveza 2; whisky 1')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('fecha')
                .setDescription('Fecha del pedido')
                .setRequired(true))
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Registrando comandos...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('Comando registrado correctamente.');
    } catch (error) {
        console.error(error);
    }
})();

// Escuchar comandos slash
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'pedido') {
        const nombre = interaction.options.getString('nombre');
        const establecimiento = interaction.options.getString('establecimiento');
        const productosRaw = interaction.options.getString('productos');
        const fecha = interaction.options.getString('fecha');

        const productos = productosRaw.split(';').map(p => p.trim());

        const embed = new EmbedBuilder()
            .setTitle('📦 Nuevo Pedido')
            .setDescription(`**Cliente:** ${nombre}\n**Establecimiento:** ${establecimiento}\n**Fecha:** ${fecha}`)
            .addFields({ name: 'Productos', value: productos.join('\n') })
            .setColor('Blue');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('completo').setLabel('✅ Completado').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('cancelado').setLabel('❌ Cancelado').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('pendiente').setLabel('⏳ Pendiente').setStyle(ButtonStyle.Primary)
        );

        try {
            await interaction.reply({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error('Error enviando mensaje:', error);
        }
    }
});

// Escuchar botones
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;

    const embed = interaction.message.embeds[0];
    let nuevoEstado = '';

    switch (interaction.customId) {
        case 'completo':
            nuevoEstado = '✅ Completado';
            break;
        case 'cancelado':
            nuevoEstado = '❌ Cancelado';
            break;
        case 'pendiente':
            nuevoEstado = '⏳ Pendiente';
            break;
    }

    try {
        await interaction.update({ embeds: [EmbedBuilder.from(embed).setFooter({ text: nuevoEstado })], components: interaction.message.components });
    } catch (error) {
        console.error(error);
    }
});

client.login(process.env.TOKEN);
