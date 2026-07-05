const { Telegraf, Markup, Input } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_ID = process.env.ADMIN_ID;
const fs = require("fs");
const path = require("path");
const axios = require("axios");


let TEMP_MAILS = {};

try {
  TEMP_MAILS = JSON.parse(
    fs.readFileSync("mails.json", "utf8")
  );
} catch {
  TEMP_MAILS = {};
}

function saveMails() {
  fs.writeFileSync(
    "mails.json",
    JSON.stringify(TEMP_MAILS, null, 2)
  );
}

const START_TIME = Date.now();
let RULES = "📜 Chưa có nội quy.";

let BOT_ENABLED = true;
bot.use(async (ctx, next) => {
  if (!BOT_ENABLED) {
    if (
      ctx.message?.text === "/benonl" &&
      ADMINS.includes(String(ctx.from.id))
    ) {
      return next();
    }

    return;
  }

  return next();
});

const REO_MESSAGES = [
  "sủa đi thằng ngu!",
  "🤣 sao hấp hối r e!",
  "ớt t kìa!",
  "câm hận t à gay?",
  "thằng vô dụng!",
  "chat có tí đã mếu",
  "sủa đi gay?",
  "alo tuất!",
  "‌mày ngưng là con đĩ mẹ mày chết =))?",
  "chậm ‌vậy ‌sao ‌cứu ‌được ‌con ‌đĩ ‌mẹ ‌mày ‌nhanh ‌lên ‌đi ‌chứ ‌=))",
  "nghèo k có nghi lực à =))‌",
  "thằng bê đê bất lực vì mẹ nó bị đụ tung cái lồn =))",
  "Gõ sồn máu lồn mày lên =))‍",
  "Cay ​cú ​anh ​trong ​lòng ​mà ​không ​làm ​đc ​gì ​=))",
  "⁠bem với cha phải banh đầu óc chó ra đáp lại nghe chưa =))?",
  "sao mày lề mề dị con =))",
  "ko cảm hứng để hăng à =))",
];

let REO_INTERVAL = null;
let reoIndex = 0;

let LINK_LOCK = false;

let BOT_OFF = false;

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
let GROUPS = {};


try {
  GROUPS = JSON.parse(
    fs.readFileSync("groups.json", "utf8")
  );
} catch {
  GROUPS = {};
}

function saveGroups() {
  fs.writeFileSync(
    "groups.json",
    JSON.stringify(GROUPS, null, 2)
  );
}

function isAdmin(id) {
  return ADMINS.includes(String(id));
}

let FB_UIDS = {};

let SCAMS = {};

try {
  SCAMS = JSON.parse(
    fs.readFileSync("scams.json", "utf8")
  );
} catch {
  SCAMS = {};
}

function saveScams() {
  fs.writeFileSync(
    "scams.json",
    JSON.stringify(SCAMS, null, 2)
  );
}
try {
  FB_UIDS = JSON.parse(fs.readFileSync("uids.json", "utf8"));
} catch {}

function saveUIDs() {
  fs.writeFileSync(
    "uids.json",
    JSON.stringify(FB_UIDS, null, 2)
  );
}
let TITLES = {};

try {
  TITLES = JSON.parse(fs.readFileSync("titles.json", "utf8"));
} catch {}

function saveTitles() {
  fs.writeFileSync(
    "titles.json",
    JSON.stringify(TITLES, null, 2)
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
bot.on("message", async (ctx, next) => {
  if (
    ctx.chat.type === "group" ||
    ctx.chat.type === "supergroup"
  ) {
    GROUPS[ctx.chat.id] = {
      title: ctx.chat.title
    };

    saveGroups();
  }

  return next();
});

bot.use(async (ctx, next) => {
  if (
    BOT_OFF &&
    ctx.chat.type !== "private"
  ) {
    return;
  }

  await next();
});

bot.command("menukb", (ctx) => {
  ctx.reply(
    "📋 Keyboard mới",
    Markup.keyboard([
      ["📋 Menu", "👑 Admin"]
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

bot.hears("📋 Menu", async (ctx) => {
  return ctx.telegram.sendMessage(
    ctx.chat.id,
    MENU_TEXT
  );
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
bot.command("hug", async (ctx) => {
  if (!ctx.message.reply_to_message)
    return ctx.reply("❌ Reply người cần ôm.");

  return ctx.reply(
    `🤗 ${ctx.from.first_name} ôm ${ctx.message.reply_to_message.from.first_name}`
  );
});

bot.command("slap", async (ctx) => {
  if (!ctx.message.reply_to_message)
    return replyAutoDelete(ctx, "❌ Reply người cần tát.");

  return replyAutoDelete(
    ctx,
    `👋 ${ctx.from.first_name} tát ${ctx.message.reply_to_message.from.first_name}`
  );
});

bot.command("marry", async (ctx) => {
  if (!ctx.message.reply_to_message)
    return replyAutoDelete(ctx, "❌ Reply người cần cầu hôn.");

  return replyAutoDelete(
    ctx,
    `💍 ${ctx.from.first_name} cầu hôn ${ctx.message.reply_to_message.from.first_name}`
  );
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

🛡️ Quản lý nhóm
/mute - Mute thành viên
/unmute - Bỏ mute
/ban - Ban thành viên
/unban - Bỏ ban
/kick - Kick khỏi nhóm
/lock - Khóa chat
/unlock - Mở chat
/clear - Xóa chat
/setnamebox - Đổi tên nhóm
/setavtbox - Đổi ảnh nhóm

⚠️ Báo Cáo
/warn - Cảnh cáo
/warnings - Xem cảnh cáo
/resetwarn - Xóa cảnh cáo
/report - Báo Cáo 
/checkscam - Kiểm tra scam
/reportscam - Báo cáo scam

📊 Tiện ích
/stats - Xem thống kê bot
/uptime - Xem thời gian hoạt động của bot
/say - Bảo bot gửi tin nhắn
/rules - Xem nội quy nhóm
/setrules - Cập nhật nội quy nhóm
/tagadmins - Xem danh sách admin
/avatar - Xem ảnh đại diện người dùng
/checkbot - Kiểm tra trạng thái bot
/title - Đổi danh hiệu cá nhân
/profile - Xem hồ sơ cá nhân
/weather - Thời tiết

📌 Ghim Thông Báo
/pin - Ghim Tin Nhắn
/unpin - Bỏ Ghim Tin Nhắn

💘 Vui vẻ
/ship
/roll
/hug 
/coinflip
/gay
/simp
/cute
/love
`;

  return replyAutoDelete(ctx, text, 120000);
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

    return ctx.reply("📌 Đã ghim tin nhắn.");
  } catch {
    return replyAutoDelete(ctx, "❌ Không thể ghim.");
  }
});

bot.command("unpin", async (ctx) => {
  if (!isAdmin(ctx.from.id))
    return replyAutoDelete(ctx, "❌ Bạn không có quyền.");

  try {
    await ctx.unpinAllChatMessages();

    return ctx.reply("📌 Đã bỏ ghim.");
  } catch {
    return replyAutoDelete(ctx, "❌ Không thể bỏ ghim.");
  }
});

bot.command("stats", async (ctx) => {
  const uptime = Math.floor((Date.now() - START_TIME) / 1000);

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

  const text = ctx.message.text
    .split(" ")
    .slice(1)
    .join(" ")
    .trim();

  if (!text)
    return replyAutoDelete(
      ctx,
      "❌ Dùng: /setrules nội dung"
    );

  RULES = text;

  return replyAutoDelete(
    ctx,
    "✅ Đã cập nhật nội quy."
  );
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

bot.command("lockmedia", async (ctx) => {
  if (!isAdmin(ctx.from.id))
    return replyAutoDelete(ctx, "❌ Bạn không có quyền.");

  try {
    await ctx.telegram.setChatPermissions(ctx.chat.id, {
      can_send_messages: true,
      can_send_photos: false,
      can_send_videos: false,
      can_send_documents: false,
      can_send_audios: false,
      can_send_voice_notes: false,
      can_send_video_notes: false
    });

    return replyAutoDelete(ctx, "🖼️ Đã khóa gửi ảnh/video.");
  } catch {
    return replyAutoDelete(ctx, "❌ Không thể khóa media.");
  }
});

bot.command("unlockmedia", async (ctx) => {
  if (!isAdmin(ctx.from.id))
    return replyAutoDelete(ctx, "❌ Bạn không có quyền.");

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
      can_add_web_page_previews: true
    });

    return replyAutoDelete(ctx, "✅ Đã mở gửi media.");
  } catch {
    return replyAutoDelete(ctx, "❌ Không thể mở media.");
  }
});

bot.command("locklink", async (ctx) => {
  if (!isAdmin(ctx.from.id))
    return replyAutoDelete(ctx, "❌ Bạn không có quyền.");

  LINK_LOCK = true;

  return replyAutoDelete(ctx, "🔒 Đã bật chặn link.");
});

bot.command("unlocklink", async (ctx) => {
  if (!isAdmin(ctx.from.id))
    return replyAutoDelete(ctx, "❌ Bạn không có quyền.");

  LINK_LOCK = false;

  return replyAutoDelete(ctx, "🔓 Đã tắt chặn link.");
});

(async () => {
  try {
    await bot.telegram.deleteWebhook({
      drop_pending_updates: true
    });

    console.log("Webhook deleted");
  } catch (e) {
    console.log(e);
  }
bot.use(async (ctx, next) => {
  if (
    ctx.chat &&
    (ctx.chat.type === "group" ||
     ctx.chat.type === "supergroup")
  ) {
    GROUPS[String(ctx.chat.id)] = {
      title: ctx.chat.title
    };

    saveGroups();
  }

  return next();
});

bot.on("message", async (ctx, next) => {
  if (!LINK_LOCK) return next();

  if (isAdmin(ctx.from.id)) return next();

  const text =
    ctx.message.text ||
    ctx.message.caption ||
    "";

  const regex =
    /(https?:\/\/|www\.|t\.me\/|telegram\.me\/|\.com|\.net|\.org|\.vn)/i;

  if (regex.test(text)) {
    try {
      await ctx.deleteMessage();

      const msg = await ctx.reply(
        `🚫 ${ctx.from.first_name} gửi link khi đang khóa link.`
      );

      setTimeout(async () => {
        try {
          await ctx.telegram.deleteMessage(
            ctx.chat.id,
            msg.message_id
          );
        } catch {}
      }, 5000);
    } catch {}

    return;
  }

  return next();
});

bot.command("checkbot", async (ctx) => {
  const me = await ctx.telegram.getMe();

  return replyAutoDelete(
    ctx,
    `🤖 THÔNG TIN BOT

📛 Username: @${me.username}
🆔 ID: ${me.id}
✅ Trạng thái: Online`
  );
});

bot.command("title", async (ctx) => {
  const title = ctx.message.text
    .split(" ")
    .slice(1)
    .join(" ")
    .trim();

  if (!title)
    return replyAutoDelete(
      ctx,
      "❌ Dùng: /title Danh hiệu"
    );

  TITLES[String(ctx.from.id)] = title;

  saveTitles();

  return replyAutoDelete(
    ctx,
    `👑 Đã đặt danh hiệu: ${title}`
  );
});

bot.command("profile", async (ctx) => {
  let user = ctx.from;

  if (ctx.message.reply_to_message)
    user = ctx.message.reply_to_message.from;

  const title =
    TITLES[String(user.id)] || "Chưa có";

  return replyAutoDelete(
    ctx,
    `👤 ${user.first_name}

🆔 ${user.id}
📛 @${user.username || "Không có"}

👑 Danh hiệu: ${title}`
  );
});

bot.command("reo", async (ctx) => {
  const args = ctx.message.text.split(" ");

  if (!args[1])
    return replyAutoDelete(ctx, "❌ Dùng: /reo @username");

  if (REO_INTERVAL)
    return replyAutoDelete(ctx, "⚠️ Đang reo rồi.");

  const target = args[1];

  REO_INTERVAL = setInterval(async () => {
    try {
      const msg = REO_MESSAGES[reoIndex];

      reoIndex++;

      if (reoIndex >= REO_MESSAGES.length)
        reoIndex = 0;

      await ctx.reply(`${target} ${msg}`);
    } catch (e) {
      console.log(e);
    }
  }, 2000);

  return replyAutoDelete(ctx, "✅ Đã bắt đầu reo.");
});

bot.command("stopreo", async (ctx) => {
  if (!REO_INTERVAL)
    return replyAutoDelete(ctx, "❌ Không có reo nào đang chạy.");

  clearInterval(REO_INTERVAL);
  REO_INTERVAL = null;

  return replyAutoDelete(ctx, "🛑 Đã dừng reo.");
});

bot.command("report", async (ctx) => {
  if (!ctx.message.reply_to_message)
    return replyAutoDelete(
      ctx,
      "❌ Reply người cần report."
    );

  const reason = ctx.message.text
    .replace("/report", "")
    .trim();

  if (!reason)
    return replyAutoDelete(
      ctx,
      "❌ Dùng: /report lý do"
    );

  const target =
    ctx.message.reply_to_message.from;

  await ctx.telegram.sendMessage(
    ADMIN_ID,
`🚨 REPORT THÀNH VIÊN

👤 Người report:
${ctx.from.first_name}
🆔 ${ctx.from.id}

🎯 Người bị report:
${target.first_name}
🆔 ${target.id}

📝 Lý do:
${reason}`
  );

  return replyAutoDelete(
    ctx,
    "✅ Đã gửi report tới admin."
  );
});

bot.command("reportscam", async (ctx) => {
  const text = ctx.message.text
    .replace("/reportscam", "")
    .trim();

  if (!text.includes("|"))
    return ctx.reply(
      "Dùng:\n/reportscam thông_tin|lý_do"
    );

  const [target, reason] = text.split("|");

  if (!SCAMS[target])
    SCAMS[target] = [];

  SCAMS[target].push({
    by: ctx.from.id,
    reason: reason.trim(),
    time: Date.now()
  });

  saveScams();

  ctx.reply("✅ Đã ghi nhận tố cáo.");
});

bot.command("checkscam", async (ctx) => {
  const target = ctx.message.text
    .replace("/checkscam", "")
    .trim();

  if (!target)
    return ctx.reply(
      "Dùng:\n/checkscam sdt_stk_uid"
    );

  const reports = SCAMS[target];

  if (!reports || reports.length === 0)
    return ctx.reply(
      "✅ Không có báo cáo nào."
    );

  let text =
    `⚠️ ${target}\n` +
    `📊 Số tố cáo: ${reports.length}\n\n`;

  reports.slice(0, 5).forEach((r, i) => {
    text += `${i + 1}. ${r.reason}\n`;
  });

  ctx.reply(text);
});

bot.command("benonl", async (ctx) => {
  if (!ADMINS.includes(String(ctx.from.id))) return;

BOT_ENABLED = true;

for (const groupId of Object.keys(GROUPS)) {
  try {
    await ctx.telegram.sendMessage(
      groupId,
      "🟢 THÔNG BÁO\n\nBot đã hoạt động trở lại."
    );
  } catch {}
}

ctx.reply("🟢 Bot đã bật.");
});

bot.command("benoff", async (ctx) => {
  if (!ADMINS.includes(String(ctx.from.id))) return;

  for (const groupId of Object.keys(GROUPS)) {
  try {
    await ctx.telegram.sendMessage(
      groupId,
      "🔴 THÔNG BÁO\n\nBot đã được tắt bởi quản trị viên."
    );
  } catch {}
}

BOT_ENABLED = false;
ctx.reply("🔴 Bot đã tắt.");
});

bot.command("thongbao", async (ctx) => {
  if (ctx.chat.type !== "private") {
    return ctx.reply("❌ Chỉ dùng trong chat riêng với bot.");
  }

  if (!isAdmin(ctx.from.id)) {
    return ctx.reply("❌ Bạn không có quyền.");
  }

  const text = ctx.message.text.replace("/thongbao", "").trim();

  if (!text) {
    return ctx.reply(
      "Dùng:\n/thongbao Nội dung cần gửi"
    );
  }

  let sent = 0;

  for (const groupId of Object.keys(GROUPS)) {
    try {
      await ctx.telegram.sendMessage(
        groupId,
        `📢 THÔNG BÁO\n\n${text}`
      );
      sent++;
    } catch {}
  }

  ctx.reply(
    `✅ Đã gửi tới ${sent} nhóm`
  );
});

bot.command("setnamebox", async (ctx) => {
  if (ctx.chat.type === "private")
    return ctx.reply("❌ Chỉ dùng trong nhóm.");

  if (!isAdmin(ctx.from.id))
    return ctx.reply("❌ Bạn không có quyền.");

  const name = ctx.message.text.replace("/setnamebox", "").trim();

  if (!name)
    return ctx.reply("Dùng:\n/setnamebox Tên nhóm mới");

  try {
    await ctx.telegram.setChatTitle(ctx.chat.id, name);
    ctx.reply(`✅ Đã đổi tên nhóm thành:\n${name}`);
  } catch {
    ctx.reply("❌ Không thể đổi tên nhóm.");
  }
});

bot.command("setavtbox", async (ctx) => {
  if (ctx.chat.type === "private")
    return ctx.reply("❌ Chỉ dùng trong nhóm.");

  if (!isAdmin(ctx.from.id))
    return ctx.reply("❌ Bạn không có quyền.");

  if (!ctx.message.reply_to_message?.photo)
    return ctx.reply(
      "📸 Reply vào ảnh rồi dùng:\n/setavtbox"
    );

  

try {
    const photo =
        ctx.message.reply_to_message.photo.slice(-1)[0];

    const https = require("https");
    const path = require("path");
    const fs = require("fs");

    const file =
        await ctx.telegram.getFile(photo.file_id);

    const url =
        "https://api.telegram.org/file/bot" +
        process.env.BOT_TOKEN +
        "/" +
        file.file_path;

const tempFile =
    path.join(__dirname, "group-photo.jpg");

await new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(tempFile);

    https.get(url, (res) => {
        res.pipe(stream);

        stream.on("finish", () => {
            stream.close(resolve);
        });
    }).on("error", reject);
});

await ctx.telegram.setChatPhoto(
    ctx.chat.id,
    { source: tempFile }
);

fs.unlinkSync(tempFile);

ctx.reply("✅ Đã đổi ảnh nhóm.");
  

    
} catch (e) {
    console.log(e);
    ctx.reply("❌ " + e.stack);
}
});
const axios = require("axios");

bot.command("weather", async (ctx) => {
    const city = ctx.message.text.replace("/weather", "").trim();

    if (!city) {
        return ctx.reply("Ví dụ: /weather Hanoi");
    }

    try {
        const res = await axios.get(
            "https://api.openweathermap.org/data/2.5/weather",
            {
                params: {
                    q: city,
                    appid: process.env.OPENWEATHER_API_KEY,
                    units: "metric",
                    lang: "vi"
                }
            }
        );

        const w = res.data;

        await ctx.reply(
`🌤 Thành phố: ${w.name}
🌡 Nhiệt độ: ${w.main.temp}°C
🤔 Cảm giác như: ${w.main.feels_like}°C
💧 Độ ẩm: ${w.main.humidity}%
🌬 Gió: ${w.wind.speed} m/s
📝 Thời tiết: ${w.weather[0].description}`
        );

    } catch (err) {
        console.error(err);
        ctx.reply("❌ Không tìm thấy địa điểm.");
    }
});

  bot.launch();
})();