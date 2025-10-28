import {
  getAffection,
  setAffection,
  resetAffection,
} from "../modules/affectionSystem.js";

export async function handleCommand(message) {
  const args = message.content.trim().split(" ");
  const command = args[0].toLowerCase();

  // ✅ !affection — xem mức độ thân thiết của bản thân
  if (command === "!affection") {
    const affection = getAffection(message.author.id);
    return message.reply(`🌸 Mức độ thân thiết của bạn là: **${affection}/10**`);
  }

  // ✅ !check — xem thông tin cơ bản của bot
  if (command === "!check") {
    return message.reply(
      `🤖 Bot hiện đang hoạt động trong **${message.client.guilds.cache.size}** server.\nPing hiện tại: **${message.client.ws.ping}ms**`
    );
  }

  // ✅ !dev <userId> <level>
  if (command === "!dev") {
    if (message.author.id !== process.env.DEV_ID) {
      return message.reply("❌ Bạn không có quyền dùng lệnh này.");
    }
    const userId = args[1];
    const level = parseInt(args[2]);
    if (!userId || isNaN(level))
      return message.reply("⚙️ Cú pháp: `!dev <userId> <level>`");

    setAffection(userId, level);
    return message.reply(`✅ Đã chỉnh mức độ thân thiết của <@${userId}> thành **${level}/10**`);
  }

  // ✅ !reset [@user hoặc all]
  if (command === "!reset") {
    if (message.author.id !== process.env.DEV_ID) {
      return message.reply("❌ Bạn không có quyền dùng lệnh này.");
    }

    const mention = message.mentions.users.first();
    if (mention) {
      resetAffection(mention.id);
      return message.reply(`♻️ Đã reset dữ liệu của ${mention.username}`);
    } else if (args[1] === "all") {
      resetAffection();
      return message.reply("♻️ Đã reset toàn bộ dữ liệu thân thiết!");
    } else {
      return message.reply("⚙️ Dùng `!reset @user` hoặc `!reset all`");
    }
  }
}
