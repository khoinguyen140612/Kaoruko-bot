// index.js
import dotenv from "dotenv";
dotenv.config();

import { Client, GatewayIntentBits } from "discord.js";
import { REST, Routes, SlashCommandBuilder } from 'discord.js';

// -------------------------
// Khởi tạo bot Discord
// -------------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: ['CHANNEL'], // để bot nhận DM
});


//--------------------------
//Sự kiện bot online/Status
//--------------------------
import { ActivityType } from "discord.js";

// Manual / Auto setup
let manualOverride = false;
let manualStatus = {
  name: 'Chào mừng Đại hội Đảng toàn quốc lần thứ XIV.🇻🇳',
  type: ActivityType.Watching,
  status: 'online'
};

const autoStatuses = [
  { name: 'đi chơi cùng Rintarou!', type: ActivityType.Playing, status: 'dnd' },
  { name: 'nhạc cực chill nè:)', type: ActivityType.Listening, status: 'idle' },
  { name: 'TV cùng em trai.', type: ActivityType.Watching, status: 'online' },
  { name: 'quýnh lộn lời nói của cô giáo cùng những người bạn🔥', type: ActivityType.Competing, status: 'online' },
];

// -------------------------
// Sự kiện bot sẵn sàng
// -------------------------
let statusEnabled = true;
let statusInterval = null;
function startAutoStatus() {
  if (statusInterval) clearInterval(statusInterval);
  if (!statusEnabled) return;

  let i = 0;
  const update = () => {
    if (!manualOverride && statusEnabled) {
      const current = autoStatuses[i];
      client.user.setPresence({
        activities: [{ name: current.name, type: current.type }],
        status: current.status,
      });
      console.log(`✨ Auto status: ${current.name}`);
      i = (i + 1) % autoStatuses.length;
    }
  };

  update();
  statusInterval = setInterval(update, 30 * 60 * 1000);
  }

// -------------------------
// Command bật/tắt manual
// -------------------------
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;  
  if (!message.content.startsWith("*")) return;
  const args = message.content.slice(1).split(" ");
  const cmd = args.shift().toLowerCase();
// ===== CHECK DEV (trừ lệnh *ping) ==========================================
  const devIds = process.env.DEV_IDS?.split(",") || [];

  if (cmd !== "ping" && !devIds.includes(message.author.id)) {
    return message.reply("🛑 Nói nè chỉ dev mới dùng được thôi à~");
  }

// Status thủ công
  if (cmd === "manual") {
    manualOverride = true;
    if (args.length > 0) manualStatus.name = args.join(" ");
    client.user.setPresence({
      activities: [{ name: manualStatus.name, type: manualStatus.type }],
      status: manualStatus.status
    });
    message.reply(`✅ Đang giữ status thủ công nha~: ${manualStatus.name}`);
  }

// Status tự động
  if (cmd === "auto") {
    manualOverride = false;
    message.reply("✅ Quay lại chế độ tự động rồi đó!");
  }
// Set status
    if (cmd === "setstatus") {
    if (args.length === 0) return message.reply("❌ Dùng: *setstatus <tên status>");
    manualStatus.name = args.join(" ");
    client.user.setPresence({
      activities: [{ name: manualStatus.name, type: manualStatus.type }],
      status: manualStatus.status
    });
    message.reply(`✅ Đã cập nhật status thủ công rùi á: ${manualStatus.name}`);
  }

  // 🔕 Tắt hoàn toàn status
  if (cmd === "offstatus") {
    statusEnabled = false;
    manualOverride = false;
    clearInterval(statusInterval);
    client.user.setPresence({ activities: [], status: "online" });
    message.reply("🔇 Đã tắt toàn bộ status rùi nha~");
  }

  // 🔔 Bật lại auto status
  if (cmd === "onstatus") {
    statusEnabled = true;
    manualOverride = false;
    startAutoStatus();
    message.reply("🔔 Đã bật lại chế độ status tự động rùi ngen!");
    return;
  }
// ===== CHECK =====
if (cmd === "check") {
  const count = client.guilds.cache.size;
  const embed = {
    color: 0xFFC0CB,
    title: "📊 Thống kê hoạt động",
    description: `Hiện tại bot đang tham gia...?? À ra là **${count}** máy chủ.`,
    footer: { text: `Yêu cầu bởi ${message.author.tag}` },
    timestamp: new Date()
  };
  return message.reply({ embeds: [embed] });
}

// ===== PING =====
if (cmd === "ping") {
  const msg = await message.reply("🏓 Đang đo ping...");
  const latency = msg.createdTimestamp - message.createdTimestamp;
  const apiLatency = Math.round(client.ws.ping);

  const embed = {
    color: 0x87CEEB,
    title: "📡 Ping hiện tại",
    fields: [
      { name: "⏱️ Độ trễ tin nhắn", value: `${latency}ms`, inline: true },
      { name: "🌐 Độ trễ API Discord", value: `${apiLatency}ms`, inline: true }
    ],
    footer: { text: `Yêu cầu bởi ${message.author.tag}` },
    timestamp: new Date()
  };

  return msg.edit({ content: "", embeds: [embed] });
}
});  

//--------Bot sẵn sàng--------
client.on("ready", () => {
  console.log(`🌸 Kaoruko đã sẵn sàng rùi nè! (${client.user.tag})`);
  startAutoStatus(); // chạy auto ngay khi online
});



// -------------------------
// Tạo lệnh Slash
// -------------------------
const commands = [
  new SlashCommandBuilder()
    .setName('sendmessage')
    .setDescription('Gửi tin nhắn cùng rất nhìu tùy chọn nha~')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Cái này để chọn kênh gửi tin nhắn đến đó~')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('content')
        .setDescription('Cái này là "tin nhắn thường" không phải embed á nha~')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Tiêu đề embed (là cái dòng ở trên cùng ngen)')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Nội dung embed (là cái ở dưới tiêu đề á)')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('color')
        .setDescription('Màu embed (vd: #ff0000 ghi xanh đỏ tím vàng tui không nhận đâu à nha~)')
        .setRequired(false)
    )
    .addAttachmentOption(option =>
      option.setName('attachment')
        .setDescription('File đính kèm (thêm ảnh hoặc tệp gì đó chẳng hạn)')
        .setRequired(false)
    )
    .toJSON()
];


const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

if (process.env.REGISTER_COMMANDS === "true") {
  (async () => {
    try {
      console.log('🚀 Đang đăng ký lệnh slash global...');
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
      );
      console.log('✅ Đã đăng ký xong lệnh slash rùi đó nha~');
    } catch (err) {
      console.error(err);
    }
  })();
}


// -------------------------
// Xử lý lệnh slash
// -------------------------
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'sendmessage') {
  await interaction.deferReply({ ephemeral: true });
  const channel = interaction.options.getChannel('channel');
  const content = interaction.options.getString('content');
  const title = interaction.options.getString('title');
  const description = interaction.options.getString('description');
  const colorInput = interaction.options.getString('color');
  const attachment = interaction.options.getAttachment('attachment');

  let embed = null;

// ===== VALIDATE COLOR (ff0000 hoặc #ff0000) =====
let color = 0xFFC0CB; // màu mặc định

if (colorInput) {
  let hex = colorInput.startsWith("#")
    ? colorInput.slice(1)
    : colorInput;

  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
    return interaction.editReply(
      "❌ Màu embed phải là `RRGGBB` hoặc `#RRGGBB` nha~ (vd:ff0000 hoặc #ff0000)"
    );
  }

  color = parseInt(hex, 16);
}

// ===== TẠO EMBED =====
if (title || description) {
  embed = {
    title: title ?? undefined,
    description: description ?? undefined,
    color: color
  };
}


  if (!content && !embed && !attachment) {
  return interaction.editReply(
    "❌ Bạn phải nhập content, embed hoặc file chứ:(."
  );
}


 try {
  await channel.send({
    content: content ?? undefined,
    embeds: embed ? [embed] : [],
    files: attachment ? [attachment] : []
  });

  await interaction.editReply(
    `✅ Đã gửi tin nhắn đến ${channel} rùi nè:)`
  );
} catch (err) {
  console.error("❌ Lỗi gửi tin nhắn:", err);
  await interaction.editReply(
    "❌ Không gửi được tin nhắn:( (có thể tui thiếu quyền ở kênh này)"
  );
}


}
});



// -------------------------------
// Ngăn bot crash vì lỗi promise
// -------------------------------
client.on("error", (err) => {
  console.error("❗ Lỗi client Discord:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("⚠️ Promise bị reject mà không bắt:", reason);
});


// -------------------------
// Login Discord
// -------------------------
client.login(process.env.DISCORD_TOKEN);

// -------------------------
// Giữ cho Render không ngủ 😴
// -------------------------
import express from "express";
const app = express();

app.get("/", (req, res) => res.send("Kaoruko đang hoạt động! 💖"));
app.listen(3000, () => console.log("🌐 Web server chạy ở cổng 3000 để giữ bot online"));
