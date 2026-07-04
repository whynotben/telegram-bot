const { Telegraf, Markup } = require("telegraf");
const fs = require("fs");

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_ID = process.env.ADMIN_ID;

const START_TIME = Date.now();
let RULES = "📜 Chưa có nội quy.";

let ADMINS = [];

try {
  ADMINS = JSON.parse(
    fs.readFileSync("admins.json", "utf8")
  );
} catch {
  ADMINS = [
    String(ADMIN_ID),
    "6408918026",
    "6879658839"
  ];
}

function saveAdmins() {
  fs.writeFileSync(
    "admins.json",
    JSON.stringify(ADMINS, null, 2)
  );
}

function isAdmin(id) {
  return ADMINS.includes(String(id));
}

let FB_UIDS = {};

try {
  FB_UIDS = JSON.parse(fs.readFileSync("uids.json", "utf8"));
} catch {}

function saveUIDs() {
  fs.writeFileSync(
    "uids.json",
    JSON.stringify(FB_UIDS, null, 2)
  );
}

async function replyAutoDelete(ctx, text, time = 30000) {
  const msg = await ctx.reply(text);

  try {
    await ctx.deleteMessage();
  } catch {}

  setTimeout(async () => {
    try {
      await ctx.telegram.deleteMessage(
        ctx.chat.id,
        msg.message_id
      );
    } catch {}
  }, time);
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
    return replyAutoDelete(ctx, "Bạn không có quyền.");
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

  ctx.reply("Bot được dev bởi Nguyen Minh Kha.");
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
  if (!isAdmin(ctx.from.id))
    return replyAutoDelete(ctx, "❌ Bạn không có quyền.");
  
  if (!ctx.message.reply_to_message)
    return replyAutoDelete(ctx, "❌ Reply tin nhắn người cần ban.");

  const userId = ctx.message.reply_to_message.from.id;

  try {
    await ctx.banChatMember(userId);
    return replyAutoDelete(ctx, "🚫 Đã ban người dùng.");
  } catch {
    return replyAutoDelete(ctx, "❌ Không thể ban.");
  }
});

bot.command("unban", async (ctx) => {
  if (!isAdmin(ctx.from.id))
    return replyAutoDelete(ctx, "❌ Bạn không có quyền.");
  const args = ctx.message.text.split(" ");

  if (!args[1])
    return ctx.reply("❌ Dùng: /unban ID");

  try {
    await ctx.unbanChatMember(args[1]);
    return replyAutoDelete(ctx, "✅ Đã bỏ ban.");
  } catch {
    return replyAutoDelete(ctx, "❌ Không thể bỏ ban.");
  }
});

bot.command("mute", async (ctx) => {
  if (!isAdmin(ctx.from.id))
    return replyAutoDelete(ctx, "❌ Bạn không có quyền.");
  
  if (!ctx.message.reply_to_message)
    return ctx.reply("❌ Reply tin nhắn người cần mute.");

  const userId = ctx.message.reply_to_message.from.id;

  try {
    await ctx.restrictChatMember(userId, {
      permissions: {}
    });

    return replyAutoDelete(ctx, "🔇 Đã mute người dùng.");
  } catch (error) {
    console.log(error);
    ctx.reply("❌ " + error.message);
  }
});

bot.command("unmute", async (ctx) => {
  if (!isAdmin(ctx.from.id))
    return replyAutoDelete(ctx, "❌ Bạn không có quyền.");
  
  if (!ctx.message.reply_to_message)
    return replyAutoDelete(ctx, "❌ Reply tin nhắn người cần unmute.");

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

    return replyAutoDelete(ctx, "🔊 Đã bỏ mute.");
  } catch {
    return replyAutoDelete(ctx, "❌ Không thể bỏ mute.");
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
  if (!ADMINS.includes(String(ctx.from.id)))
    return replyAutoDelete(ctx, "❌ Bạn không có quyền.");

  const args = ctx.message.text.split(" ");
  const count = parseInt(args[1]);

  if (!count || count < 1)
    return replyAutoDelete(ctx, "❌ Dùng: /clear 10");

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
    return replyAutoDelete(ctx, "❌ Chỉ chủ bot mới dùng được.");

  if (!ctx.message.reply_to_message)
    return replyAutoDelete(ctx, "❌ Reply người cần thêm admin.");

  const user = ctx.message.reply_to_message.from;
  const id = String(user.id);

  if (ADMINS.includes(id))
    return replyAutoDelete(ctx, "⚠️ Người này đã là admin.");

ADMINS.push(id);
saveAdmins();

return replyAutoDelete(ctx, `✅ Đã thêm admin:
👤 ${user.first_name}
🆔 ${id}`);

});

bot.command("deladmin", (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID))
    return replyAutoDelete(ctx, "❌ Chỉ chủ bot mới dùng được.");

  if (!ctx.message.reply_to_message)
    return replyAutoDelete(ctx, "❌ Reply admin cần xoá.");

  const id = String(ctx.message.reply_to_message.from.id);

  if (id === String(ADMIN_ID))
    return replyAutoDelete(ctx, "❌ Không thể xoá chủ bot.");

  ADMINS = ADMINS.filter(x => x !== id);
saveAdmins();

try {
    saveAdmins();
} catch (e) {
    console.log(e);
}

  return replyAutoDelete(ctx, "🗑️ Đã xoá admin.");
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
bot.command("lock", async (ctx) => {
    if (!isAdmin(ctx.from.id))
        return ctx.reply("❌ Bạn không có quyền.");

    try {
        await ctx.telegram.setChatPermissions(ctx.chat.id, {
            can_send_messages: false
        });

        return replyAutoDelete(ctx, "🔒 Chat đã bị khóa.");
    } catch (e) {
        console.log(e);
        ctx.reply("❌ Không thể khóa chat.");
    }
});bot.command("unlock", async (ctx) => {
    if (!isAdmin(ctx.from.id))
        return replyAutoDelete(ctx, "❌ Không thể khóa chat.");

    try {
        await ctx.telegram.setChatPermissions(ctx.chat.id, {
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

       return replyAutoDelete(ctx, "🔒 Chat đã được mở khóa.");
    } catch (e) {
        console.log(e);
         return replyAutoDelete(ctx, "❌ Không thể mở khóa chat.");
    }
});
bot.command("saveuid", async (ctx) => {
  const args = ctx.message.text.split(" ");

  if (!args[1])
    return replyAutoDelete(ctx, "❌ Dùng: /saveuid UID");

  FB_UIDS[String(ctx.from.id)] = args[1];
  saveUIDs();

  return replyAutoDelete(ctx, "✅ Đã lưu UID.");
});
bot.command("checkuid", async (ctx) => {
  let user = ctx.from;

  if (ctx.message.reply_to_message)
    user = ctx.message.reply_to_message.from;

  const uid = FB_UIDS[String(user.id)];

  if (!uid)
    return replyAutoDelete(ctx, "❌ Chưa lưu UID.");

  return replyAutoDelete(
    ctx,
    `🆔 UID Facebook: ${uid}`
  );
});
bot.command("deleteuid", async (ctx) => {
  delete FB_UIDS[String(ctx.from.id)];
  saveUIDs();

  return replyAutoDelete(ctx, "🗑️ Đã xoá UID.");
});
const WARNS = {};
bot.command("warn", async (ctx) => {
  if (!isAdmin(ctx.from.id))
    return replyAutoDelete(ctx, "❌ Bạn không có quyền.");

  if (!ctx.message.reply_to_message)
    return replyAutoDelete(ctx, "❌ Reply người cần cảnh cáo.");

  const user = ctx.message.reply_to_message.from;
  const id = String(user.id);

  WARNS[id] = (WARNS[id] || 0) + 1;

  if (WARNS[id] >= 3) {
    try {
      await ctx.banChatMember(id);

      delete WARNS[id];

      return replyAutoDelete(
        ctx,
        `🚫 ${user.first_name} đã bị ban vì đủ 3 cảnh cáo.`
      );
    } catch {
      return replyAutoDelete(ctx, "❌ Không thể ban.");
    }
  }

  return replyAutoDelete(
    ctx,
    `⚠️ ${user.first_name} hiện có ${WARNS[id]}/3 cảnh cáo.`
  );
});

bot.command("warnings", async (ctx) => {
  let user = ctx.from;

  if (ctx.message.reply_to_message)
    user = ctx.message.reply_to_message.from;

  const count = WARNS[String(user.id)] || 0;

  return replyAutoDelete(
    ctx,
    `⚠️ ${user.first_name}: ${count}/3 cảnh cáo`
  );
});

bot.command("resetwarn", async (ctx) => {
  if (!isAdmin(ctx.from.id))
    return replyAutoDelete(ctx, "❌ Bạn không có quyền.");

  if (!ctx.message.reply_to_message)
    return replyAutoDelete(ctx, "❌ Reply người cần xoá cảnh cáo.");

  const id = String(ctx.message.reply_to_message.from.id);

  delete WARNS[id];

  return replyAutoDelete(
    ctx,
    "✅ Đã xoá toàn bộ cảnh cáo."
  );
});
bot.command("kick", async (ctx) => {
  if (!isAdmin(ctx.from.id))
    return replyAutoDelete(ctx, "❌ Bạn không có quyền.");

  if (!ctx.message.reply_to_message)
    return replyAutoDelete(ctx, "❌ Reply người cần kick.");

  const userId = ctx.message.reply_to_message.from.id;

  try {
    await ctx.banChatMember(userId);
    await ctx.unbanChatMember(userId);

    return replyAutoDelete(
      ctx,
      "👢 Đã kick khỏi nhóm."
    );
  } catch {
    return replyAutoDelete(
      ctx,
      "❌ Không thể kick."
    );
  }
});
bot.command("menu", async (ctx) => {
  const text = `
📋 MENU BOT

👤 Người dùng
/id - Xem ID
/info - Xem thông tin
/menu - Hiện menu

👑 Quản trị
/admin - Kiểm tra quyền admin
/admins - Danh sách admin
/addadmin - Thêm admin
/deladmin - Xóa admin

🛡 Quản lý nhóm
/mute - Mute thành viên
/unmute - Bỏ mute
/ban - Ban thành viên
/unban - Bỏ ban
/kick - Kick khỏi nhóm
/lock - Khóa chat
/unlock - Mở chat
/clear - Xóa chat

⚠️ Cảnh cáo
/warn - Cảnh cáo
/warnings - Xem cảnh cáo
/resetwarn - Xóa cảnh cáo

📊 Tiện ích
/stats
/uptime
/say
/rules
/setrules
/tagadmins
/avatar

📌 Ghim
/pin
/unpin

💘 Vui vẻ
/ship
/roll
/coinflip
/gay
/simp
/cute
/love

  return replyAutoDelete(ctx, text, 15000);
});

bot.command("avatar", async (ctx) => {
  let userId = ctx.from.id;

  if (ctx.message.reply_to_message)
    userId = ctx.message.reply_to_message.from.id;

  try {
    const photos = await ctx.telegram.getUserProfilePhotos(userId);

    if (!photos.total_count)
      return replyAutoDelete(ctx, "❌ Người dùng không có avatar.");

    const fileId = photos.photos[0][0].file_id;

    await ctx.replyWithPhoto(fileId);
  } catch {
    return replyAutoDelete(ctx, "❌ Không lấy được avatar.");
  }
});

bot.command("pin", async (ctx) => {
  if (!isAdmin(ctx.from.id))
    return replyAutoDelete(ctx, "❌ Bạn không có quyền.");

  if (!ctx.message.reply_to_message)
    return replyAutoDelete(ctx, "❌ Reply tin nhắn cần ghim.");

  try {
    await ctx.pinChatMessage(
      ctx.message.reply_to_message.message_id
    );

    return replyAutoDelete(ctx, "📌 Đã ghim tin nhắn.");
  } catch {
    return replyAutoDelete(ctx, "❌ Không thể ghim.");
  }
});

bot.command("unpin", async (ctx) => {
  if (!isAdmin(ctx.from.id))
    return replyAutoDelete(ctx, "❌ Bạn không có quyền.");

  try {
    await ctx.unpinAllChatMessages();

    return replyAutoDelete(ctx, "📌 Đã bỏ ghim.");
  } catch {
    return replyAutoDelete(ctx, "❌ Không thể bỏ ghim.");
  }
});

bot.command("ship", async (ctx) => {
  const percent = Math.floor(Math.random() * 101);

  return replyAutoDelete(
    ctx,
    "💘 " + ctx.from.first_name + " hợp với crush " + percent + "%"
  );
});

const statsText =
"📊 THỐNG KÊ BOT\n\n" +
"👑 Admin bot: " + ADMINS.length + "\n" +
"💾 UID đã lưu: " + Object.keys(FB_UIDS).length + "\n" +
"⚠️ Người bị cảnh cáo: " + Object.keys(WARNS).length + "\n" +
"⏱️ Uptime: " + uptime + "s";

return replyAutoDelete(ctx, statsText);
});

bot.command("say", async (ctx) => {
  if (!isAdmin(ctx.from.id))
    return replyAutoDelete(ctx, "❌ Bạn không có quyền.");

  const text = ctx.message.text.replace("/say ", "");

  if (text === "/say" || !text)
    return replyAutoDelete(ctx, "❌ Dùng: /say nội dung");

  await ctx.reply(text);
});

bot.command("rules", async (ctx) => {
  return replyAutoDelete(ctx, RULES);
});

bot.command("setrules", async (ctx) => {
  if (!isAdmin(ctx.from.id))
    return replyAutoDelete(ctx, "❌ Bạn không có quyền.");

  const text = ctx.message.text.replace("/setrules ", "");

  if (!text || text === "/setrules")
    return replyAutoDelete(ctx, "❌ Dùng: /setrules nội dung");

  RULES = text;

  return replyAutoDelete(ctx, "✅ Đã cập nhật nội quy.");
});

bot.command("uptime", async (ctx) => {
  const sec = Math.floor((Date.now() - START_TIME) / 1000);

  return replyAutoDelete(ctx, "⏱ Uptime: " + sec + " giây");
});

bot.command("tagadmins", async (ctx) => {
  let text = "👑 ADMIN BOT\n\n";

  for (const id of ADMINS) {
    text += "- " + id + "\n";
  }

  return replyAutoDelete(ctx, text);
});

bot.launch();
