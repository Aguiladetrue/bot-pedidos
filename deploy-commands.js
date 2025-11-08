import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import 'dotenv/config';

const commands = [
    new SlashCommandBuilder()
        .setName('pedido')
        .setDescription('Registrar un nuevo pedido')
        .addStringOption(option =>
            option.setName('nombre')
                .setDescription('Nombre del cliente')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('establecimiento')
                .setDescription('Selecciona el establecimiento')
                .setRequired(true)
                .addChoices(
                    { name: 'coyote-panzon-blackwather', value: 'coyote-panzon-blackwather' },
                    { name: 'the-last-hope', value: 'the-last-hope' },
                    { name: 'fight-club', value: 'fight-club' },
                    { name: 'armeria-valentine', value: 'armeria-valentine' },
                    { name: 'armeria-blackwather', value: 'armeria-blackwather' },
                    { name: 'armeria-saint-denis', value: 'armeria-saint-denis' },
                    { name: 'destileria-blackwather', value: 'destileria-blackwather' },
                    { name: 'destileria-valentine', value: 'destileria-valentine' },
                    { name: 'destileria-ambarino', value: 'destileria-ambarino' },
                    { name: 'emerald-ranch', value: 'emerald-ranch' },
                    { name: 'taberna-chica-valentine', value: 'taberna-chica-valentine' },
                    { name: 'taberna-grande-rhode', value: 'taberna-grande-rhode' },
                    { name: 'taberna-grande-valentine', value: 'taberna-grande-valentine' },
                    { name: 'taberna-chica-sanit', value: 'taberna-chica-sanit' },
                    { name: 'taberna-grande-blackwather', value: 'taberna-grande-blackwather' },
                    { name: 'hipodromo-thiago', value: 'hipodromo-thiago' },
                    { name: 'teatro', value: 'teatro' },
                    { name: 'club-de-boxeo', value: 'club-de-boxeo' },
                    { name: 'el-guante-dorado', value: 'el-guante-dorado' },
                    { name: 'hotel-ambarino', value: 'hotel-ambarino' },
                    { name: 'hotel-saint-denis', value: 'hotel-saint-denis' },
                    { name: 'la-posada-veronica', value: 'la-posada-veronica' },
                    { name: 'hotel-rhodes', value: 'hotel-rhodes' },
                    { name: 'pasteleria-tom', value: 'pasteleria-tom' },
                ))
        .addStringOption(option =>
            option.setName('pedidos')
                .setDescription('Lista de productos y cantidad separados por ; (Ej: Coca:2;Pizza:1)')
                .setRequired(true))
        .toJSON()
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

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
