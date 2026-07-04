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
  ctx.reply(`ID của bạn: ${ctx.from.id}`);
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
bot.command("info", (ctx) => {
  const user = ctx.from;

  ctx.reply(
    "👤 Tên: " + (user.first_name || "") +
    "\n🆔 ID: " + user.id +
    "\n📛 Username: @" + (user.username || "Không có")
  );
});
bot.command("ban", async (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID))
    return ctx.reply("Bạn không có quyền.");

  if (!ctx.message.reply_to_message)
    return ctx.reply("Reply vào người cần ban.");

  const userId = ctx.message.reply_to_message.from.id;

  await ctx.banChatMember(userId);

  ctx.reply("Đã ban người dùng.");
});

bot.command("mute", async (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID))
    return ctx.reply("Bạn không có quyền.");

  if (!ctx.message.reply_to_message)
    return ctx.reply("Reply vào người cần mute.");

  const userId = ctx.message.reply_to_message.from.id;

  await ctx.restrictChatMember(userId, {
    permissions: {}
  });

  ctx.reply("Đã mute người dùng.");
});

bot.launch();
