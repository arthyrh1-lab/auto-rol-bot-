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
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

// IDs de roles y canal (modificalos según tu servidor)
const ROLES = {
  policia: "1449514142477193320",
  bombero: "1449514160508506233",
  ciudadano: "1449514174836244704"
};

const CANAL_AUTO_ROLES = "1449646510089179290"; // canal donde se publicará el mensaje

client.once("ready", async () => {
  console.log(`🤖 Bot conectado como ${client.user.tag}`);

  // Publicar mensaje de auto roles al iniciar (solo si no está ya)
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

  // Enviar el mensaje solo si no hay mensaje previo (evita duplicados)
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

  // Remover los otros roles
  const rolesEliminar = Object.values(ROLES).filter(r => r !== roleId);
  await member.roles.remove(rolesEliminar).catch(() => {});
  // Agregar el rol seleccionado
  await member.roles.add(roleId).catch(() => {});

  return interaction.reply({
    content: `✅ Ahora tienes el rol <@&${roleId}>`,
    ephemeral: true
  });
});

client.login(process.env.TOKEN);
