import { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

const canales = {
    'coyote-panzon-blackwather': 'coyote-panzon-blackwather',
    'the-last-hope': 'the-last-hope',
    'fight-club': 'fight-club',
    'armeria-valentine': 'armeria-valentine',
    'armeria-blackwather': 'armeria-blackwather',
    'armeria-saint-denis': 'armeria-saint-denis',
    'destileria-blackwather': 'destileria-blackwather',
    'destileria-valentine': 'destileria-valentine',
    'destileria-ambarino': 'destileria-ambarino',
    'emerald-ranch': 'emerald-ranch',
    'taberna-chica-valentine': 'taberna-chica-valentine',
    'taberna-grande-rhode': 'taberna-grande-rhode',
    'taberna-grande-valentine': 'taberna-grande-valentine',
    'taberna-chica-sanit': 'taberna-chica-sanit',
    'taberna-grande-blackwather': 'taberna-grande-blackwather',
    'hipodromo-thiago': 'hipodromo-thiago',
    'teatro': 'teatro',
    'club-de-boxeo': 'club-de-boxeo',
    'el-guante-dorado': 'el-guante-dorado',
    'hotel-ambarino': 'hotel-ambarino',
    'hotel-saint-denis': 'hotel-saint-denis',
    'la-posada-veronica': 'la-posada-veronica',
    'hotel-rhodes': 'hotel-rhodes',
    'pasteleria-tom': 'pasteleria-tom'
};

// Comandos slash
client.on('ready', async () => {
    console.log(`Bot iniciado: ${client.user.tag}`);
    const data = [
        new SlashCommandBuilder()
            .setName('pedido')
            .setDescription('Crear un nuevo pedido')
            .addStringOption(opt => opt.setName('cliente').setDescription('Nombre del cliente').setRequired(true))
            .addStringOption(opt => opt.setName('establecimiento').setDescription('Selecciona el establecimiento').setRequired(true)
                .addChoices(
                    ...Object.keys(canales).map(name => ({ name, value: name }))
                ))
            .addStringOption(opt => opt.setName('productos').setDescription('Lista de productos y cantidades (ej: Caña de azucar 400; Trigo 200)').setRequired(true))
            .addStringOption(opt => opt.setName('fecha_entrega').setDescription('Fecha de entrega (opcional)'))
    ];

    await client.application.commands.set(data);
});

// Manejo de interacción
client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'pedido') {
            const cliente = interaction.options.getString('cliente');
            const establecimiento = interaction.options.getString('establecimiento');
            const productos = interaction.options.getString('productos').split(';').map(p => p.trim());
            const fechaEntrega = interaction.options.getString('fecha_entrega') || 'No definida';
            const fechaHoy = new Date().toLocaleDateString();

            const embed = new EmbedBuilder()
                .setTitle(`📦 Pedido Nuevo`)
                .setDescription(`**Cliente:** ${cliente}\n**Establecimiento:** ${establecimiento}\n**Productos:**\n${productos.map(p => `• ${p}`).join('\n')}\n**Fecha Pedido:** ${fechaHoy}\n**Fecha Entrega:** ${fechaEntrega}`)
                .setColor(0x00AE86)
                .setFooter({ text: 'Sistema de pedidos', iconURL: client.user.displayAvatarURL() });

            const botones = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('reclamar')
                        .setLabel('Reclamar 📝')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('empaquetado')
                        .setLabel('Empaquetado 📦')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('entregado')
                        .setLabel('Entregado ✅')
                        .setStyle(ButtonStyle.Success)
                );

            const canal = client.channels.cache.find(ch => ch.name === canales[establecimiento]);
            if (canal) {
                await canal.send({ embeds: [embed], components: [botones] });
                await interaction.reply({ content: `Pedido enviado al canal ${establecimiento}`, ephemeral: true });
            } else {
                await interaction.reply({ content: `No se encontró el canal: ${establecimiento}`, ephemeral: true });
            }
        }
    }

    if (interaction.isButton()) {
        const rowComponents = interaction.message.components.map(row => {
            return new ActionRowBuilder().addComponents(
                row.components.map(btn => ButtonBuilder.from(btn))
            );
        });

        if (interaction.customId === 'reclamar') {
            await interaction.update({
                content: `${interaction.user.username} ha reclamado el pedido.`,
                components: rowComponents
            });
        }

        if (interaction.customId === 'empaquetado') {
            await interaction.update({
                content: `El pedido está siendo empaquetado por ${interaction.user.username}.`,
                components: rowComponents
            });
        }

        if (interaction.customId === 'entregado') {
            // Deshabilitar todos los botones
            const disabledRows = interaction.message.components.map(row => {
                const newRow = new ActionRowBuilder();
                newRow.addComponents(
                    row.components.map(btn => ButtonBuilder.from(btn).setDisabled(true))
                );
                return newRow;
            });

            await interaction.update({
                content: `✅ Pedido entregado por ${interaction.user.username}`,
                components: disabledRows
            });
        }
    }
});

client.login(process.env.TOKEN);
