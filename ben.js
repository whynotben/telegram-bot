const { Markup } = require("telegraf");

bot.start((ctx) => {
  ctx.reply(
    "Chào mừng!",
    Markup.keyboard([
      ["📌 ID", "👑 Admin"]
    ]).resize()
  );
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