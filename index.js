import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} from "discord.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds] // ✅ Solo intents permitidos
});

// Variables de entorno
const TOKEN = process.env.TOKEN;
const CANAL_AUTO_ROLES = process.env.CANAL_AUTO_ROLES; // Canal donde se publicará el mensaje
const ROLES = {
  policia: process.env.ROL_POLICIA,
  bombero: process.env.ROL_BOMBERO,
  ciudadano: process.env.ROL_CIUDADANO
};

client.once("ready", async () => {
  console.log(`🤖 Bot conectado como ${client.user.tag}`);

  // Publicar mensaje de auto roles
  const channel = await client.channels.fetch(CANAL_AUTO_ROLES);
  if (!channel) return console.log("❌ Canal no encontrado.");

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

  // Evitar duplicar mensaje
  const messages = await channel.messages.fetch({ limit: 10 });
  const existe = messages.find(msg => msg.author.id === client.user.id && msg.embeds.length > 0);
  if (!existe) await channel.send({ embeds: [embed], components: [row] });
});

// ----------------------
// Interacciones con botones
// ----------------------
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  const member = interaction.member;
  let roleId;

  if (interaction.customId === "rol_policia") roleId = ROLES.policia;
  if (interaction.customId === "rol_bombero") roleId = ROLES.bombero;
  if (interaction.customId === "rol_ciudadano") roleId = ROLES.ciudadano;

  if (!roleId) return interaction.reply({ content: "❌ Rol no encontrado.", ephemeral: true });

  // Remover otros roles y agregar seleccionado
  const rolesEliminar = Object.values(ROLES).filter(r => r !== roleId);
  await member.roles.remove(rolesEliminar).catch(() => {});
  await member.roles.add(roleId).catch(() => {});

  return interaction.reply({
    content: `✅ Ahora tienes el rol <@&${roleId}>`,
    ephemeral: true
  });
});

client.login(TOKEN);
