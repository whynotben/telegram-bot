const { Telegraf, Markup } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_ID = process.env.ADMIN_ID;

let ADMINS = [String(ADMIN_ID)];

function isAdmin(id) {
  return ADMINS.includes(String(id));
}

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
if (!isAdmin(ctx.from.id)) {
    return ctx.reply("Bạn không có quyền.");
  }

  ctx.reply("Xin chào chủ bot.");
});

bot.hears("📌 ID", (ctx) => {
  ctx.reply(`ID của bạn: ${ctx.from.id}`);
});

bot.hears("👑 Admin", (ctx) => {
  if (!isAdmin(ctx.from.id)) {
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
  } catch (error) {
    console.log(error);
    ctx.reply("❌ " + error.message);
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
const path = require("path");

bot.on("new_chat_members", async (ctx) => {
  const newMembers = ctx.message.new_chat_members;

  for (const user of newMembers) {
    await ctx.replyWithPhoto(
      {
        source: path.join(__dirname, "vk.JPG")
      },
      {
        caption:
`🎉 Xin chào ${user.first_name}!

👋 Chào mừng bạn đến với nhóm.
🆔 ID: ${user.id}
📛 Username: @${user.username || "Không có"}`
      }
    );
  }
});
bot.on("left_chat_member", async (ctx) => {
  const user = ctx.message.left_chat_member;

  await ctx.reply(
    `🚪 ${user.first_name} đã rời nhóm.

😅 Có vẻ họ không chịu nổi độ hài hước ở đây.`
  );
});
bot.hears(/dễ thương/i, async (ctx) => {
  const replies = [
    "🥺 Tui biết Vân Anh dễ thương mò.",
    "💖 Chuyện đó ai cũng biết mà.",
    "✨ Vân Anh dễ thương là sự thật hiển nhiên.",
    "🥰 Khỏi cần nhắc, ai cũng công nhận."
  ];

  const random = replies[Math.floor(Math.random() * replies.length)];
  await ctx.reply(random);
});
bot.command("love", (ctx) => {
  const percent = Math.floor(Math.random() * 101);

  ctx.reply(`💘 Tỷ lệ có người yêu của ${ctx.from.first_name}: ${percent}%`);
});
bot.command("clear", async (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID))
    return ctx.reply("❌ Bạn không có quyền.");

  const args = ctx.message.text.split(" ");
  const count = parseInt(args[1]);

  if (!count || count < 1)
    return ctx.reply("❌ Dùng: /clear 10");

  try {
    const currentId = ctx.message.message_id;

    for (let i = 0; i <= count; i++) {
      try {
        await ctx.telegram.deleteMessage(
          ctx.chat.id,
          currentId - i
        );
      } catch {}
    }
  } catch {
    ctx.reply("❌ Không thể xóa.");
  }
});
bot.command("addadmin", (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID))
    return ctx.reply("❌ Chỉ chủ bot mới dùng được.");

  if (!ctx.message.reply_to_message)
    return ctx.reply("❌ Reply người cần thêm admin.");

  const user = ctx.message.reply_to_message.from;
  const id = String(user.id);

  if (ADMINS.includes(id))
    return ctx.reply("⚠️ Người này đã là admin.");

ADMINS.push(id);

ctx.reply(`✅ Đã thêm admin:
👤 ${user.first_name}
🆔 ${id}`);

});

bot.command("deladmin", (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID))
    return ctx.reply("❌ Chỉ chủ bot mới dùng được.");

  if (!ctx.message.reply_to_message)
    return ctx.reply("❌ Reply admin cần xoá.");

  const id = String(ctx.message.reply_to_message.from.id);

  if (id === String(ADMIN_ID))
    return ctx.reply("❌ Không thể xoá chủ bot.");

  ADMINS = ADMINS.filter(x => x !== id);
  saveAdmins();

  ctx.reply("🗑️ Đã xoá admin.");
});

bot.command("admins", async (ctx) => {
  if (!isAdmin(ctx.from.id))
    return ctx.reply("❌ Bạn không có quyền.");

  let text = "👑 DANH SÁCH ADMIN BOT\n\n";

  for (const id of ADMINS) {
    text += `• ${id}\n`;
  }

  ctx.reply(text);
});

bot.launch();
