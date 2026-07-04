const { Telegraf, Markup } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_ID = process.env.ADMIN_ID;

bot.start((ctx) => {
  ctx.reply(
    "Chào mừng!",
    Markup.keyboard([
      ["📌 ID", "👑 Admin"]
    ]).resize()
  );
});

bot.command("id", (ctx) => {
  let user;

  if (ctx.message.reply_to_message) {
    user = ctx.message.reply_to_message.from;
  } else {
    user = ctx.from;
  }

  ctx.reply(
    "🆔 ID: " + user.id +
    "\n👤 Tên: " + (user.first_name || "Không có") +
    "\n📛 Username: @" + (user.username || "Không có")
  );
});

bot.command("admin", (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID)) {
    return ctx.reply("Bạn không có quyền.");
  }

  ctx.reply("Xin chào chủ bot.");
});

bot.hears("📌 ID", (ctx) => {
  ctx.reply(`ID của bạn: ${ctx.from.id}`);
});

bot.hears("👑 Admin", (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID)) {
    return ctx.reply("Bạn không có quyền.");
  }

  ctx.reply("Xin chào chủ bot.");
});
bot.command("info", async (ctx) => {
  let user;

  if (ctx.message.reply_to_message) {
    user = ctx.message.reply_to_message.from;
  } else {
    user = ctx.from;
  }

  let text =
    "👤 Tên: " + (user.first_name || "Không có") +
    "\n🆔 ID: " + user.id +
    "\n📛 Username: @" + (user.username || "Không có");

  try {
    const member = await ctx.telegram.getChatMember(ctx.chat.id, user.id);

    if (member.status === "creator") {
      text += "\n👑 Chủ nhóm";
    } else if (member.status === "administrator") {
      text += "\n🛡 Admin";
    } else if (member.status === "member") {
      text += "\n👤 Thành viên";
    } else if (member.status === "restricted") {
      text += "\n🔇 Đang bị mute";
    } else if (member.status === "kicked") {
      text += "\n🚫 Đã bị ban";
    }
  } catch (e) {}

  ctx.reply(text);
});

bot.command("ban", async (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID))
    return ctx.reply("❌ Bạn không có quyền.");

  if (!ctx.message.reply_to_message)
    return ctx.reply("❌ Reply tin nhắn người cần ban.");

  const userId = ctx.message.reply_to_message.from.id;

  try {
    await ctx.banChatMember(userId);
    ctx.reply("🚫 Đã ban người dùng.");
  } catch {
    ctx.reply("❌ Không thể ban.");
  }
});

bot.command("unban", async (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID))
    return ctx.reply("❌ Bạn không có quyền.");

  const args = ctx.message.text.split(" ");

  if (!args[1])
    return ctx.reply("❌ Dùng: /unban ID");

  try {
    await ctx.unbanChatMember(args[1]);
    ctx.reply("✅ Đã bỏ ban.");
  } catch {
    ctx.reply("❌ Không thể bỏ ban.");
  }
});

bot.command("mute", async (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID))
    return ctx.reply("❌ Bạn không có quyền.");

  if (!ctx.message.reply_to_message)
    return ctx.reply("❌ Reply tin nhắn người cần mute.");

  const userId = ctx.message.reply_to_message.from.id;

  try {
    await ctx.restrictChatMember(userId, {
      permissions: {}
    });

    ctx.reply("🔇 Đã mute người dùng.");
  } catch {
    ctx.reply("❌ Không thể mute.");
  }
});

bot.command("unmute", async (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID))
    return ctx.reply("❌ Bạn không có quyền.");

  if (!ctx.message.reply_to_message)
    return ctx.reply("❌ Reply tin nhắn người cần unmute.");

  const userId = ctx.message.reply_to_message.from.id;

  try {
    await ctx.restrictChatMember(userId, {
      can_send_messages: true,
      can_send_audios: true,
      can_send_documents: true,
      can_send_photos: true,
      can_send_videos: true,
      can_send_video_notes: true,
      can_send_voice_notes: true,
      can_send_polls: true,
      can_send_other_messages: true,
      can_add_web_page_previews: true,
      can_change_info: false,
      can_invite_users: true,
      can_pin_messages: false
    });

    ctx.reply("🔊 Đã bỏ mute.");
  } catch {
    ctx.reply("❌ Không thể bỏ mute.");
  }
});

bot.launch();
