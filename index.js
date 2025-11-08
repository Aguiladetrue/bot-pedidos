import { Client, GatewayIntentBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, Events } from 'discord.js';
import 'dotenv/config';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, c => {
    console.log(`Bot iniciado: ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {

    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'pedido') {
            const nombre = interaction.options.getString('nombre');
            const establecimiento = interaction.options.getString('establecimiento');
            const pedidos = interaction.options.getString('pedidos');
            const fecha = new Date().toLocaleDateString();

            await interaction.deferReply({ ephemeral: true });

            const canal = interaction.guild.channels.cache.find(c => c.name === establecimiento);
            if (!canal) return interaction.editReply({ content: `❌ No se encontró el canal "${establecimiento}"` });

            const embed = new EmbedBuilder()
                .setTitle('📦 Pedido Nuevo')
                .setDescription(`**Cliente:** ${nombre}\n**Establecimiento:** ${establecimiento}\n**Pedidos:**\n${pedidos.replace(/;/g, '\n')}\n**Fecha:** ${fecha}`)
                .setColor('Blue');

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('reclamar').setLabel('Reclamar').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('empaquetado').setLabel('Empaquetado').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('entregado').setLabel('Entregado').setStyle(ButtonStyle.Success),
                );

            await canal.send({ embeds: [embed], components: [row] });
            await interaction.editReply({ content: `✅ Pedido enviado al canal ${canal.name}` });
        }
    }

    if (interaction.isButton()) {
        const embed = interaction.message.embeds[0];
        const newRow = ActionRowBuilder.from(interaction.message.components[0]);

        const index = newRow.components.findIndex(b => b.data.custom_id === interaction.customId);
        newRow.components[index].setDisabled(true);

        let status = '';
        if (interaction.customId === 'reclamar') status = '🟡 Pedido reclamado';
        if (interaction.customId === 'empaquetado') status = '🟠 Pedido empaquetado';
        if (interaction.customId === 'entregado') status = '✅ Pedido entregado';

        const newEmbed = EmbedBuilder.from(embed).setFooter({ text: status });

        await interaction.update({ embeds: [newEmbed], components: [newRow] });
    }
});

client.login(process.env.DISCORD_TOKEN);
