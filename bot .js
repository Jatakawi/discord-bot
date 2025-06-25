/**
 * Gaming Multiverse Ultimate Bot - ULTRA MAXIMALISTYCZNY SZKIELET
 * Discord.js v14+ | Node.js 18+, wszystko w jednym pliku!
 * Funkcje: help, setup, restart, role, ekonomia, poziomy, reputacja, loteria, sklep, praca, warny, infractions, ticket, powitania, statystyki, automoderacja, auto-nick, custom komendy, auto-reakcje, ankiety, achievements, logi, panel moderatora, mute, ban, kick, lock, slowmode, tagi, przypomnienia, sugestie, reporty, userstats.
 */
const {
    Client, GatewayIntentBits, PermissionsBitField, ChannelType,
    EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, Partials
} = require('discord.js');
const fs = require('fs');
const TOKEN = 'MTM4NzEwMDY2MTc5MDgwNjIwNg.Gxl9Jq.tJaO6CxiLZr70SyikCfHIEvrSqyfxvCFHxKsfQ'; // <-- PODAJ SWÓJ TOKEN
const PREFIX = "!";

// === PLIKI DANYCH ===
function load(file, fallback) { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : fallback; }
function save(obj, file) { fs.writeFileSync(file, JSON.stringify(obj, null, 2)); }
const ECONOMY_FILE = "./economy.json";
const LEVELS_FILE = "./levels.json";
const REP_FILE = "./rep.json";
const WARN_FILE = "./warns.json";
const ACH_FILE = "./achievements.json";
const SHOPLOG_FILE = "./shoplog.json";
const MODLOG_FILE = "./modlog.json";
const TICKETS_FILE = "./tickets.json";
const LOTTO_FILE = "./lotto.json";
const CUSTOMCMD_FILE = "./customcmd.json";
const AUTOREACT_FILE = "./autoreact.json";
const TAGS_FILE = "./tags.json";
const REMINDERS_FILE = "./reminders.json";
const SUGGESTIONS_FILE = "./suggestions.json";
const REPORTS_FILE = "./reports.json";
const USERSTATS_FILE = "./userstats.json";

let economy = load(ECONOMY_FILE, {});
let userLevels = load(LEVELS_FILE, {});
let reputation = load(REP_FILE, {});
let warns = load(WARN_FILE, {});
let achievements = load(ACH_FILE, {});
let shoplog = load(SHOPLOG_FILE, []);
let modlog = load(MODLOG_FILE, []);
let tickets = load(TICKETS_FILE, {});
let lotto = load(LOTTO_FILE, { last: 0, pool: 0, entries: {}, winners: [] });
let customcmd = load(CUSTOMCMD_FILE, {});
let autoreact = load(AUTOREACT_FILE, {});
let tags = load(TAGS_FILE, {});
let reminders = load(REMINDERS_FILE, []);
let suggestions = load(SUGGESTIONS_FILE, []);
let reports = load(REPORTS_FILE, []);
let userstats = load(USERSTATS_FILE, {});

// === KONFIGURACJA ===
const config = {
    autorole: '👶・Nowicjusz',
    welcomeChannel: 'powitania',
    welcomeDM: true,
    logsChannel: 'logi-botów',
    modlogChannel: 'moderacja',
    infractionsChannel: 'moderacja',
    antiSpam: true,
    antiCaps: true,
    capsLimit: 70,
    antiLinks: true,
    forbiddenWords: ["reklama", "discord.gg", "kurwa", "chuj", "jebac", "pierdole"],
    pollChannel: 'ankiety',
    ticketCategory: '● TICKETY ●',
    autoNickPrefix: "Gracz",
    suggestionsChannel: "sugestie",
    reportsChannel: "reporty"
};

// === ROLE WYBIERALNE (przykład) ===
const wybieralneRole = [
    { kategoria: "Województwo", nazwa: "🌍 Dolnośląskie" },
    { kategoria: "Wiek", nazwa: "📆 16-18" },
    { kategoria: "Płeć", nazwa: "🚻 Mężczyzna" },
    { kategoria: "Sprzęt", nazwa: "💻 PC" },
    { kategoria: "Ulubiona gra", nazwa: "🎮 Minecraft" }
];

const shop = [
    { id: "vip", name: "VIP na 3 dni", price: 500, description: "Ranga VIP na 3 dni." },
    { id: "rep", name: "Reputacja +1", price: 150, description: "Otrzymujesz 1 punkt reputacji." }
];

const jobs = [
    { name: "Kasjer", min: 30, max: 60, cooldown: 60*60*1000 },
    { name: "Programista", min: 80, max: 160, cooldown: 2*60*60*1000 },
    { name: "Streamer", min: 50, max: 120, cooldown: 90*60*1000 }
];

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.on('ready', () => {
    console.log(`🤖 Bot uruchomiony jako ${client.user.tag}`);
    client.user.setActivity('!help | Gaming Multiverse');
});

// ========== POWITANIA, AUTOROLE, AUTONICK, STATYSTYKI ==========
client.on('guildMemberAdd', member => {
    userstats[member.id] = userstats[member.id] || { messages: 0, joins: 0, leaves: 0, reacts: 0 };
    userstats[member.id].joins++;
    save(userstats, USERSTATS_FILE);
    const channel = member.guild.channels.cache.find(c => c.name === config.welcomeChannel);
    if (channel) channel.send(`👋 Witaj <@${member.id}> na serwerze **${member.guild.name}**!`);
    if (config.welcomeDM) member.send(`Witaj na **${member.guild.name}**!`);
    if (config.autorole) {
        let role = member.guild.roles.cache.find(r=>r.name===config.autorole);
        if (role) member.roles.add(role);
    }
    if (config.autoNickPrefix && !member.nickname && !member.user.bot) {
        member.setNickname(`${config.autoNickPrefix} | ${member.user.username}`).catch(()=>{});
    }
});
client.on('guildMemberRemove', member => {
    if (!userstats[member.id]) userstats[member.id] = { messages: 0, joins: 0, leaves: 0, reacts: 0 };
    userstats[member.id].leaves++;
    save(userstats, USERSTATS_FILE);
    const channel = member.guild.channels.cache.find(c => c.name === config.logsChannel);
    if (channel) channel.send(`👋 Pożegnaliśmy <@${member.id}>.`);
});

// ========== AUTO-MODERACJA, AUTO-REAKCJE, STATY WIADOMOŚCI ==========
client.on('messageCreate', message => {
    if (!userstats[message.author.id]) userstats[message.author.id] = { messages: 0, joins: 0, leaves: 0, reacts: 0 };
    userstats[message.author.id].messages++;
    save(userstats, USERSTATS_FILE);
    if (message.author.bot) return;
    if (config.antiCaps && message.content.length>=8) {
        const ratio = message.content.replace(/[^A-ZĄĆĘŁŃÓŚŹŻ]/g,"").length/message.content.length;
        if (ratio > config.capsLimit/100) {
            message.delete();
            return message.channel.send(`${message.author}, nie krzycz!`);
        }
    }
    if (config.forbiddenWords.some(w=>message.content.toLowerCase().includes(w))) {
        message.delete();
        message.channel.send(`${message.author}, użyłeś zakazanego słowa!`);
    }
    if (config.antiLinks && /(https?:\/\/|discord\.gg)/i.test(message.content)) {
        message.delete();
        message.channel.send(`${message.author}, linki są zakazane!`);
    }
    for (const [word, emoji] of Object.entries(autoreact)) {
        if (message.content.toLowerCase().includes(word.toLowerCase())) {
            message.react(emoji).catch(()=>{});
        }
    }
});

// ========== XP/POZIOMY, ACHIEVEMENTS ==========
client.on('messageCreate', message => {
    if (message.author.bot || !message.guild) return;
    if (!userLevels[message.author.id]) userLevels[message.author.id]={ xp: 0, level: 1 };
    userLevels[message.author.id].xp += Math.floor(Math.random()*7)+3;
    let xp = userLevels[message.author.id].xp, lvl = userLevels[message.author.id].level;
    let nextLvl = 5+lvl*lvl*15;
    if (xp >= nextLvl) {
        userLevels[message.author.id].level++;
        userLevels[message.author.id].xp = xp-nextLvl;
        message.channel.send(`🎉 ${message.author} awansował na **poziom ${userLevels[message.author.id].level}**!`);
        if (!achievements[message.author.id]) achievements[message.author.id]=[];
        if (!achievements[message.author.id].includes("level5") && userLevels[message.author.id].level>=5) {
            achievements[message.author.id].push("level5");
            message.channel.send(`${message.author} zdobył achievement: **Level 5!**`);
        }
    }
    save(userLevels, LEVELS_FILE); save(achievements, ACH_FILE);
});

// ========== SYSTEM MUTE/BAN/KICK, MODLOG ==========
client.on('messageCreate', async message => {
    if (!message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const cmd = args.shift()?.toLowerCase();
    // mute/unmute/tempmute/ban/unban/tempban/kick/purge/lock/unlock/slowmode/nick
    // (patrz poprzednia odpowiedź – tutaj kod jest identyczny, aby nie wyczerpywać limitu wyświetlania!)
});

// ========== SYSTEM PRZYPOMNIEŃ ==========
setInterval(() => {
    const now = Date.now();
    for (let i = reminders.length-1; i >= 0; i--) {
        if (reminders[i].time <= now) {
            client.users.fetch(reminders[i].user).then(u=>u.send(`⏰ Przypomnienie: ${reminders[i].text}`));
            reminders.splice(i, 1);
            save(reminders, REMINDERS_FILE);
        }
    }
}, 15*1000);

// ========== SYSTEM SUGESTII ==========
client.on('messageCreate', message => {
    if (message.content.startsWith(PREFIX+"suggest ")) {
        const suggestion = message.content.slice((PREFIX+"suggest ").length);
        suggestions.push({ user: message.author.id, suggestion, date: Date.now() });
        save(suggestions, SUGGESTIONS_FILE);
        const channel = message.guild.channels.cache.find(c=>c.name===config.suggestionsChannel);
        if (channel) channel.send(`💡 SUGESTIA: ${suggestion} (od ${message.author})`);
        message.reply("Twoja sugestia została przekazana!");
    }
    if (message.content.startsWith(PREFIX+"suggestions")) {
        const text = suggestions.slice(-10).map(s=>`<@${s.user}>: ${s.suggestion} (${new Date(s.date).toLocaleDateString()})`).join("\n") || "Brak sugestii.";
        message.channel.send({content: text});
    }
});

// ========== SYSTEM REPORTÓW ==========
client.on('messageCreate', message => {
    if (message.content.startsWith(PREFIX+"report ")) {
        const [userMention, ...reasonArr] = message.content.slice((PREFIX+"report ").length).split(" ");
        const userId = userMention?.replace(/[<@!>]/g, "");
        const reason = reasonArr.join(" ") || "Brak powodu";
        if (!userId) return message.reply("Użycie: !report @user powód");
        reports.push({ reporter: message.author.id, reported: userId, reason, date: Date.now() });
        save(reports, REPORTS_FILE);
        const channel = message.guild.channels.cache.find(c=>c.name===config.reportsChannel);
        if (channel) channel.send(`🚨 REPORT: <@${userId}> zgłoszony przez <@${message.author.id}>: ${reason}`);
        message.reply("Zgłoszenie zostało wysłane do moderatorów.");
    }
});

// ========== SYSTEM TAGÓW ==========
client.on('messageCreate', message => {
    if (message.content.startsWith(PREFIX+"tag dodaj ")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const [tag, ...reszta] = message.content.slice((PREFIX+"tag dodaj ").length).split(" ");
        tags[tag] = reszta.join(" ");
        save(tags, TAGS_FILE);
        message.reply(`Dodano tag **${tag}**.`);
    }
    if (message.content.startsWith(PREFIX+"tag usuń ")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const tag = message.content.slice((PREFIX+"tag usuń ").length);
        if (!tags[tag]) return message.reply("Nie ma takiego tagu!");
        delete tags[tag];
        save(tags, TAGS_FILE);
        message.reply(`Usunięto tag **${tag}**.`);
    }
    if (message.content.startsWith(PREFIX+"tag ")) {
        const tag = message.content.slice((PREFIX+"tag ").length);
        if (!tags[tag]) return message.reply("Nie ma takiego tagu!");
        message.channel.send(tags[tag]);
    }
});

// ========== SYSTEM STATYSTYK USERA ==========
client.on('messageCreate', message => {
    if (message.content.startsWith(PREFIX+"userstats")) {
        const user = message.mentions.users.first() || message.author;
        const s = userstats[user.id] || { messages: 0, joins: 0, leaves: 0, reacts: 0 };
        message.reply(`Statystyki <@${user.id}>: Wiadomości: ${s.messages}, Dołączeń: ${s.joins}, Odejść: ${s.leaves}, Reakcji: ${s.reacts}`);
    }
    if (message.content.startsWith(PREFIX+"serverstats")) {
        const users = Object.keys(userstats);
        const msg = users.reduce((a,u)=>a+userstats[u].messages,0);
        message.reply(`Statystyki serwera: Użytkowników: ${users.length}, Wiadomości: ${msg}`);
    }
});

// ========== SYSTEM LOGÓW ==========
client.on('messageDelete', msg => {
    const chan = msg.guild?.channels.cache.find(c=>c.name===config.logsChannel);
    if (chan) chan.send(`🗑️ Usunięto wiadomość od ${msg.author}: ${msg.content}`);
});
client.on('messageUpdate', (oldMsg, newMsg) => {
    if (oldMsg.content !== newMsg.content) {
        const chan = newMsg.guild?.channels.cache.find(c=>c.name===config.logsChannel);
        if (chan) chan.send(`✏️ Edytowano wiadomość od ${oldMsg.author}:\nPrzed: ${oldMsg.content}\nPo: ${newMsg.content}`);
    }
});
client.on('guildMemberUpdate', (oldM, newM) => {
    if (oldM.nickname !== newM.nickname) {
        const chan = newM.guild.channels.cache.find(c=>c.name===config.logsChannel);
        if (chan) chan.send(`🔄 Zmieniono nick: <@${oldM.id}> z **${oldM.nickname}** na **${newM.nickname}**`);
    }
});

// ========== WYBIERALNE ROLE SELECT ==========
client.on('interactionCreate', async interaction => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId === "selfrole") {
        const rolesToHandle = wybieralneRole.map(r => r.nazwa);
        for (const roleName of rolesToHandle) {
            const role = interaction.guild.roles.cache.find(r => r.name === roleName);
            if (role && interaction.member.roles.cache.has(role.id) && !interaction.values.includes(roleName)) {
                await interaction.member.roles.remove(role);
            }
        }
        for (const value of interaction.values) {
            let role = interaction.guild.roles.cache.find(r => r.name === value);
            if (!role) role = await interaction.guild.roles.create({ name: value });
            await interaction.member.roles.add(role);
        }
        await interaction.reply({ content: "Zaktualizowano Twoje role!", ephemeral: true });
    }
});
// ========== SYSTEM EKONOMII ==========
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;
    // Komenda: saldo
    if (message.content.startsWith(PREFIX + "saldo")) {
        const user = message.mentions.users.first() || message.author;
        const cash = economy[user.id] || 0;
        message.reply(`💸 Saldo <@${user.id}>: **${cash}** coins`);
    }
    // Komenda: daily
    if (message.content.startsWith(PREFIX + "daily")) {
        economy[message.author.id] = (economy[message.author.id] || 0) + 100;
        save(economy, ECONOMY_FILE);
        message.reply("Odebrałeś dzienną nagrodę: +100 coins!");
    }
    // Komenda: praca
    if (message.content.startsWith(PREFIX + "praca")) {
        const job = jobs[Math.floor(Math.random()*jobs.length)];
        const earned = Math.floor(Math.random()*(job.max-job.min+1))+job.min;
        economy[message.author.id] = (economy[message.author.id] || 0) + earned;
        save(economy, ECONOMY_FILE);
        message.reply(`Pracowałeś jako **${job.name}** i zarobiłeś **${earned} coins**!`);
    }
    // Komenda: sklep
    if (message.content.startsWith(PREFIX + "sklep")) {
        let txt = shop.map(i=>`**${i.id}**: ${i.name} – ${i.price} coins (${i.description})`).join("\n");
        message.reply("🛒 Sklep:\n" + txt);
    }
    // Komenda: kup (np. !kup vip)
    if (message.content.startsWith(PREFIX + "kup ")) {
        const itemId = message.content.split(" ")[1];
        const item = shop.find(i=>i.id === itemId);
        if (!item) return message.reply("Nie ma takiego przedmiotu w sklepie!");
        if ((economy[message.author.id] || 0) < item.price) return message.reply("Nie masz tyle coins!");
        economy[message.author.id] -= item.price;
        shoplog.push({ user: message.author.id, item: itemId, date: Date.now() });
        save(economy, ECONOMY_FILE); save(shoplog, SHOPLOG_FILE);
        message.reply(`Kupiłeś **${item.name}** za ${item.price} coins!`);
        // Tu możesz dodać specjalne efekty np. dodanie roli VIP
        if (itemId === "vip") {
            let role = message.guild.roles.cache.find(r=>r.name==="💎・VIP");
            if (role) message.member.roles.add(role);
        }
    }
});
// ========== SYSTEM LOTERII ==========
client.on('messageCreate', message => {
    if (message.content.startsWith(PREFIX+"loteria")) {
        if (!lotto.entries[message.author.id]) {
            lotto.entries[message.author.id] = true;
            lotto.pool += 50;
            save(lotto, LOTTO_FILE);
            message.reply("Dodałeś swój los do loterii!");
        } else {
            message.reply("Już bierzesz udział w tej loterii!");
        }
    }
    if (message.content.startsWith(PREFIX+"wylosuj")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const entries = Object.keys(lotto.entries);
        if (entries.length === 0) return message.reply("Brak zgłoszeń do loterii!");
        const winner = entries[Math.floor(Math.random()*entries.length)];
        economy[winner] = (economy[winner]||0) + lotto.pool;
        save(economy, ECONOMY_FILE);
        message.channel.send(`🏆 Wygrał <@${winner}> i zdobył **${lotto.pool} coins**!`);
        lotto.last = Date.now();
        lotto.pool = 0;
        lotto.entries = {};
        save(lotto, LOTTO_FILE);
    }
});
// ========== SYSTEM AFK ==========
const afk = {};
client.on('messageCreate', message => {
    if (message.content.startsWith(PREFIX+"afk")) {
        const reason = message.content.split(" ").slice(1).join(" ") || "brak powodu";
        afk[message.author.id] = reason;
        message.reply(`Ustawiono AFK: ${reason}`);
    }
    if (afk[message.author.id] && !message.content.startsWith(PREFIX+"afk")) {
        delete afk[message.author.id];
        message.reply("Witaj z powrotem! Usunięto AFK.");
    }
    for (const mention of message.mentions.users.values()) {
        if (afk[mention.id]) {
            message.reply(`<@${mention.id}> jest AFK: ${afk[mention.id]}`);
        }
    }
});
// ========== SYSTEM CUSTOM KOMEND ==========
client.on('messageCreate', message => {
    if (message.content.startsWith(PREFIX+"cmd dodaj ")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const [cmd, ...txt] = message.content.slice((PREFIX+"cmd dodaj ").length).split(" ");
        customcmd[cmd] = txt.join(" ");
        save(customcmd, CUSTOMCMD_FILE);
        message.reply(`Dodano custom komendę **${cmd}**.`);
    }
    if (message.content.startsWith(PREFIX+"cmd usuń ")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const cmd = message.content.slice((PREFIX+"cmd usuń ").length);
        delete customcmd[cmd];
        save(customcmd, CUSTOMCMD_FILE);
        message.reply(`Usunięto komendę **${cmd}**.`);
    }
    const words = message.content.slice(PREFIX.length).split(" ");
    if (customcmd[words[0]]) {
        message.channel.send(customcmd[words[0]]);
    }
});
// ========== SYSTEM AUTOREAKCJI ==========
client.on('messageCreate', message => {
    if (message.content.startsWith(PREFIX+"autoreact dodaj ")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const [word, emoji] = message.content.slice((PREFIX+"autoreact dodaj ").length).split(" ");
        autoreact[word] = emoji;
        save(autoreact, AUTOREACT_FILE);
        message.reply(`Dodano autoreakcję na **${word}**: ${emoji}`);
    }
    if (message.content.startsWith(PREFIX+"autoreact usuń ")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const word = message.content.slice((PREFIX+"autoreact usuń ").length);
        delete autoreact[word];
        save(autoreact, AUTOREACT_FILE);
        message.reply(`Usunięto autoreakcję na **${word}**.`);
    }
});
// ========== SYSTEM BACKUPU ==========
client.on('messageCreate', message => {
    if (message.content.startsWith(PREFIX+"backup create")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const backup = {
            channels: message.guild.channels.cache.map(c=>({name:c.name, type:c.type})),
            roles: message.guild.roles.cache.map(r=>({name:r.name, color:r.color})),
        };
        fs.writeFileSync("backup.json", JSON.stringify(backup, null, 2));
        message.reply("Backup wykonany!");
    }
    if (message.content.startsWith(PREFIX+"backup show")) {
        if (!fs.existsSync("backup.json")) return message.reply("Brak backupu!");
        message.channel.send({ files: ["backup.json"] });
    }
});
// ========== SYSTEM WARNÓW (ostrzeżeń) ==========
client.on('messageCreate', message => {
    if (!message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const cmd = args.shift()?.toLowerCase();

    // Ostrzeżenie
    if (cmd === "warn") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return message.reply("Brak uprawnień!");
        const user = message.mentions.users.first();
        const reason = args.slice(1).join(" ") || "brak powodu";
        if (!user) return message.reply("Użycie: !warn @user [powód]");
        if (!warns[user.id]) warns[user.id] = [];
        warns[user.id].push({ by: message.author.id, reason, date: Date.now() });
        save(warns, WARN_FILE);
        message.channel.send(`⚠️ <@${user.id}> otrzymał ostrzeżenie: ${reason}`);
    }
    // Sprawdzenie warnów
    if (cmd === "warny") {
        const user = message.mentions.users.first() || message.author;
        const w = warns[user.id] || [];
        if (!w.length) return message.reply("Brak ostrzeżeń.");
        message.reply(w.map((wr, i) => `${i+1}. <@${wr.by}>: ${wr.reason} (${new Date(wr.date).toLocaleDateString()})`).join("\n"));
    }
    // Usuwanie warnów
    if (cmd === "unwarn") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return message.reply("Brak uprawnień!");
        const user = message.mentions.users.first();
        if (!user || !warns[user.id] || !warns[user.id].length) return message.reply("Ten użytkownik nie ma ostrzeżeń.");
        warns[user.id].pop();
        save(warns, WARN_FILE);
        message.reply(`Usunięto najnowsze ostrzeżenie użytkownika <@${user.id}>.`);
    }
});
// ========== SYSTEM TICKETÓW ==========
client.on('messageCreate', async message => {
    if (message.content.startsWith(PREFIX + "ticket")) {
        const reason = message.content.split(" ").slice(1).join(" ") || "Brak powodu";
        const category = message.guild.channels.cache.find(c => c.name === config.ticketCategory && c.type === ChannelType.GuildCategory);
        const ch = await message.guild.channels.create({
            name: `ticket-${message.author.username}`,
            type: ChannelType.GuildText,
            parent: category ? category.id : null,
            permissionOverwrites: [
                { id: message.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: message.author.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                { id: message.client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            ]
        });
        tickets[ch.id] = { user: message.author.id, reason, time: Date.now() };
        save(tickets, TICKETS_FILE);
        ch.send(`🎫 Ticket utworzony przez <@${message.author.id}>: ${reason}`);
        message.reply(`Twój ticket został utworzony: <#${ch.id}>`);
    }
    if (message.content.startsWith(PREFIX + "zamknij")) {
        if (!tickets[message.channel.id]) return;
        message.channel.send("Ticket zostanie zamknięty za 5 sekund...");
        setTimeout(() => {
            message.channel.delete();
            delete tickets[message.channel.id];
            save(tickets, TICKETS_FILE);
        }, 5000);
    }
});
// ========== PANEL MODERATORA (mute, ban, kick, lock, slowmode, nick) ==========
client.on('messageCreate', async message => {
    if (!message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const cmd = args.shift()?.toLowerCase();

    // Mute
    if (cmd === "mute") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return message.reply("Brak uprawnień!");
        const user = message.mentions.members.first();
        const czas = parseInt(args[1]) || 5; // minuty
        if (!user) return message.reply("Użycie: !mute @user [minuty]");
        await user.timeout(czas * 60 * 1000, "Mute przez bota");
        message.channel.send(`🔇 <@${user.id}> został wyciszony na ${czas} min.`);
    }
    // Unmute
    if (cmd === "unmute") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return message.reply("Brak uprawnień!");
        const user = message.mentions.members.first();
        if (!user) return message.reply("Użycie: !unmute @user");
        await user.timeout(null);
        message.channel.send(`🔈 <@${user.id}> został odciszony.`);
    }
    // Ban
    if (cmd === "ban") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return message.reply("Brak uprawnień!");
        const user = message.mentions.members.first();
        const reason = args.slice(1).join(" ") || "brak powodu";
        if (!user) return message.reply("Użycie: !ban @user [powód]");
        await user.ban({ reason });
        message.channel.send(`⛔ <@${user.id}> został zbanowany!`);
    }
    // Unban
    if (cmd === "unban") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return message.reply("Brak uprawnień!");
        const userId = args[0];
        if (!userId) return message.reply("Użycie: !unban userID");
        await message.guild.members.unban(userId);
        message.channel.send(`✅ Użytkownik o ID ${userId} został odbanowany.`);
    }
    // Kick
    if (cmd === "kick") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return message.reply("Brak uprawnień!");
        const user = message.mentions.members.first();
        const reason = args.slice(1).join(" ") || "brak powodu";
        if (!user) return message.reply("Użycie: !kick @user [powód]");
        await user.kick(reason);
        message.channel.send(`👢 <@${user.id}> został wyrzucony!`);
    }
    // Lock/unlock
    if (cmd === "lock") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return message.reply("Brak uprawnień!");
        await message.channel.permissionOverwrites.edit(message.guild.id, { SendMessages: false });
        message.channel.send("🔒 Kanał zablokowany!");
    }
    if (cmd === "unlock") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return message.reply("Brak uprawnień!");
        await message.channel.permissionOverwrites.edit(message.guild.id, { SendMessages: true });
        message.channel.send("🔓 Kanał odblokowany!");
    }
    // Slowmode
    if (cmd === "slowmode") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return message.reply("Brak uprawnień!");
        const sec = parseInt(args[0]) || 0;
        await message.channel.setRateLimitPerUser(sec);
        message.channel.send(`🐢 Slowmode ustawiony na ${sec} sek.`);
    }
    // Zmiana nicku
    if (cmd === "nick") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) return message.reply("Brak uprawnień!");
        const user = message.mentions.members.first();
        const nick = args.slice(1).join(" ");
        if (!user || !nick) return message.reply("Użycie: !nick @user nowy_nick");
        await user.setNickname(nick);
        message.reply(`Zmieniono nick <@${user.id}> na **${nick}**`);
    }
});
// ========== SYSTEM REPUTACJI ==========
client.on('messageCreate', message => {
    if (!message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const cmd = args.shift()?.toLowerCase();

    // Dodaj reputację
    if (cmd === "rep") {
        const user = message.mentions.users.first();
        if (!user || user.id === message.author.id) return message.reply("Musisz oznaczyć kogoś innego!");
        reputation[user.id] = (reputation[user.id] || 0) + 1;
        save(reputation, REP_FILE);
        message.channel.send(`<@${user.id}> otrzymał punkt reputacji!`);
    }
    // Sprawdź reputację
    if (cmd === "reputacja") {
        const user = message.mentions.users.first() || message.author;
        const rep = reputation[user.id] || 0;
        message.reply(`Reputacja <@${user.id}>: **${rep}**`);
    }
});
// ========== SYSTEM ANKIET ==========
client.on('messageCreate', async message => {
    if (!message.content.startsWith(PREFIX + "ankieta ")) return;
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
    const text = message.content.slice((PREFIX+"ankieta ").length);
    const poll = await message.channel.send({ content: `📊 **ANKIETA:** ${text}\n✅ = TAK\n❌ = NIE` });
    await poll.react("✅");
    await poll.react("❌");
});
// ========== SYSTEM LEVEL RANKING ==========
client.on('messageCreate', message => {
    if (message.content.startsWith(PREFIX + "ranking")) {
        const arr = Object.entries(userLevels)
            .sort((a,b)=> (b[1]?.level??0)-(a[1]?.level??0))
            .slice(0,10);
        if (!arr.length) return message.reply("Brak wyników.");
        const txt = arr.map(([uid,val],i)=> `${i+1}. <@${uid}> – poziom **${val.level}** (XP: ${val.xp})`).join("\n");
        message.channel.send("🏆 **TOP 10 poziomów:**\n" + txt);
    }
});
// ========== SYSTEM PRACY NA COOLDOWN ==========
const jobCooldowns = {};
client.on('messageCreate', message => {
    if (message.content.startsWith(PREFIX + "job")) {
        const now = Date.now();
        const last = jobCooldowns[message.author.id] || 0;
        const job = jobs[Math.floor(Math.random()*jobs.length)];
        if (now - last < job.cooldown) {
            const min = Math.ceil((job.cooldown - (now-last))/60000);
            return message.reply(`Musisz odczekać jeszcze ${min} minut, zanim znów pójdziesz do pracy jako ${job.name}!`);
        }
        const earned = Math.floor(Math.random()*(job.max-job.min+1))+job.min;
        economy[message.author.id] = (economy[message.author.id] || 0) + earned;
        jobCooldowns[message.author.id] = now;
        save(economy, ECONOMY_FILE);
        message.reply(`Pracowałeś jako **${job.name}** i zarobiłeś **${earned} coins**!`);
    }
});
// ========== SYSTEM LOOTBOX ==========
client.on('messageCreate', message => {
    if (message.content.startsWith(PREFIX+"lootbox")) {
        if ((economy[message.author.id]||0) < 200) return message.reply("Musisz mieć co najmniej 200 coins, by otworzyć lootbox!");
        economy[message.author.id] -= 200;
        const rewards = [
            { txt: "wygrywasz 50 coins!", val: 50 },
            { txt: "wygrywasz 500 coins!", val: 500 },
            { txt: "wygrywasz 1000 coins!", val: 1000 },
            { txt: "nic nie wygrywasz...", val: 0 },
            { txt: "wygrywasz unikalny achievement!", val: 0, ach: "lootbox" }
        ];
        const reward = rewards[Math.floor(Math.random()*rewards.length)];
        economy[message.author.id] = (economy[message.author.id]||0) + reward.val;
        if (reward.ach) {
            if (!achievements[message.author.id]) achievements[message.author.id]=[];
            if (!achievements[message.author.id].includes(reward.ach)) {
                achievements[message.author.id].push(reward.ach);
                message.reply(`🎁 ${reward.txt} Otrzymujesz achievement!`);
            } else {
                message.reply(`🎁 ${reward.txt}`);
            }
        } else {
            message.reply(`🎁 ${reward.txt}`);
        }
        save(economy, ECONOMY_FILE); save(achievements, ACH_FILE);
    }
});
// ========== SYSTEM QUIZU ==========
const quizQuestions = [
    { q: "Stolica Polski?", a: "warszawa" },
    { q: "Największa planeta Układu Słonecznego?", a: "jowisz" },
    { q: "Ile to 7*8?", a: "56" }
];
let quizActive = false;
let quizAnswer = "";

client.on('messageCreate', message => {
    if (message.content.startsWith(PREFIX+"quiz start")) {
        if (quizActive) return message.reply("Quiz już trwa!");
        const item = quizQuestions[Math.floor(Math.random()*quizQuestions.length)];
        quizActive = true;
        quizAnswer = item.a.toLowerCase();
        message.channel.send(`❓ **QUIZ:** ${item.q}\nOdpowiedz jako pierwsza osoba na czacie!`);
    }
    if (quizActive && message.content.toLowerCase() === quizAnswer) {
        quizActive = false;
        economy[message.author.id] = (economy[message.author.id]||0) + 150;
        save(economy, ECONOMY_FILE);
        message.channel.send(`🎉 Prawidłowa odpowiedź! ${message.author} wygrywa 150 coins!`);
    }
});
// ========== SYSTEM STARBOARD (TOP WIADOMOŚCI Z REAKCJĄ ⭐) ==========
const STARBOARD_CHANNEL = "starboard";
const STAR_EMOJI = "⭐";
const STAR_COUNT = 3;

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.partial) await reaction.fetch();
    if (user.bot || reaction.emoji.name !== STAR_EMOJI) return;

    if (reaction.count >= STAR_COUNT) {
        const channel = reaction.message.guild.channels.cache.find(c => c.name === STARBOARD_CHANNEL);
        if (!channel) return;
        // Sprawdź czy już jest na starboard
        const messages = await channel.messages.fetch({ limit: 100 });
        const already = messages.find(m => m.embeds[0]?.footer?.text?.includes(reaction.message.id));
        if (already) return;
        // Stwórz embed
        const embed = new EmbedBuilder()
            .setColor(0xffac33)
            .setDescription(reaction.message.content || "[Brak treści]")
            .setAuthor({ name: reaction.message.author.tag, iconURL: reaction.message.author.displayAvatarURL() })
            .setFooter({ text: `ID: ${reaction.message.id}` })
            .setTimestamp(reaction.message.createdAt);
        if (reaction.message.attachments.size > 0) {
            embed.setImage(reaction.message.attachments.first().url);
        }
        channel.send({ content: `${STAR_EMOJI} ${reaction.count} <#${reaction.message.channel.id}>`, embeds: [embed] });
    }
});
// ========== SYSTEM BIRTHDAY (URODZINY UŻYTKOWNIKÓW) ==========
const birthdays = load("./birthdays.json", {});

client.on('messageCreate', message => {
    if (message.content.startsWith(PREFIX + "urodziny set ")) {
        const [_, __, date] = message.content.split(" ");
        // Data w formacie DD-MM
        if (!/^\d{2}-\d{2}$/.test(date)) return message.reply("Podaj datę w formacie DD-MM, np. 25-06");
        birthdays[message.author.id] = date;
        save(birthdays, "./birthdays.json");
        message.reply("Zapisano Twoje urodziny!");
    }
    if (message.content.startsWith(PREFIX + "urodziny")) {
        const date = birthdays[message.author.id];
        if (!date) return message.reply("Nie masz zapisanej daty urodzin. Ustaw: !urodziny set DD-MM");
        message.reply(`Twoje urodziny: **${date}**`);
    }
});

// Codzienny check o 10:00 UTC
setInterval(() => {
    const now = new Date();
    if (now.getUTCHours() !== 10) return;
    const today = `${String(now.getUTCDate()).padStart(2,"0")}-${String(now.getUTCMonth()+1).padStart(2,"0")}`;
    for (const id in birthdays) {
        if (birthdays[id] === today) {
            client.users.fetch(id).then(u => {
                u.send("🎂 Wszystkiego najlepszego z okazji urodzin! 🥳");
            }).catch(()=>{});
        }
    }
}, 60*60*1000);
// ========== SYSTEM INVITES (KTO ZAPROSIŁ KOGO) ==========
const invites = {};
client.on('ready', async () => {
    for (const [guildId, guild] of client.guilds.cache) {
        invites[guildId] = await guild.invites.fetch();
    }
});
client.on('guildMemberAdd', async member => {
    const newInvites = await member.guild.invites.fetch();
    const oldInvites = invites[member.guild.id];
    const invite = newInvites.find(i => (oldInvites.get(i.code)?.uses ?? 0) < i.uses);
    invites[member.guild.id] = newInvites;
    const channel = member.guild.channels.cache.find(c => c.name === config.welcomeChannel);
    if (channel && invite) {
        channel.send(`👤 <@${member.id}> dołączył z zaproszenia ${invite.inviter.tag} (${invite.code})`);
    }
});
client.on('inviteCreate', async invite => {
    invites[invite.guild.id] = await invite.guild.invites.fetch();
});
client.on('inviteDelete', async invite => {
    invites[invite.guild.id] = await invite.guild.invites.fetch();
});
// ========== SYSTEM MOTYWACJI (LOSOWY MOTYWACYJNY CYTAT) ==========
const quotes = [
    "Nigdy się nie poddawaj!",
    "Każdy dzień to nowa szansa.",
    "Sukces to suma niewielkich wysiłków powtarzanych dzień po dniu.",
    "Uwierz w siebie!",
    "Działaj, nawet jeśli się boisz!"
];

client.on('messageCreate', message => {
    if (message.content.startsWith(PREFIX+"motywacja")) {
        const q = quotes[Math.floor(Math.random()*quotes.length)];
        message.reply(`💡 Motywacja dnia: *${q}*`);
    }
});
// ========== SYSTEM PING (OPÓŹNIENIE BOTA) ==========
client.on('messageCreate', message => {
    if (message.content === PREFIX+"ping") {
        message.reply(`🏓 Pong! Opóźnienie bota: **${client.ws.ping} ms**`);
    }
});
// ========== SYSTEM POLL (ANKIETY Z WYBOREM WIELU ODPOWIEDZI) ==========
client.on('messageCreate', async message => {
    if (!message.content.startsWith(PREFIX + "poll ")) return;
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
    // Składnia: !poll Pytanie | Odp1 | Odp2 | Odp3 ...
    const [, ...rest] = message.content.split(" ");
    const pollText = rest.join(" ");
    const [question, ...options] = pollText.split(" | ");
    if (!question || options.length < 2) return message.reply("Użycie: !poll Pytanie | Odp1 | Odp2 [| Odp3 ...]");
    const emojis = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];
    if (options.length > emojis.length) return message.reply("Maksymalnie 10 opcji!");
    let desc = options.map((opt,i)=>`${emojis[i]} ${opt}`).join("\n");
    const embed = new EmbedBuilder()
        .setTitle(question)
        .setDescription(desc)
        .setColor(0x2f3136)
        .setFooter({text:"Głosuj reakcjami"});
    const pollMsg = await message.channel.send({ embeds: [embed] });
    for (let i=0; i<options.length; i++) await pollMsg.react(emojis[i]);
});
// ========== SYSTEM VOICE INFO (KTO JEST NA KANALE GŁOSOWYM) ==========
client.on('messageCreate', message => {
    if (message.content.startsWith(PREFIX+"voice")) {
        const voiceCh = message.guild.members.cache
            .filter(m=>m.voice.channel)
            .map(m=>`${m.user.tag} – <#${m.voice.channel.id}>`)
            .join("\n") || "Nikt nie jest na głosowych.";
        message.channel.send("👥 **Użytkownicy na kanałach głosowych:**\n"+voiceCh);
    }
});
// ========== SYSTEM ANTYRAID (AUTOMUTE NOWYCH BOTÓW I KONT) ==========
client.on('guildMemberAdd', member => {
    // Automute botów
    if (member.user.bot) {
        member.timeout(60*60*1000, "Anty-raid: nowy bot").catch(()=>{});
        const c = member.guild.channels.cache.find(c=>c.name===config.logsChannel);
        if (c) c.send(`🤖 Nowy bot <@${member.id}> został automatycznie wyciszony na 60min (antyraid)!`);
    }
    // Automute kont nowszych niż 3 dni
    const accountAge = (Date.now() - member.user.createdTimestamp) / (1000*60*60*24);
    if (accountAge < 3) {
        member.timeout(60*60*1000, "Anty-raid: nowe konto").catch(()=>{});
        const c = member.guild.channels.cache.find(c=>c.name===config.logsChannel);
        if (c) c.send(`🛡️ Nowy użytkownik <@${member.id}> (konto < 3 dni) automatycznie wyciszony na 60min!`);
    }
});
// ========== SYSTEM POGODA ==========
const fetch = require('node-fetch'); // Upewnij się, że masz zainstalowany node-fetch
client.on('messageCreate', async message => {
    if (message.content.startsWith(PREFIX+"pogoda ")) {
        const miasto = message.content.slice((PREFIX+"pogoda ").length).trim();
        if (!miasto) return message.reply("Podaj miasto! Np. !pogoda Warszawa");
        try {
            const url = `https://wttr.in/${encodeURIComponent(miasto)}?format=3`;
            const res = await fetch(url);
            const text = await res.text();
            message.channel.send("🌤️ " + text);
        } catch (e) {
            message.reply("Nie udało się pobrać pogody.");
        }
    }
});
// ========== SYSTEM BACKUPU (ZAPIS KANAŁÓW I RÓL) ==========
client.on('messageCreate', message => {
    if (!message.content.startsWith(PREFIX+"backup")) return;
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
    if (message.content === PREFIX+"backup create") {
        const backup = {
            channels: message.guild.channels.cache.map(c=>({name:c.name, type:c.type})),
            roles: message.guild.roles.cache.map(r=>({name:r.name, color:r.color}))
        };
        fs.writeFileSync("backup.json", JSON.stringify(backup, null, 2));
        message.reply("Backup wykonany!");
    }
    if (message.content === PREFIX+"backup show") {
        if (!fs.existsSync("backup.json")) return message.reply("Brak backupu!");
        message.channel.send({ files: ["backup.json"] });
    }
});
// ========== SYSTEM CUSTOMROLE (TWORZENIE WŁASNEJ ROLI KOLOROWEJ) ==========
client.on('messageCreate', async message => {
    if (!message.content.startsWith(PREFIX + "customrole ")) return;
    const [cmd, ...args] = message.content.slice(PREFIX.length).trim().split(/ +/);
    if (!args.length) return message.reply("Użycie: !customrole Nazwa #hexcolor (np. !customrole MojaRola #ff9900)");
    const name = args.slice(0, -1).join(" ");
    const color = args[args.length - 1];
    if (!/^#[0-9a-f]{6}$/i.test(color)) return message.reply("Podaj kolor w formacie #RRGGBB!");
    // Usuwanie poprzednich custom ról użytkownika
    const myRoles = message.member.roles.cache.filter(r => r.name.startsWith(`[${message.author.id}]`));
    for (const r of myRoles.values()) await r.delete("Usuwanie starej custom roli");
    // Tworzenie nowej roli
    const role = await message.guild.roles.create({
        name: `[${message.author.id}] ${name}`,
        color,
        mentionable: true,
        reason: "Custom rola użytkownika"
    });
    await message.member.roles.add(role);
    message.reply(`Stworzono Twoją custom rolę: <@&${role.id}>`);
});
// ========== SYSTEM EVENTÓW (OGŁOSZENIA O WYDARZENIACH) ==========
const events = load("./events.json", []);
client.on('messageCreate', message => {
    if (message.content.startsWith(PREFIX+"event oglos ")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageEvents)) return;
        const text = message.content.slice((PREFIX+"event oglos ").length);
        events.push({ by: message.author.id, text, date: Date.now() });
        save(events, "./events.json");
        message.guild.channels.cache
            .find(c => c.name === config.welcomeChannel)
            ?.send(`📢 **NOWE WYDARZENIE:** ${text}\nOrganizator: <@${message.author.id}>`);
        message.reply("Wydarzenie ogłoszone!");
    }
    if (message.content.startsWith(PREFIX+"events")) {
        if (!events.length) return message.reply("Brak wydarzeń.");
        const txt = events.slice(-5).map(e=>`• ${e.text} (od <@${e.by}>, ${new Date(e.date).toLocaleDateString()})`).join("\n");
        message.channel.send("🗓️ **Nadchodzące wydarzenia:**\n" + txt);
    }
});
// ========== SYSTEM ADVANCED LOGI (JOIN/LEAVE/ROLE/CHANNEL/UPDATE) ==========
client.on('guildMemberAdd', member => {
    const chan = member.guild.channels.cache.find(c=>c.name===config.logsChannel);
    if (chan) chan.send(`✅ Dołącza: <@${member.id}> (${member.user.tag})`);
});
client.on('guildMemberRemove', member => {
    const chan = member.guild.channels.cache.find(c=>c.name===config.logsChannel);
    if (chan) chan.send(`❌ Wychodzi: <@${member.id}> (${member.user.tag})`);
});
client.on('roleCreate', role => {
    const chan = role.guild.channels.cache.find(c=>c.name===config.logsChannel);
    if (chan) chan.send(`🟦 Utworzono rolę: **${role.name}**`);
});
client.on('roleDelete', role => {
    const chan = role.guild.channels.cache.find(c=>c.name===config.logsChannel);
    if (chan) chan.send(`⬛ Usunięto rolę: **${role.name}**`);
});
client.on('channelCreate', ch => {
    const chan = ch.guild.channels.cache.find(c=>c.name===config.logsChannel);
    if (chan) chan.send(`📗 Utworzono kanał: **${ch.name}**`);
});
client.on('channelDelete', ch => {
    const chan = ch.guild.channels.cache.find(c=>c.name===config.logsChannel);
    if (chan) chan.send(`📕 Usunięto kanał: **${ch.name}**`);
});
client.on('guildMemberUpdate', (oldM, newM) => {
    if (oldM.nickname !== newM.nickname) {
        const chan = newM.guild.channels.cache.find(c=>c.name===config.logsChannel);
        if (chan) chan.send(`✏️ Nick: <@${oldM.id}> z **${oldM.nickname}** na **${newM.nickname}**`);
    }
    if (oldM.user.avatar !== newM.user.avatar) {
        const chan = newM.guild.channels.cache.find(c=>c.name===config.logsChannel);
        if (chan) chan.send(`🖼️ Avatar: <@${oldM.id}> zmienił avatar.`);
    }
});
// ========== SYSTEM PANEL ADMINA (STATYSTYKI, RESET, RESTART) ==========
client.on('messageCreate', message => {
    if (!message.content.startsWith(PREFIX)) return;
    const cmd = message.content.slice(PREFIX.length).split(" ")[0].toLowerCase();
    // Statystyki globalne
    if (cmd === "statystyki") {
        const users = Object.keys(userstats);
        const messages = users.reduce((a,u)=>a+userstats[u].messages,0);
        const warnsCount = Object.values(warns).reduce((a,w)=>a+w.length,0);
        message.reply(`**Statystyki bota:**\nUżytkowników: ${users.length}\nWiadomości: ${messages}\nWarnów: ${warnsCount}`);
    }
    // Reset ekonomii
    if (cmd === "resetekonomia") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        economy = {};
        save(economy, ECONOMY_FILE);
        message.reply("Zresetowano ekonomię!");
    }
    // Restart bota
    if (cmd === "restart") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        message.reply("Restartuję bota...");
        process.exit(0);
    }
});
// ========== SYSTEM LEVELROLE (RANGI ZA POZIOM) ==========
const levelRoles = [
    { level: 5, roleName: "🔹 Początkujący" },
    { level: 10, roleName: "🔸 Zaawansowany" },
    { level: 20, roleName: "🌟 Weteran" }
];

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;
    const userData = userLevels[message.author.id];
    if (!userData) return;
    for (const lr of levelRoles) {
        if (userData.level >= lr.level) {
            let role = message.guild.roles.cache.find(r => r.name === lr.roleName);
            if (!role) role = await message.guild.roles.create({ name: lr.roleName, color: "Random", reason: "Level role" });
            if (!message.member.roles.cache.has(role.id)) {
                await message.member.roles.add(role);
                message.channel.send(`${message.author} zdobył rangę **${lr.roleName}** za poziom ${lr.level}!`);
            }
        }
    }
});
// ========== SYSTEM KANAŁÓW TYMCZASOWYCH (TWORZENIE NA ŻĄDANIE) ==========
client.on('messageCreate', async message => {
    if (message.content.startsWith(PREFIX + "tymczasowy")) {
        const name = message.content.split(" ").slice(1).join(" ") || `Kanał-${message.author.username}`;
        const ch = await message.guild.channels.create({
            name: name,
            type: ChannelType.GuildVoice,
            userLimit: 5,
            reason: "Kanał tymczasowy"
        });
        await ch.permissionOverwrites.edit(message.author.id, { Connect: true, ManageChannels: true });
        message.reply(`Stworzono tymczasowy kanał głosowy: <#${ch.id}>`);
        // Auto-usuwanie gdy pusty
        const interval = setInterval(async () => {
            const ref = message.guild.channels.cache.get(ch.id);
            if (!ref || ref.members.size === 0) {
                await ch.delete("Kanał tymczasowy - pusty");
                clearInterval(interval);
            }
        }, 30 * 1000);
    }
});
// ========== SYSTEM ANTYSPAM (PROSTE OGRANICZENIE WIADOMOŚCI) ==========
const spamData = {};
client.on('messageCreate', message => {
    if (message.author.bot) return;
    const now = Date.now();
    if (!spamData[message.author.id]) spamData[message.author.id] = { last: 0, count: 0 };
    if (now - spamData[message.author.id].last < 4000) {
        spamData[message.author.id].count++;
        if (spamData[message.author.id].count > 5) {
            message.member.timeout(60*1000, "Antyspam: za dużo wiadomości").catch(()=>{});
            message.channel.send(`${message.author} został wyciszony na 1 minutę za spam!`);
            spamData[message.author.id].count = 0;
        }
    } else {
        spamData[message.author.id].count = 1;
    }
    spamData[message.author.id].last = now;
});
// ========== SYSTEM POWROT DO POPRZEDNIEGO NICKU ==========
const oldNicks = {};
client.on('guildMemberUpdate', (oldM, newM) => {
    if (oldM.nickname !== newM.nickname && oldM.nickname) {
        oldNicks[oldM.id] = oldM.nickname;
    }
});
client.on('messageCreate', async message => {
    if (message.content.startsWith(PREFIX + "poprzedni_nick")) {
        const prev = oldNicks[message.author.id];
        if (!prev) return message.reply("Nie mam zapisanego Twojego poprzedniego nicku.");
        await message.member.setNickname(prev);
        message.reply(`Przywrócono poprzedni nick: **${prev}**`);
    }
});
// ========== SYSTEM BLACKLIST/WHITELIST ==========
const blacklist = load('./blacklist.json', []);
const whitelist = load('./whitelist.json', []);

client.on('messageCreate', message => {
    if (blacklist.includes(message.author.id)) {
        message.delete().catch(()=>{});
        return;
    }
    if (message.content.startsWith(PREFIX+"blacklist add ")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const user = message.mentions.users.first();
        if (!user) return message.reply("Podaj użytkownika!");
        if (!blacklist.includes(user.id)) {
            blacklist.push(user.id);
            save(blacklist, './blacklist.json');
            message.reply(`Dodano <@${user.id}> do blacklisty.`);
        }
    }
    if (message.content.startsWith(PREFIX+"whitelist add ")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const user = message.mentions.users.first();
        if (!user) return message.reply("Podaj użytkownika!");
        if (!whitelist.includes(user.id)) {
            whitelist.push(user.id);
            save(whitelist, './whitelist.json');
            message.reply(`Dodano <@${user.id}> do whitelisty.`);
        }
    }
});
// ========== SYSTEM ZAPISYWANIA WIADOMOŚCI Z KANAŁU (ARCHIWUM CZATU) ==========
client.on('messageCreate', message => {
    if (message.content.startsWith(PREFIX + "zapiszczat")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const channel = message.mentions.channels.first() || message.channel;
        channel.messages.fetch({ limit: 100 }).then(msgs => {
            const logs = msgs
                .map(m => `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`)
                .reverse()
                .join("\n");
            fs.writeFileSync(`chatlog_${channel.id}.txt`, logs);
            message.reply("Zapisano ostatnie 100 wiadomości do pliku!");
        }).catch(() => message.reply("Nie udało się pobrać wiadomości."));
    }
});
// ========== SYSTEM POWIADOMIEŃ O ZMIANACH NA SERWERZE ==========
client.on('guildUpdate', (oldGuild, newGuild) => {
    const channel = newGuild.channels.cache.find(c => c.name === config.logsChannel);
    if (!channel) return;
    if (oldGuild.name !== newGuild.name) {
        channel.send(`🔔 **Zmieniono nazwę serwera:**\nPrzed: **${oldGuild.name}**\nPo: **${newGuild.name}**`);
    }
    if (oldGuild.icon !== newGuild.icon) {
        channel.send(`🖼️ **Zmieniono ikonę serwera!**`);
    }
});
client.on('roleUpdate', (oldRole, newRole) => {
    const channel = newRole.guild.channels.cache.find(c => c.name === config.logsChannel);
    if (!channel) return;
    if (oldRole.name !== newRole.name) {
        channel.send(`🔄 **Zmieniono nazwę roli:**\nPrzed: **${oldRole.name}**\nPo: **${newRole.name}**`);
    }
    if (oldRole.color !== newRole.color) {
        channel.send(`🎨 **Zmieniono kolor roli:** ${newRole.name}`);
    }
});
// ========== SYSTEM KANAŁÓW TEKSTOWYCH NA ŻĄDANIE (PRYWATNY CZAT) ==========
client.on('messageCreate', async message => {
    if (message.content.startsWith(PREFIX + "privchat")) {
        const name = `prywatny-${message.author.username}`;
        const ch = await message.guild.channels.create({
            name,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: message.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: message.author.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
            ]
        });
        message.reply(`Stworzono prywatny kanał tekstowy: <#${ch.id}> (zostanie usunięty po 5 min bez wiadomości)`);
        // Usuwanie gdy pusty
        setTimeout(async () => {
            const ref = message.guild.channels.cache.get(ch.id);
            if (ref && ref.messages.cache.size === 0) await ch.delete("Prywatny czat - pusty po 5 min");
        }, 5 * 60 * 1000);
    }
});
// ========== SYSTEM POWITANIA Z GRAFIKĄ (GENEROWANY OBRAZEK) ==========
const { createCanvas, loadImage, registerFont } = require('canvas'); // zainstaluj 'canvas' npm install canvas

client.on('guildMemberAdd', async member => {
    const channel = member.guild.channels.cache.find(c => c.name === config.welcomeChannel);
    if (!channel) return;
    const canvas = createCanvas(700, 250);
    const ctx = canvas.getContext('2d');
    // Tło i tekst
    const bg = await loadImage('https://i.imgur.com/3nQyF2z.png'); // możesz podmienić na własne tło
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 36px Sans';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Witaj, ${member.user.username}!`, 230, 80);
    ctx.font = '24px Sans';
    ctx.fillText(`na serwerze ${member.guild.name}`, 230, 130);
    // Avatar
    const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png' }));
    ctx.beginPath();
    ctx.arc(120, 125, 85, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 35, 40, 170, 170);
    // Wyślij
    const buffer = canvas.toBuffer();
    channel.send({ content: `👋 Witaj <@${member.id}>!`, files: [{ attachment: buffer, name: "powitanie.png" }] });
});
// ========== SYSTEM KANAŁU Z POWIADOMIENIAMI O STREAMACH ==========
client.on('messageCreate', message => {
    if (message.content.startsWith(PREFIX + "stream add ")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return;
        const url = message.content.split(" ")[2];
        if (!/^https:\/\/(www\.)?twitch\.tv\/[a-zA-Z0-9_]{4,25}$/.test(url)) return message.reply("Podaj poprawny link do Twitcha!");
        if (!fs.existsSync('streams.json')) fs.writeFileSync('streams.json', JSON.stringify([]));
        const streams = JSON.parse(fs.readFileSync('streams.json'));
        if (!streams.includes(url)) streams.push(url);
        fs.writeFileSync('streams.json', JSON.stringify(streams, null, 2));
        message.reply("Dodano stream do monitorowania!");
    }
});
setInterval(async () => {
    if (!fs.existsSync('streams.json')) return;
    const streams = JSON.parse(fs.readFileSync('streams.json'));
    for (const url of streams) {
        // Prosty check: czy strona zawiera "isLiveBroadcast":true (niezawodność zależy od Twitcha!)
        try {
            const res = await fetch(url);
            const txt = await res.text();
            if (txt.includes('"isLiveBroadcast":true')) {
                // Powiadom na kanał
                const channel = client.channels.cache.find(c => c.name === "streamy");
                if (channel) channel.send(`🔴 Stream na żywo! ${url}`);
            }
        } catch {}
    }
}, 5 * 60 * 1000);
// ========== SYSTEM AUTOROLE NA PODSTAWIE REAKCJI ==========
client.on('messageCreate', async message => {
    if (message.content.startsWith(PREFIX + "autorolemsg")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const [_, ...roleNames] = message.content.split(" ");
        if (!roleNames.length) return message.reply("Podaj nazwy ról (np. !autorolemsg PC Xbox PS4)");
        const txt = roleNames.map((r, i) => `${String.fromCodePoint(0x1F1E6 + i)} - ${r}`).join("\n");
        const msg = await message.channel.send("Wybierz swoją rolę klikając odpowiednią reakcję:\n" + txt);
        for (let i = 0; i < roleNames.length; i++) {
            await msg.react(String.fromCodePoint(0x1F1E6 + i));
        }
        fs.writeFileSync(`autorolemsg_${msg.id}.json`, JSON.stringify(roleNames, null, 2));
    }
});
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    const file = `autorolemsg_${reaction.message.id}.json`;
    if (!fs.existsSync(file)) return;
    const roleNames = JSON.parse(fs.readFileSync(file));
    const idx = reaction.emoji.name.codePointAt(0) - 0x1F1E6;
    const roleName = roleNames[idx];
    if (!roleName) return;
    const member = await reaction.message.guild.members.fetch(user.id);
    let role = reaction.message.guild.roles.cache.find(r => r.name === roleName);
    if (!role) role = await reaction.message.guild.roles.create({ name: roleName });
    await member.roles.add(role);
});
client.on('messageReactionRemove', async (reaction, user) => {
    if (user.bot) return;
    const file = `autorolemsg_${reaction.message.id}.json`;
    if (!fs.existsSync(file)) return;
    const roleNames = JSON.parse(fs.readFileSync(file));
    const idx = reaction.emoji.name.codePointAt(0) - 0x1F1E6;
    const roleName = roleNames[idx];
    if (!roleName) return;
    const member = await reaction.message.guild.members.fetch(user.id);
    const role = reaction.message.guild.roles.cache.find(r => r.name === roleName);
    if (role) await member.roles.remove(role);
});
// ========== SYSTEM MULTI-LANG (KOMENDY W WIELU JĘZYKACH) ==========
const lang = load('./lang.json', {}); // { "guildId": "pl" }
const translations = {
    pl: {
        hi: "Cześć!",
        help: "Dostępne komendy: !hi, !help, !balance, !poziom"
    },
    en: {
        hi: "Hello!",
        help: "Available commands: !hi, !help, !balance, !level"
    }
};
client.on('messageCreate', message => {
    const guildLang = lang[message.guild?.id] || "pl";
    if (message.content === "!hi") return message.reply(translations[guildLang].hi);
    if (message.content === "!help") return message.reply(translations[guildLang].help);
    if (message.content.startsWith("!setlang ")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const l = message.content.split(" ")[1];
        if (!translations[l]) return message.reply("Dostępne: pl, en");
        lang[message.guild.id] = l;
        save(lang, './lang.json');
        message.reply("Zmieniono język bota!");
    }
});
// ========== SYSTEM AUTOMATYCZNEGO PRZYPOMNIENIA O WYDARZENIACH ==========
setInterval(() => {
    const now = Date.now();
    if (!fs.existsSync('./events.json')) return;
    const events = load('./events.json', []);
    for (const ev of events) {
        if (ev.notified) continue;
        // 24h przed wydarzeniem
        if (ev.date - now < 24*60*60*1000 && ev.date - now > 23*60*60*1000) {
            const guilds = client.guilds.cache;
            for (const guild of guilds.values()) {
                const ch = guild.channels.cache.find(c => c.name === config.welcomeChannel);
                if (ch) ch.send(`⏰ Przypomnienie! Już jutro wydarzenie: **${ev.text}**`);
            }
            ev.notified = true;
            save(events, './events.json');
        }
    }
}, 30 * 60 * 1000);
// ========== SYSTEM INTEGRACJI Z API (PRZYKŁAD: CYTAT Z ZEWNĘTRZNEJ STRONY) ==========
client.on('messageCreate', async message => {
    if (message.content === PREFIX + "cytat") {
        try {
            const res = await fetch("https://api.quotable.io/random");
            const data = await res.json();
            message.reply(`💬 "${data.content}"\n— *${data.author}*`);
        } catch {
            message.reply("Nie udało się pobrać cytatu.");
        }
    }
});
// ========== SYSTEM AUTOMATYCZNYCH ROLI NA PODSTAWIE AKTYWNOŚCI ==========
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;
    if (!userstats[message.author.id]) userstats[message.author.id] = { messages: 0, joins: 0, leaves: 0, reacts: 0 };
    // Jeśli napisał 1000+ wiadomości, daj specjalną rolę
    if (userstats[message.author.id].messages === 1000) {
        let role = message.guild.roles.cache.find(r=>r.name==="💬 Aktywny");
        if (!role) role = await message.guild.roles.create({ name: "💬 Aktywny", color: "BLURPLE" });
        await message.member.roles.add(role);
        message.channel.send(`${message.author} otrzymuje rolę 💬 Aktywny za 1000 wiadomości!`);
    }
});
// ========== SYSTEM RSS (POWIADOMIENIA O NOWOŚCIACH Z RSS) ==========
const Parser = require('rss-parser'); // npm install rss-parser
const rssFeeds = load('./rssfeeds.json', []); // [{ url: "...", channelId: "..." }]
const rssLast = load('./rsslast.json', {}); // { url: lastGuid }

client.on('messageCreate', async message => {
    if (message.content.startsWith(PREFIX + "rss add ")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const [_, __, url] = message.content.split(" ");
        if (!url) return message.reply("Podaj url RSS!");
        rssFeeds.push({ url, channelId: message.channel.id });
        save(rssFeeds, './rssfeeds.json');
        message.reply("Dodano RSS do monitorowania.");
    }
});

setInterval(async () => {
    const parser = new Parser();
    for (const feed of rssFeeds) {
        try {
            const data = await parser.parseURL(feed.url);
            if (!data.items || !data.items.length) continue;
            const lastGuid = rssLast[feed.url];
            const newItems = [];
            for (const item of data.items) {
                if (item.guid === lastGuid) break;
                newItems.push(item);
            }
            if (newItems.length) {
                rssLast[feed.url] = newItems[0].guid;
                save(rssLast, './rsslast.json');
                const channel = client.channels.cache.get(feed.channelId);
                if (channel) {
                    for (const item of newItems.reverse()) {
                        channel.send(`📰 **${item.title}**\n${item.link}`);
                    }
                }
            }
        } catch {}
    }
}, 5 * 60 * 1000);
// ========== SYSTEM ADVANCED TICKETS (PANEL REAKCJI I ZAMYKANIE PRZYCISKIEM) ==========
const { ButtonBuilder,  ButtonStyle } = require('discord.js');

client.on('messageCreate', async message => {
    if (message.content === PREFIX + "ticket-panel") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return;
        const btn = new ButtonBuilder()
            .setLabel("Otwórz ticket")
            .setCustomId("open_ticket")
            .setStyle(ButtonStyle.Success);
        const row = ().addComponents(btn);
        await message.channel.send({ content: "Kliknij, aby otworzyć ticket:", components: [row] });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId === "open_ticket") {
        const ch = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                { id: interaction.client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
            ]
        });
        await ch.send(`<@${interaction.user.id}> Twój ticket został utworzony!`);
        const closeBtn = new ButtonBuilder().setLabel("Zamknij").setCustomId("close_ticket").setStyle(ButtonStyle.Danger);
        const row = ().addComponents(closeBtn);
        await ch.send({ content: "Kliknij, aby zamknąć ticket.", components: [row] });
        await interaction.reply({ content: `Stworzono ticket: <#${ch.id}>`, ephemeral: true });
    }
    if (interaction.customId === "close_ticket") {
        await interaction.channel.send("Ticket zostanie zamknięty za 5 sekund...");
        setTimeout(async () => {
            await interaction.channel.delete();
        }, 5000);
    }
});
// ========== SYSTEM MUSIC (PROSTE ODTWARZANIE Z YOUTUBE) ==========
const ytdl = require('ytdl-core'); // npm install ytdl-core @discordjs/voice
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

client.on('messageCreate', async message => {
    if (message.content.startsWith(PREFIX + "play ")) {
        const url = message.content.split(" ")[1];
        if (!ytdl.validateURL(url)) return message.reply("Podaj poprawny link do YouTube!");
        if (!message.member.voice.channel) return message.reply("Wejdź na kanał głosowy!");
        const connection = joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        });
        const stream = ytdl(url, { filter: 'audioonly' });
        const resource = createAudioResource(stream);
        const player = createAudioPlayer();
        player.play(resource);
        connection.subscribe(player);
        player.on(AudioPlayerStatus.Idle, () => connection.destroy());
        message.reply("Odtwarzam muzykę!");
    }
});
// ========== SYSTEM AUTOMATYCZNEGO ARCHIWUM (CO NOC ZAPISUJE WIADOMOŚCI Z WYBRANYCH KANAŁÓW) ==========
const archiveChannels = ["ogólny-chat", "moderacja"];
function archiveNow() {
    for (const chName of archiveChannels) {
        const channel = client.channels.cache.find(c => c.name === chName);
        if (!channel) continue;
        channel.messages.fetch({ limit: 100 }).then(msgs => {
            const log = msgs.map(m => `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`).reverse().join("\n");
            fs.writeFileSync(`archive_${chName}_${Date.now()}.txt`, log);
        });
    }
}
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 3 && now.getMinutes() === 0) archiveNow();
}, 60 * 1000);
// ========== SYSTEM POWITANIA NA PRIV (DM) ==========
client.on('guildMemberAdd', member => {
    member.send(
        `👋 Witaj na serwerze **${member.guild.name}**!\nZapoznaj się z regulaminem na kanale #regulamin i baw się dobrze!`
    ).catch(() => {});
});
// ========== SYSTEM ZAPLANOWANYCH WIADOMOŚCI (SCHEDULER) ==========
const scheduled = load('./scheduled.json', []); // [{ text, channelId, time }]
client.on('messageCreate', message => {
    if (message.content.startsWith(PREFIX + "zaplanowana ")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        // !zaplanowana 2025-07-01T12:00:00 Treść
        const [_, datetime, ...rest] = message.content.split(" ");
        const text = rest.join(" ");
        if (!datetime || !text) return message.reply("Użycie: !zaplanowana 2025-07-01T12:00:00 Treść");
        scheduled.push({ text, channelId: message.channel.id, time: new Date(datetime).getTime() });
        save(scheduled, './scheduled.json');
        message.reply("Wiadomość zaplanowana!");
    }
});
setInterval(() => {
    const now = Date.now();
    for (let i = scheduled.length - 1; i >= 0; i--) {
        if (scheduled[i].time <= now) {
            const ch = client.channels.cache.get(scheduled[i].channelId);
            if (ch) ch.send(`⏰ Zaplanowana wiadomość:\n${scheduled[i].text}`);
            scheduled.splice(i, 1);
            save(scheduled, './scheduled.json');
        }
    }
}, 60 * 1000);
// ========== SYSTEM WEBHOOKÓW (SZYBKIE POWIADOMIENIA Z ZEWNĘTRZNYCH APLIKACJI) ==========
client.on('messageCreate', async message => {
    if (message.content.startsWith(PREFIX + "webhook create ")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageWebhooks)) return;
        const name = message.content.slice((PREFIX + "webhook create ").length).trim();
        const webhook = await message.channel.createWebhook({ name: name || "Webhook" });
        message.reply(`Stworzono webhook!\nURL: ${webhook.url}`);
    }
});
// ========== SYSTEM INTEGRACJI Z GOOGLE SHEETS (PRZYKŁAD: DODAWANIE REKORDU) ==========
const { GoogleSpreadsheet } = require('google-spreadsheet'); // npm install google-spreadsheet
const sheetId = "TWÓJ_SHEET_ID";
const creds = require('./google-credentials.json'); // Google service account

client.on('messageCreate', async message => {
    if (message.content.startsWith(PREFIX + "sheet add ")) {
        const text = message.content.slice((PREFIX+"sheet add ").length);
        try {
            const doc = new GoogleSpreadsheet(sheetId);
            await doc.useServiceAccountAuth(creds);
            await doc.loadInfo();
            const sheet = doc.sheetsByIndex[0];
            await sheet.addRow({ Timestamp: new Date().toISOString(), User: message.author.tag, Text: text });
            message.reply("Dodano do Google Sheets!");
        } catch {
            message.reply("Błąd integracji z Google Sheets!");
        }
    }
});
// ========== SYSTEM WŁASNYCH KOMEND PRZEZ WWW (CUSTOM COMMANDS) ==========
const customCommands = load('./customcmds.json', []); // [{ trigger, response }]
client.on('messageCreate', message => {
    if (message.author.bot) return;
    // Sprawdź, czy wiadomość jest custom komendą
    const found = customCommands.find(cmd => message.content.toLowerCase() === PREFIX + cmd.trigger.toLowerCase());
    if (found) return message.channel.send(found.response);
    // Dodawanie komendy (tylko admin)
    if (message.content.startsWith(PREFIX + "komenda dodaj ")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        // !komenda dodaj test Odpowiedź na test
        const [_, __, trigger, ...rest] = message.content.split(" ");
        const response = rest.join(" ");
        if (!trigger || !response) return message.reply("Użycie: !komenda dodaj wyraz Odpowiedź");
        customCommands.push({ trigger, response });
        save(customCommands, './customcmds.json');
        message.reply(`Dodano komendę !${trigger}`);
    }
    // Usuwanie komendy
    if (message.content.startsWith(PREFIX + "komenda usuń ")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const [_, __, trigger] = message.content.split(" ");
        const idx = customCommands.findIndex(cmd => cmd.trigger === trigger);
        if (idx === -1) return message.reply("Nie ma takiej komendy!");
        customCommands.splice(idx, 1);
        save(customCommands, './customcmds.json');
        message.reply(`Usunięto komendę !${trigger}`);
    }
});
// ========== SYSTEM GŁOSOWANIA (ZAAWANSOWANE VOTE Z PRZYCISKAMI) ==========
const { , ButtonBuilder, ButtonStyle } = require('discord.js');
const votes = {}; // { messageId: { yes: [userIds], no: [userIds] } }

client.on('messageCreate', async message => {
    if (message.content.startsWith(PREFIX + "vote ")) {
        const question = message.content.slice((PREFIX + "vote ").length);
        const row = ().addComponents(
            new ButtonBuilder().setCustomId('vote_yes').setLabel('✅ Tak').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('vote_no').setLabel('❌ Nie').setStyle(ButtonStyle.Danger)
        );
        const pollMsg = await message.channel.send({ content: `🗳️ **Głosowanie:** ${question}`, components: [row] });
        votes[pollMsg.id] = { yes: [], no: [] };
    }
});
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    const poll = votes[interaction.message.id];
    if (!poll) return;
    if (interaction.customId === "vote_yes") {
        if (!poll.yes.includes(interaction.user.id)) poll.yes.push(interaction.user.id);
        poll.no = poll.no.filter(id => id !== interaction.user.id);
        await interaction.reply({ content: "Oddano głos na TAK!", ephemeral: true });
    }
    if (interaction.customId === "vote_no") {
        if (!poll.no.includes(interaction.user.id)) poll.no.push(interaction.user.id);
        poll.yes = poll.yes.filter(id => id !== interaction.user.id);
        await interaction.reply({ content: "Oddano głos na NIE!", ephemeral: true });
    }
    // Wyniki
    if (interaction.customId === "vote_yes" || interaction.customId === "vote_no") {
        const yes = poll.yes.length;
        const no = poll.no.length;
        await interaction.message.edit({ content: `🗳️ **Głosowanie:** ${interaction.message.content.split('\n')[0].replace("🗳️ **Głosowanie:** ", "")}\nWyniki: ✅ ${yes} | ❌ ${no}`, components: interaction.message.components });
    }
});
// ========== SYSTEM ADVANCED ROLE (SAMODZIELNE TWORZENIE I WYBIERANIE ROLI) ==========
client.on('messageCreate', async message => {
    if (message.content.startsWith(PREFIX + "stworzrole ")) {
        // !stworzrole Nazwa #hex
        const [_, ...args] = message.content.split(" ");
        const color = args[args.length - 1];
        const name = args.slice(0, -1).join(" ");
        if (!/^#[0-9a-f]{6}$/i.test(color)) return message.reply("Podaj kolor w formacie #RRGGBB!");
        let role = message.guild.roles.cache.find(r => r.name === name);
        if (!role) role = await message.guild.roles.create({ name, color });
        await message.member.roles.add(role);
        message.reply(`Otrzymałeś rolę <@&${role.id}>!`);
    }
    if (message.content.startsWith(PREFIX + "wybierzrole ")) {
        const name = message.content.slice((PREFIX + "wybierzrole ").length);
        const role = message.guild.roles.cache.find(r => r.name === name);
        if (!role) return message.reply("Nie ma takiej roli!");
        await message.member.roles.add(role);
        message.reply(`Otrzymałeś rolę <@&${role.id}>!`);
    }
    if (message.content.startsWith(PREFIX + "usunrole ")) {
        const name = message.content.slice((PREFIX + "usunrole ").length);
        const role = message.guild.roles.cache.find(r => r.name === name);
        if (!role) return message.reply("Nie ma takiej roli!");
        await message.member.roles.remove(role);
        message.reply(`Usunięto rolę <@&${role.id}>!`);
    }
});
// ========== SYSTEM AUTOMATYCZNYCH OGŁOSZEŃ (CO X GODZIN/ MINUT) ==========
const autoAnnounce = load('./autoannounce.json', []); // [{ text, channelId, intervalMin, last }]
client.on('messageCreate', message => {
    if (message.content.startsWith(PREFIX + "ogloszenie auto ")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        // !ogloszenie auto 60 Treść
        const [_, __, interval, ...rest] = message.content.split(" ");
        const text = rest.join(" ");
        if (!interval || !text) return message.reply("Użycie: !ogloszenie auto 60 Treść");
        autoAnnounce.push({ text, channelId: message.channel.id, intervalMin: parseInt(interval), last: 0 });
        save(autoAnnounce, './autoannounce.json');
        message.reply("Dodano automatyczne ogłoszenie!");
    }
});
setInterval(() => {
    const now = Date.now();
    for (const ann of autoAnnounce) {
        if (now - ann.last > ann.intervalMin * 60 * 1000) {
            const ch = client.channels.cache.get(ann.channelId);
            if (ch) ch.send(ann.text);
            ann.last = now;
            save(autoAnnounce, './autoannounce.json');
        }
    }
}, 60 * 1000);
// ========== SYSTEM LOSOWANIA WYZWANIA GAMINGOWEGO (CHALLENGE DNIA) ==========
const challenges = [
    "Zagraj dziś 3 mecze bez przekleństw na voice 😇",
    "Wygraj jedną rundę w Fortnite tylko z pistoletem!",
    "W Wiedźminie: pokonaj dowolnego potwora bez użycia znaków.",
    "W Cyberpunku: przejdź misję bez alarmowania wrogów.",
    "W FIFA: wygraj mecz, nie strzelając gola głową.",
    "Nagraj śmieszny moment z gry i wrzuć na #gaming-media!",
    "Zaproś kogoś nowego na serwer i zagrajcie razem.",
    "Podziel się najlepszą poradą do swojej ulubionej gry na #porady!"
];

client.on('messageCreate', message => {
    if (message.content === PREFIX + "challenge") {
        const ch = challenges[Math.floor(Math.random() * challenges.length)];
        message.channel.send(`🎲 **Wyzwanie dnia:**\n${ch}`);
    }
});
// ========== SYSTEM RANKINGU GRACZY (KOMENDA TOP NAJAKTYWNIEJSZYCH) ==========
const playerStats = load('./playerstats.json', {}); // { userId: { messages: 0, wins: 0, ... } }

client.on('messageCreate', message => {
    if (message.author.bot || !message.guild) return;
    if (!playerStats[message.author.id]) playerStats[message.author.id] = { messages: 0, wins: 0 };
    playerStats[message.author.id].messages++;
    save(playerStats, './playerstats.json');

    if (message.content.startsWith(PREFIX + "top")) {
        // Ranking wg liczby wiadomości (aktywność)
        const top = Object.entries(playerStats)
            .sort((a, b) => b[1].messages - a[1].messages)
            .slice(0, 5)
            .map(([id, stats], i) => `${i + 1}. <@${id}> — ${stats.messages} wiadomości`)
            .join("\n");
        message.channel.send("🏆 **Top 5 najbardziej aktywnych graczy:**\n" + top);
    }
});
// ========== SYSTEM CYTATÓW WIEDŹMINA/CYBERPUNKA ==========
const gameQuotes = [
    `"Płotka, nie czas na żarty." — Wiedźmin 3`,
    `"Nie ma szczęścia, są tylko decyzje." — Cyberpunk 2077`,
    `"Wybierając zło mniejsze, zawsze wybierasz zło." — Wiedźmin`,
    `"Miasto daje, miasto zabiera." — Cyberpunk`,
    `"Kto nie ryzykuje, ten nie pije miodu." — Wiedźmin`
];

client.on('messageCreate', message => {
    if (message.content === PREFIX + "cytat") {
        const quote = gameQuotes[Math.floor(Math.random() * gameQuotes.length)];
        message.channel.send(`🎮 **Cytat z gry:**\n${quote}`);
    }
});
// ========== SYSTEM LOSOWANIA DRUŻYNY DO GRY (np. FIFA/CS/FORTNITE) ==========
client.on('messageCreate', message => {
    if (message.content.startsWith(PREFIX + "losujdruzyne")) {
        // !losujdruzyne @osoba1 @osoba2 @osoba3 @osoba4 ...
        const members = message.mentions.users.map(u => u.toString());
        if (members.length < 2) return message.reply("Zaznacz przynajmniej 2 osoby!");
        // Tasowanie
        for (let i = members.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [members[i], members[j]] = [members[j], members[i]];
        }
        const half = Math.ceil(members.length / 2);
        const t1 = members.slice(0, half).join(", ");
        const t2 = members.slice(half).join(", ");
        message.channel.send(`🎲 **Wylosowano drużyny:**\n**Drużyna 1:** ${t1}\n**Drużyna 2:** ${t2}`);
    }
});
// ========== SYSTEM ZGADNIJ POSTAĆ Z GRY (MINIGRA) ==========
const characters = [
    { clue: "Biały Wilk", answer: "Geralt" },
    { clue: "Netrunner z Night City", answer: "V" },
    { clue: "Brazylijski piłkarz, ikona FIFY", answer: "Pelé" },
    { clue: "Budowniczy, wygrywa w Fortnite", answer: "Jonesy" }
];
let currentGuess = null;

client.on('messageCreate', message => {
    if (message.content === PREFIX + "zgadnijpostać") {
        currentGuess = characters[Math.floor(Math.random() * characters.length)];
        message.channel.send(`🕵️‍♂️ **Zgadnij postać:** ${currentGuess.clue}\n(Odpowiedz na czacie)`);
    } else if (currentGuess && message.content.toLowerCase().includes(currentGuess.answer.toLowerCase())) {
        message.channel.send(`✅ Brawo, to był **${currentGuess.answer}**!`);
        currentGuess = null;
    }
});
// ========== AUTOMATYCZNY PRZEWODNIK PO FUNKCJACH BOTA (!setup) ==========

const helpSections = [
    {
        title: "🎲 Wyzwanie dnia",
        usage: "!challenge",
        desc: "Losuje gamingowe wyzwanie na dziś (np. Fortnite, Wiedźmin, Cyberpunk, FIFA)."
    },
    {
        title: "🏆 Ranking aktywności",
        usage: "!top",
        desc: "Wyświetla TOP 5 najbardziej aktywnych graczy na serwerze."
    },
    {
        title: "🎮 Cytat z gry",
        usage: "!cytat",
        desc: "Losowy cytat z Wiedźmina lub Cyberpunka."
    },
    {
        title: "👥 Losowanie drużyn",
        usage: "!losujdruzyne @osoba1 @osoba2 ...",
        desc: "Podziel wskazane osoby na dwie drużyny do gry."
    },
    {
        title: "🕵️‍♂️ Minigra: Zgadnij postać",
        usage: "!zgadnijpostać",
        desc: "Bot podaje opis, kto pierwszy zgadnie postać – wygrywa!"
    },
    {
        title: "🛡️ Tworzenie własnej roli",
        usage: "!customrole Nazwa #RRGGBB",
        desc: "Stwórz własną kolorową rolę na serwerze."
    },
    {
        title: "🗓️ Eventy",
        usage: "!event oglos Treść\n!events",
        desc: "Ogłaszanie i lista nadchodzących wydarzeń społeczności."
    },
    {
        title: "🔄 Zmiana języka bota",
        usage: "!setlang pl / !setlang en",
        desc: "Ustaw język bota na polski lub angielski."
    },
    {
        title: "🎭 Cytat dnia (API)",
        usage: "!cytat",
        desc: "Bot pobiera losowy cytat z zewnętrznego API."
    },
    {
        title: "🔔 Powiadomienia o streamach",
        usage: "!stream add [link do Twitcha]",
        desc: "Dodaj stream do monitorowania. Bot powiadomi, gdy rozpocznie się transmisja."
    },
    {
        title: "📊 Głosowanie",
        usage: "!vote TreśćPytania",
        desc: "Rozpocznij głosowanie z przyciskami TAK/NIE."
    },
    {
        title: "🎫 Tickets",
        usage: "!ticket-panel",
        desc: "Panel do zakładania ticketów przez użytkowników (przycisk)."
    },
    {
        title: "⭐ LevelRole",
        usage: "Automatyczne nadawanie ról za osiągnięcie poziomu na serwerze.",
        desc: "Im więcej piszesz, tym wyższy poziom i lepsze rangi!"
    },
    {
        title: "🔒 Blacklist/Whitelist",
        usage: "!blacklist add @użytkownik\n!whitelist add @użytkownik",
        desc: "Zarządzanie dostępem użytkowników do serwera."
    },
    {
        title: "💬 Prywatny czat",
        usage: "!privchat",
        desc: "Tworzy dla Ciebie prywatny kanał tekstowy (usuwa się po 5 minutach bez aktywności)."
    },
    {
        title: "🎤 Kanał tymczasowy",
        usage: "!tymczasowy [nazwa]",
        desc: "Tworzy tymczasowy kanał głosowy (usuwa się automatycznie, gdy pusty)."
    },
    {
        title: "🛡️ Antyspam",
        usage: "Automatyczny",
        desc: "Chroni serwer przed spamem – automatyczne timeouty."
    },
    {
        title: "📝 Zapisz czat",
        usage: "!zapiszczat [#kanał]",
        desc: "Zapisuje ostatnie 100 wiadomości z kanału do pliku."
    },
    {
        title: "⚡ Autorole przez reakcje",
        usage: "!autorolemsg Nazwa1 Nazwa2 ...",
        desc: "Tworzy panel reakcji do samodzielnego wybierania ról przez użytkowników."
    },
    {
        title: "🔔 RSS/GitHub",
        usage: "!rss add [URL]\n!ghwatch owner/repo",
        desc: "Powiadomienia o nowościach z RSS lub o commitach na GitHubie."
    },
    {
        title: "⏰ Zaplanowane wiadomości",
        usage: "!zaplanowana RRRR-MM-DDTHH:mm Treść",
        desc: "Bot wyśle wiadomość o wskazanej dacie i godzinie."
    },
    {
        title: "🔊 Muzyka",
        usage: "!play [link do YouTube]",
        desc: "Odtwarza muzykę z YouTube na Twoim kanale głosowym."
    }
    // Dodaj kolejne punkty jeśli masz dodatkowe funkcje!
];

client.on('messageCreate', async message => {
    if (message.content.toLowerCase() === "!setup") {
        let helpMsg = "**📜 Przewodnik po funkcjach bota:**\n";
        helpSections.forEach(h =>
            helpMsg += `\n__${h.title}__\n**Użycie:** ${h.usage}\n${h.desc}\n`
        );
        // Jeśli chcesz, wyślij na priv adminowi:
        // await message.author.send(helpMsg).catch(()=>{});
        // Lub na kanał gdzie wpisano !setup:
        await message.channel.send(helpMsg);
    }
});
// ========== ROZBUDOWANY INTERAKTYWNY PRZEWODNIK PO FUNKCJACH BOTA (!setup) ==========

const { , StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

const helpSections = [
    {
        group: "🎮 Gaming",
        items: [
            {
                emoji: "🎲",
                title: "Wyzwanie dnia",
                usage: "!challenge",
                desc: "Losuje gamingowe wyzwanie na dziś (np. Fortnite, Wiedźmin, Cyberpunk, FIFA)."
            },
            {
                emoji: "🏆",
                title: "Ranking aktywności",
                usage: "!top",
                desc: "Wyświetla TOP 5 najbardziej aktywnych graczy na serwerze."
            },
            {
                emoji: "👥",
                title: "Losowanie drużyn",
                usage: "!losujdruzyne @osoba1 @osoba2 ...",
                desc: "Podziel wskazane osoby na dwie drużyny do gry."
            },
            {
                emoji: "🕵️‍♂️",
                title: "Minigra: Zgadnij postać",
                usage: "!zgadnijpostać",
                desc: "Bot podaje opis, kto pierwszy zgadnie postać – wygrywa!"
            },
            {
                emoji: "🎮",
                title: "Cytat z gry",
                usage: "!cytat",
                desc: "Losowy cytat z Wiedźmina lub Cyberpunka."
            }
        ]
    },
    {
        group: "🛡️ Administracja",
        items: [
            {
                emoji: "⭐",
                title: "LevelRole",
                usage: "Automatyczne nadawanie ról za poziom.",
                desc: "Im więcej piszesz, tym wyższy poziom i lepsze rangi!"
            },
            {
                emoji: "🔒",
                title: "Blacklist/Whitelist",
                usage: "!blacklist add @użytkownik\n!whitelist add @użytkownik",
                desc: "Zarządzanie dostępem użytkowników do serwera."
            },
            {
                emoji: "🛡️",
                title: "Antyspam",
                usage: "Automatyczny",
                desc: "Chroni serwer przed spamem – automatyczne timeouty."
            },
            {
                emoji: "📝",
                title: "Zapisz czat",
                usage: "!zapiszczat [#kanał]",
                desc: "Zapisuje ostatnie 100 wiadomości z kanału do pliku."
            },
            {
                emoji: "⚡",
                title: "Autorole przez reakcje",
                usage: "!autorolemsg Nazwa1 Nazwa2 ...",
                desc: "Tworzy panel do samodzielnego wybierania ról przez użytkowników."
            },
            {
                emoji: "🔔",
                title: "RSS/GitHub",
                usage: "!rss add [URL]\n!ghwatch owner/repo",
                desc: "Powiadomienia o nowościach z RSS lub o commitach na GitHubie."
            },
            {
                emoji: "⏰",
                title: "Zaplanowane wiadomości",
                usage: "!zaplanowana RRRR-MM-DDTHH:mm Treść",
                desc: "Bot wyśle wiadomość o wskazanej dacie i godzinie."
            }
        ]
    },
    {
        group: "💬 Komunikacja",
        items: [
            {
                emoji: "💬",
                title: "Prywatny czat",
                usage: "!privchat",
                desc: "Tworzy dla Ciebie prywatny kanał tekstowy (usuwa się po 5 minutach bez aktywności)."
            },
            {
                emoji: "🎤",
                title: "Kanał tymczasowy",
                usage: "!tymczasowy [nazwa]",
                desc: "Tworzy tymczasowy kanał głosowy (usuwa się automatycznie, gdy pusty)."
            },
            {
                emoji: "🗓️",
                title: "Eventy",
                usage: "!event oglos Treść\n!events",
                desc: "Ogłaszanie i lista nadchodzących wydarzeń społeczności."
            },
            {
                emoji: "🔄",
                title: "Zmiana języka bota",
                usage: "!setlang pl / !setlang en",
                desc: "Ustaw język bota na polski lub angielski."
            }
        ]
    },
    {
        group: "🎧 Rozrywka",
        items: [
            {
                emoji: "🔊",
                title: "Muzyka",
                usage: "!play [link do YouTube]",
                desc: "Odtwarza muzykę z YouTube na Twoim kanale głosowym."
            },
            {
                emoji: "📊",
                title: "Głosowanie",
                usage: "!vote TreśćPytania",
                desc: "Rozpocznij głosowanie z przyciskami TAK/NIE."
            },
            {
                emoji: "🎫",
                title: "Tickets",
                usage: "!ticket-panel",
                desc: "Panel do zakładania ticketów przez użytkowników (przycisk)."
            }
        ]
    }
];

const groupOptions = helpSections.map((section, idx) => ({
    label: section.group,
    value: "group_" + idx,
    emoji: section.group.match(/^\p{Emoji}/u) ? section.group.match(/^\p{Emoji}/u)[0] : undefined,
    description: section.items.map(i => i.title).join(", ").slice(0, 90)
}));

client.on('messageCreate', async message => {
    if (message.content.toLowerCase() === "!setup") {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('help_menu')
            .setPlaceholder('Wybierz kategorię funkcji...')
            .addOptions(groupOptions);

        const row = ().addComponents(selectMenu);

        const embed = new EmbedBuilder()
            .setTitle("📜 Przewodnik po funkcjach bota")
            .setDescription(
                "Wybierz kategorię, aby zobaczyć dostępne funkcje!\n\n" +
                helpSections.map((s, i) => `${s.group} — \`${s.items.length}\``).join("\n")
            )
            .setColor("#00b9ff");
        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isStringSelectMenu() || interaction.customId !== 'help_menu') return;
    const idx = parseInt(interaction.values[0].replace("group_", ""));
    const section = helpSections[idx];
    const embed = new EmbedBuilder()
        .setTitle(`${section.group} — Funkcje`)
        .setColor("#00b9ff")
        .setDescription(
            section.items.map(i =>
                `${i.emoji} **${i.title}**\n` +
                `\`Użycie:\` ${i.usage}\n` +
                `${i.desc}\n`
            ).join("\n")
        );
    await interaction.update({ embeds: [embed] });
});

client.login(TOKEN);
