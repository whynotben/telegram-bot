const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply("Bot đang hoạt động"));

bot.on("text", (ctx) => {
  ctx.reply(`Bạn nói: ${ctx.message.text}`);
});

bot.launch();