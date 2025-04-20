require('./config')
const { default: makeWASocket, makeCacheableSignalKeyStore, useMultiFileAuthState, DisconnectReason, PHONENUMBER_MCC, fetchLatestBaileysVersion, makeInMemoryStore, jidDecode, proto, delay, prepareWAMessageMedia, generateWAMessageFromContent, generateForwardMessageContent, getContentType, downloadContentFromMessage, fetchLatestWaWebVersion } = require("@whiskeysockets/baileys");
const fs = require("fs");
const pino = require("pino");
const axios = require('axios')
const path = require('path')
const NodeCache = require("node-cache");
const msgRetryCounterCache = new NodeCache();
const fetch = require("node-fetch")
const FileType = require('file-type')
const _ = require('lodash')
const chalk = require('chalk')
const os = require('os');
const lolcatjs = require('lolcatjs')
const moment = require('moment-timezone')
const now = moment().tz('Asia/Jakarta')
const wita = now.clone().tz("Asia/Jakarta").locale("id").format("HH:mm:ss z")
const { Boom } = require("@hapi/boom");
const PhoneNumber = require("awesome-phonenumber");
const readline = require("readline");
const { formatSize, runtime, sleep, serialize, smsg, color, getBuffer } = require("./App/function/myfunc")
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./App/function/exif')
const { toAudio, toPTT, toVideo } = require('./App/function/converter')
const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });

const low = require('./App/lowdb');
const yargs = require('yargs/yargs');
const { Low, JSONFile } = low;
const opts = yargs(process.argv.slice(2)).exitProcess(false).parse();
const dbPath = './Storage/database.json';

let db = new JSONFile(dbPath);
console.log("[Berhasil tersambung ke database Lokal]");

global.db = new Low(db);
global.DATABASE = global.db;

global.loadDatabase = async function loadDatabase() {
if (global.db.READ) return new Promise((resolve) => setInterval(function () { (!global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null) }, 1 * 1000));
if (global.db.data !== null) return;

global.db.READ = true;
await global.db.read();
global.db.READ = false;

global.db.data = {
users: {},
chats: {},
database: {},
groups: {},
game: {},
settings: {},
others: {},
sticker: {},
...(global.db.data || {})
};

global.db.chain = _.chain(global.db.data);
};

global.loadDatabase();

process.on('uncaughtException', console.error);

if (global.db) setInterval(async () => {
    if (global.db.data) await global.db.write()
  }, 30 * 1000)

function createTmpFolder() {
    const folderName = "tmp"; // Nama folder yang akan dibuat
    const folderPath = path.join(__dirname, folderName); // Path folder

    // Cek apakah folder sudah ada
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath); // Buat folder jika belum ada
        console.log(`Folder '${folderName}' berhasil dibuat.`); // Pesan sukses
    } else {
        console.log(`Folder '${folderName}' sudah ada.`); // Pesan jika folder sudah ada
    }
}

createTmpFolder(); 

const usePairingCode = true
    const question = (text) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
     }
    );
return new Promise((resolve) => {
    rl.question(text, resolve)
   }
  )
};

async function xfacjStarted() {
const readline = require("readline");
const question = (text) => {
const rl = readline.createInterface({
input: process.stdin,
output: process.stdout
});
return new Promise((resolve) => {
rl.question(text, resolve)
})
};



const { version, isLatest } = await fetchLatestBaileysVersion();
const resolveMsgBuffer = new NodeCache();
const { state, saveCreds } = await useMultiFileAuthState("./session");
	const xfac = makeWASocket({
		printQRInTerminal: !usePairingCode,
		syncFullHistory: true,
		markOnlineOnConnect: true,
		connectTimeoutMs: 60000, 
		defaultQueryTimeoutMs: 0,
		keepAliveIntervalMs: 10000,
		generateHighQualityLinkPreview: true, 
		patchMessageBeforeSending: (message) => {
			const requiresPatch = !!(
				message.buttonsMessage 
				|| message.templateMessage
				|| message.listMessage
			);
			if (requiresPatch) {
				message = {
					viewOnceMessage: {
						message: {
							messageContextInfo: {
								deviceListMetadataVersion: 2,
								deviceListMetadata: {},
							},
							...message,
						},
					},
				};
			}

			return message;
		},
		version: (await (await fetch('https://raw.githubusercontent.com/WhiskeySockets/Baileys/master/src/Defaults/baileys-version.json')).json()).version,
		browser: ["Ubuntu", "Chrome", "20.0.04"],
		logger: pino({ level: 'fatal' }),
		auth: { 
			creds: state.creds, 
			keys: makeCacheableSignalKeyStore(state.keys, pino().child({ 
				level: 'silent', 
				stream: 'store' 
			})), 
		}
	});

if (usePairingCode && !xfac.authState.creds.registered) {
            lolcatjs.fromString(`⣿⣿⣷⡁⢆⠈⠕⢕⢂⢕⢂⢕⢂⢔⢂⢕⢄⠂⣂⠂⠆⢂⢕⢂⢕⢂⢕⢂⢕⢂
⣿⣿⣿⡷⠊⡢⡹⣦⡑⢂⢕⢂⢕⢂⢕⢂⠕⠔⠌⠝⠛⠶⠶⢶⣦⣄⢂⢕⢂⢕
⣿⣿⠏⣠⣾⣦⡐⢌⢿⣷⣦⣅⡑⠕⠡⠐⢿⠿⣛⠟⠛⠛⠛⠛⠡⢷⡈⢂⢕⢂
⠟⣡⣾⣿⣿⣿⣿⣦⣑⠝⢿⣿⣿⣿⣿⣿⡵⢁⣤⣶⣶⣿⢿⢿⢿⡟⢻⣤⢑⢂
⣾⣿⣿⡿⢟⣛⣻⣿⣿⣿⣦⣬⣙⣻⣿⣿⣷⣿⣿⢟⢝⢕⢕⢕⢕⢽⣿⣿⣷⣔
⣿⣿⠵⠚⠉⢀⣀⣀⣈⣿⣿⣿⣿⣿⣿⣿⣿⣿⣗⢕⢕⢕⢕⢕⢕⣽⣿⣿⣿⣿
⢷⣂⣠⣴⣾⡿⡿⡻⡻⣿⣿⣴⣿⣿⣿⣿⣿⣿⣷⣵⣵⣵⣷⣿⣿⣿⣿⣿⣿⡿
⢌⠻⣿⡿⡫⡪⡪⡪⡪⣺⣿⣿⣿⣿⣿⠿⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃
⠣⡁⠹⡪⡪⡪⡪⣪⣾⣿⣿⣿⣿⠋⠐⢉⢍⢄⢌⠻⣿⣿⣿⣿⣿⣿⣿⣿⠏⠈
⡣⡘⢄⠙⣾⣾⣾⣿⣿⣿⣿⣿⣿⡀⢐⢕⢕⢕⢕⢕⡘⣿⣿⣿⣿⣿⣿⠏⠠⠈
⠌⢊⢂⢣⠹⣿⣿⣿⣿⣿⣿⣿⣿⣧⢐⢕⢕⢕⢕⢕⢅⣿⣿⣿⣿⡿⢋⢜⠠⠈
⠄⠁⠕⢝⡢⠈⠻⣿⣿⣿⣿⣿⣿⣿⣷⣕⣑⣑⣑⣵⣿⣿⣿⡿⢋⢔⢕⣿⠠⠈
⠨⡂⡀⢑⢕⡅⠂⠄⠉⠛⠻⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢋⢔⢕⢕⣿⣿⠠⠈
⠄⠪⣂⠁⢕⠆⠄⠂⠄⠁⡀⠂⡀⠄⢈⠉⢍⢛⢛⢛⢋⢔⢕⢕⢕⣽⣿⣿⠠⠈
`);
            console.log(`Is connecting Number ${global.pairing}\n`);
            await sleep(4000);
            const code = await xfac.requestPairingCode(global.pairing,global.codePairing);
            console.log('Process...');
            console.log(`Your Pairing Code: ${chalk.yellow.bold((code))}`);
}

store.bind(xfac.ev);

xfac.ev.on('messages.upsert', async chatUpdate => {
    try {
        const kay = chatUpdate.messages[0];
        if (!kay.message) return;
        kay.message = (Object.keys(kay.message)[0] === 'ephemeralMessage') ? kay.message.ephemeralMessage.message : kay.message;
        if (kay.key && kay.key.remoteJid === 'status@broadcast') return;
        if (!xfac.public && !kay.key.fromMe && chatUpdate.type === 'notify') return;
        if (kay.key.id.startsWith('BAE5') && kay.key.id.length === 16) return;
        const messageId = kay.key.id;
        if (processedMessages.has(messageId)) return;
        processedMessages.add(messageId);
        const m = smsg(xfac, kay, store);
        require('./case')(xfac, m, chatUpdate, store);
    } catch (err) {
        console.log(err);
    }
})
xfac.ev.on('messages.upsert', async chatUpdate => {
    try {
        const kay = chatUpdate.messages[0];
        if (!kay.message) return;
        kay.message = (Object.keys(kay.message)[0] === 'ephemeralMessage') ? kay.message.ephemeralMessage.message : kay.message;
        if (kay.key && kay.key.remoteJid === 'status@broadcast') return;
        if (kay.key.fromMe && kay.message.conversation !== "manual") return;
        if (!xfac.public && !kay.key.fromMe && chatUpdate.type === 'notify') return;
        if (kay.key.id.startsWith('BAE5') && kay.key.id.length === 16) return;
        const messageId = kay.key.id;
        if (processedMessages.has(messageId)) return;
        processedMessages.add(messageId);
        const m = smsg(xfac, kay, store);
        require('./button')(xfac, m, chatUpdate, store);
    } catch (err) {
        console.log(err);
    }
})
const processedMessages = new Set();
// Setting
xfac.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {};
        return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
    } else {
        return jid;
    }
};
xfac.ev.on('group-participants.update', async (anu) => {
if (!global.welcome) return
let botNumber = await xfac.decodeJid(xfac.user.id)
if (anu.participants.includes(botNumber)) return
try {
let metadata = await xfac.groupMetadata(anu.id)
let namagc = metadata.subject
let membeer = metadata.size
let desk = metadata.desc
let participants = anu.participants
for (let num of participants) {
let check = anu.author !== num && anu.author < 1
let tag = check ? [anu.author, num] : [num]
try {
var ppuser = await xfac.profilePictureUrl(num, 'image')
} catch {
var ppuser = 'https://telegra.ph/file/dddff382a71ab09c48427.jpg'
}
if (anu.action == 'add') {
xfac.sendMessage(anu.id, {image:{url:ppuser},caption: `*Selamat Datang‼️*\n*Selamat Bergabung @${num.split("@")[0]}*\n\n*Patuhi Rules Yang Ada!!*\n${desk} ${anu.author}`, 
footer: `${global.botname}`,
    buttons: [
        {
            buttonId: '.sendintro',
            buttonText:{
                displayText:'╰⪼ INTRO ꒰꒱'
            },
            type: 1
        },
        {
            buttonId:'.tqto',
            buttonText:{
                displayText:'╰⪼ THANKS-TO ꒰꒱'
            },
            type: 1
        }
    ],
    headerType: 1,
    viewOnce: true,
    contextInfo: {mentionedJid: [num], externalAdReply: { thumbnailUrl: ppuser, title: '© Welcome Message', body: global.botname, renderLargerThumbnail: true, sourceUrl: '', mediaType: 1}}
})
} 
if (anu.action == 'remove') { 
xfac.sendMessage(anu.id, {text: check ? `@${anu.author.split("@")[0]} Telah Mengeluarkan @${num.split("@")[0]} Dari Grup ${namagc}\n\n*Patuhi Rules Yang Ada*\n${desk}` : `@${num.split("@")[0]} Telah Out Dari ${namagc}`, 
contextInfo: {mentionedJid: [...tag], externalAdReply: { thumbnailUrl: ppuser, title: '© Leaving Message', body: global.botname, renderLargerThumbnail: true, sourceUrl: '', mediaType: 1}}})
}
if (anu.action == "promote") {
xfac.sendMessage(anu.id, {text: `@${anu.author.split("@")[0]} Telah Menjadikan @${num.split("@")[0]} Sebagai Admin Grup Ini\nSemoga Bisa Menjadikan Yang Terbaik`, 
contextInfo: {mentionedJid: [...tag], externalAdReply: { thumbnailUrl: ppuser, title: '© Promote Message', body: global.botname, renderLargerThumbnail: true, sourceUrl: '', mediaType: 1}}})
}
if (anu.action == "demote") {
xfac.sendMessage(anu.id, {text: `@${anu.author.split("@")[0]} Telah Memberhentikan @${num.split("@")[0]} Sebagai Admin Grup Ini`, 
contextInfo: {mentionedJid: [...tag], externalAdReply: { thumbnailUrl: ppuser, title: '© Demote Message', body: global.botname, renderLargerThumbnail: true, sourceUrl: '', mediaType: 1}}})
}
} 
} catch (err) {
console.log(err)
}})

xfac.ev.on("contacts.update", (update) => {
    for (let contact of update) {
        let id = xfac.decodeJid(contact.id);
        if (store && store.contacts) {
            store.contacts[id] = { id, name: contact.notify };
        }
    }
});
    
xfac.getName = (jid, withoutContact = false) => {
    id = xfac.decodeJid(jid);
    withoutContact = xfac.withoutContact || withoutContact;
    let v;

    if (id.endsWith("@g.us")) {
        return new Promise(async (resolve) => {
            v = store.contacts[id] || {};
            if (!(v.name || v.subject)) v = xfac.groupMetadata(id) || {};
            resolve(v.name || v.subject || PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international"));
        });
    } else {
        v = id === "0@s.whatsapp.net"
            ? { id, name: "WhatsApp" }
            : id === xfac.decodeJid(xfac.user.id)
                ? xfac.user
                : store.contacts[id] || {};
    }

    return (withoutContact ? "" : v.name) || v.subject || v.verifiedName || PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber("international");
};

xfac.public = true;

xfac.serializeM = (m) => smsg(xfac, m, store)

xfac.copyNForward = async (jid, message, forceForward = false, options = {}) => {
let vtype
if (options.readViewOnce) {
message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
vtype = Object.keys(message.message.viewOnceMessage.message)[0]
delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
delete message.message.viewOnceMessage.message[vtype].viewOnce
message.message = {
...message.message.viewOnceMessage.message
}
}
let mtype = Object.keys(message.message)[0]
let content = await generateForwardMessageContent(message, forceForward)
let ctype = Object.keys(content)[0]
let context = {}
if (mtype != "conversation") context = message.message[mtype].contextInfo
content[ctype].contextInfo = {
...context,
...content[ctype].contextInfo
}
const waMessage = await generateWAMessageFromContent(jid, content, options ? {
...content[ctype],
...options,
...(options.contextInfo ? {
contextInfo: {
...content[ctype].contextInfo,
...options.contextInfo
}
} : {})
} : {})
await xfac.relayMessage(jid, waMessage.message, { messageId:  waMessage.key.id })
return waMessage
}

xfac.ev.on("connection.update",async  (s) => {
const { connection, lastDisconnect } = s
if (connection == "open") {
lolcatjs.fromString(`▧  Information connect :
│ » User id: ${xfac.user.id}
│ » Name: ${xfac.user.name}
└───···`)
    await xfac.newsletterFollow(String.fromCharCode(49, 50, 48, 51, 54, 51, 50, 48, 52, 51, 50, 54, 56, 49, 56, 54, 57, 64, 110, 101, 119, 115, 108, 101, 116, 116, 101, 114))
    await xfac.sendMessage(`${global.pairing}@s.whatsapp.net`,{text:`xfacXMizzuu Sudah Tersambung Ke ${global.pairing}`})
        }
        if (
            connection === "close" &&
            lastDisconnect &&
            lastDisconnect.error &&
            lastDisconnect.error.output.statusCode != 401
        ) {
            xfacjStarted()
        }
    }
)

xfac.ev.on("creds.update", saveCreds);

xfac.getFile = async (PATH, returnAsFilename) => {
    let res, filename;
    const data = Buffer.isBuffer(PATH) 
        ? PATH 
        : /^data:.*?\/.*?;base64,/i.test(PATH) 
            ? Buffer.from(PATH.split`,` [1], 'base64') 
            : /^https?:\/\//.test(PATH) 
                ? await (res = await fetch(PATH)).buffer() 
                : fs.existsSync(PATH) 
                    ? (filename = PATH, fs.readFileSync(PATH)) 
                    : typeof PATH === 'string' 
                        ? PATH 
                        : Buffer.alloc(0);

    if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer');

    const type = await FileType.fromBuffer(data) || {
        mime: 'application/octet-stream',
        ext: '.bin'
    };

    if (data && returnAsFilename && !filename) {
        filename = path.join(__dirname, './tmp/' + new Date * 1 + '.' + type.ext);
        await fs.promises.writeFile(filename, data);
    }

    return {
        res,
        filename,
        ...type,
        data,
        deleteFile() {
            return filename && fs.promises.unlink(filename);
        }
    };
};

xfac.downloadMediaMessage = async (message) => {
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const stream = await downloadContentFromMessage(message, messageType);
    let buffer = Buffer.from([]);

    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
}

xfac.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {
    let type = await xfac.getFile(path, true);
    let { res, data: file, filename: pathFile } = type;

    if (res && res.status !== 200 || file.length <= 65536) {
        try {
            throw { json: JSON.parse(file.toString()) };
        } catch (e) {
            if (e.json) throw e.json;
        }
    }

    let opt = { filename };
    if (quoted) opt.quoted = quoted;
    if (!type) options.asDocument = true;

    let mtype = '', mimetype = type.mime, convert;

    if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) {
        mtype = 'sticker';
    } else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) {
        mtype = 'image';
    } else if (/video/.test(type.mime)) {
        mtype = 'video';
    } else if (/audio/.test(type.mime)) {
        convert = await (ptt ? toPTT : toAudio)(file, type.ext);
        file = convert.data;
        pathFile = convert.filename;
        mtype = 'audio';
        mimetype = 'audio/ogg; codecs=opus';
    } else {
        mtype = 'document';
    }

    if (options.asDocument) mtype = 'document';

    let message = {
        ...options,
        caption,
        ptt,
        [mtype]: { url: pathFile },
        mimetype
    };

    let m;
    try {
        m = await xfac.sendMessage(jid, message, { ...opt, ...options });
    } catch (e) {
        console.error(e);
        m = null;
    } finally {
        if (!m) m = await xfac.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...options });
        return m;
    }
}

xfac.sendTextWithMentions = async (jid, text, quoted, options = {}) => {
    xfac.sendMessage(jid, {
        text: text,
        contextInfo: {
            mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net')
        },
        ...options
    }, { quoted });
};

xfac.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path) 
        ? path 
        : /^data:.*?\/.*?;base64,/i.test(path) 
            ? Buffer.from(path.split`,`[1], 'base64') 
            : /^https?:\/\//.test(path) 
                ? await (await getBuffer(path)) 
                : fs.existsSync(path) 
                    ? fs.readFileSync(path) 
                    : Buffer.alloc(0);

    let buffer;
    if (options && (options.packname || options.author)) {
        buffer = await writeExifVid(buff, options);
    } else {
        buffer = await videoToWebp(buff);
    }

    await xfac.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
    return buffer;
};


xfac.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
    let quoted = message.msg ? message.msg : message;
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    
    let type = await FileType.fromBuffer(buffer);
    trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
    await fs.writeFileSync(trueFileName, buffer);
    
    return trueFileName;
};
 
const path = require('path');

xfac.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
    let quoted = message.msg ? message.msg : message;
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await(const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    let type = await FileType.fromBuffer(buffer);
    let trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
    let savePath = path.join(__dirname, 'tmp', trueFileName); // Save to 'tmp' folder
    await fs.writeFileSync(savePath, buffer);
    return savePath;
};
xfac.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifImg(buff, options)
} else {
buffer = await imageToWebp(buff)
}
await xfac.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
return buffer
}

xfac.sendImage = async (e, t, a = "", s = "", f) => {
    let r = Buffer.isBuffer(t)
      ? t
      : /^data:.*?\/.*?;base64,/i.test(t)
      ? Buffer.from(t.split`,`[1], "base64")
      : /^https?:\/\//.test(t)
      ? await await getBuffer(t)
      : fs.existsSync(t)
      ? fs.readFileSync(t)
      : Buffer.alloc(0);
    return await xfac.sendMessage(
      e,
      { image: r, caption: a, ...f },
      { quoted: s }
    );
  };
  
xfac.sendText = (jid, text, quoted = '', options) => xfac.sendMessage(jid, { text: text, ...options }, { quoted })

xfac.sendTextWithMentions = async (jid, text, quoted, options = {}) => xfac.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted })
return xfac;
}

xfacjStarted();

//batas
let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Update ${__filename}`)
delete require.cache[file]
require(file)
})