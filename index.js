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
  intents: [GatewayIntentBits.Guilds] // Solo intents permitidos en Render
});

// =======================
// VARIABLES DE ENTORNO
// =======================
const TOKEN = process.env.TOKEN;
const CANAL_AUTO = process.env.CANAL_AUTO;
const ROL_POLICIA = process.env.ROL_POLICIA;
const ROL_BOMBERO = process.env.ROL_BOMBERO;
const ROL_CIUDADANO = process.env.ROL_CIUDADANO;

// =======================
// CONFIGURACIÓN DE AUTO ROLES
// =======================
const AUTO_ROLES = [
  { rolId: ROL_POLICIA, label: "Policía" },
  { rolId: ROL_BOMBERO, label: "Bombero" },
  { rolId: ROL_CIUDADANO, label: "Ciudadano" }
];

// =======================
// MENSAJE AUTOMÁTICO
// =======================
client.once("ready", async () => {
  console.log(`🤖 Bot conectado como ${client.user.tag}`);

  // Obtener el canal
  const canal = await client.channels.fetch(CANAL_AUTO);
  if (!canal) return console.log(`❌ Canal no encontrado: ${CANAL_AUTO}`);

  // Embed
  const embed = new EmbedBuilder()
    .setTitle("🎭 Argentina RP - Auto Roles")
    .setDescription("Haz clic en un botón para obtener un rol. Solo puedes tener uno a la vez.")
    .setColor(0x00BFFF)
    .setFooter({ text: "Argentina RP" });

  // Botones
  const row = new ActionRowBuilder().addComponents(
    AUTO_ROLES.map(role =>
      new ButtonBuilder()
        .setCustomId(`rol_${role.label.toLowerCase()}`)
        .setLabel(role.label)
        .setStyle(ButtonStyle.Primary)
    )
  );

  // Evitar duplicar mensajes
  const messages = await canal.messages.fetch({ limit: 10 });
  const existe = messages.find(
    msg => msg.author.id === client.user.id && msg.embeds.length > 0
  );
  if (!existe) await canal.send({ embeds: [embed], components: [row] });
});

// =======================
// MANEJO DE BOTONES
// =======================
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  const member = interaction.member;

  // Buscar rol correspondiente al botón
  const config = AUTO_ROLES.find(c => interaction.customId === `rol_${c.label.toLowerCase()}`);
  if (!config) return interaction.reply({ content: "❌ Rol no encontrado.", ephemeral: true });

  // Eliminar roles anteriores y asignar el nuevo
  const rolesEliminar = AUTO_ROLES.map(r => r.rolId).filter(r => r !== config.rolId);
  await member.roles.remove(rolesEliminar).catch(() => {});
  await member.roles.add(config.rolId).catch(() => {});

  return interaction.reply({
    content: `✅ Ahora tienes el rol <@&${config.rolId}>`,
    ephemeral: true
  });
});

client.login(TOKEN);

