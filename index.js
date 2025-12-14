import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} from "discord.js";

// Crear el cliente con permisos correctos
const client = new Client({
  intents: [GatewayIntentBits.Guilds] // Solo el intent necesario
});

// Variables de entorno (debes configurarlas en Render o GitHub)
const TOKEN = process.env.TOKEN;
const CANAL_AUTO_ROLES = process.env.1449646510089179290; // ID del canal de auto roles
const ROLES = {
  policia: process.env.1449514142477193320, // ID del rol Policía
  bombero: process.env.1449514160508506233, // ID del rol Bombero
  ciudadano: process.env.1449514174836244704 // ID del rol Ciudadano
};

// Evento de "ready" para cuando el bot esté activo
client.once("ready", async () => {
  console.log(`🤖 Bot conectado como ${client.user.tag}`);

  // Obtener el canal de auto roles
  const channel = await client.channels.fetch(CANAL_AUTO_ROLES);
  if (!channel) return console.log("❌ Canal no encontrado.");

  // Crear el embed y los botones
  const embed = new EmbedBuilder()
    .setTitle("🎭 Argentina RP - Auto Roles")
    .setDescription(
      "Selecciona tu rol haciendo clic en el botón correspondiente:\n\n" +
      "• Policía\n" +
      "• Bombero\n" +
      "• Ciudadano"
    )
    .setColor(0x00BFFF)
    .setFooter({ text: "Argentina RP" });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("rol_policia").setLabel("Policía").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("rol_bombero").setLabel("Bombero").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("rol_ciudadano").setLabel("Ciudadano").setStyle(ButtonStyle.Success)
  );

  // Evitar duplicar el mensaje de auto roles
  const messages = await channel.messages.fetch({ limit: 10 });
  const existe = messages.find(msg => msg.author.id === client.user.id && msg.embeds.length > 0);
  if (!existe) await channel.send({ embeds: [embed], components: [row] });
});

// ----------------------
// Manejo de interacciones con los botones
// ----------------------
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  const member = interaction.member;
  let roleId;

  // Determinar el rol según el botón presionado
  if (interaction.customId === "rol_policia") roleId = ROLES.policia;
  if (interaction.customId === "rol_bombero") roleId = ROLES.bombero;
  if (interaction.customId === "rol_ciudadano") roleId = ROLES.ciudadano;

  if (!roleId) return interaction.reply({ content: "❌ Rol no encontrado.", ephemeral: true });

  // Eliminar roles previos y asignar el nuevo rol
  const rolesEliminar = Object.values(ROLES).filter(r => r !== roleId);  // No eliminar el rol seleccionado
  await member.roles.remove(rolesEliminar).catch(() => {});  // Eliminar roles existentes
  await member.roles.add(roleId).catch(() => {});  // Añadir el nuevo rol

  return interaction.reply({
    content: `✅ Ahora tienes el rol <@&${roleId}>`,
    ephemeral: true
  });
});

client.login(TOKEN);
