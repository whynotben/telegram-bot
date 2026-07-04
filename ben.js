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

bot.launch();