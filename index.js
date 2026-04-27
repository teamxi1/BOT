const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys")
const pino = require('pino')
const fs = require('fs')

async function startGaelXit() {
    const settings = JSON.parse(fs.readFileSync('./settings/settings.json'))
    const { state, saveCreds } = await useMultiFileAuthState('./database/session')
    
    const conn = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: ["Gael Xit", "Chrome", "1.0.0"]
    })

    // VINCULACIÓN POR CÓDIGO AUTOMÁTICA
    if (!conn.authState.creds.registered) {
        let num = settings.ownerNumber.replace(/[^0-9]/g, '')
        setTimeout(async () => {
            let code = await conn.requestPairingCode(num)
            console.log(`\n✅ TU CÓDIGO GAEL XIT: ${code}\n`)
        }, 3000)
    }

    conn.ev.on('creds.update', saveCreds)

    conn.ev.on('messages.upsert', async chat => {
        const m = chat.messages[0]
        if (!m.message || m.key.fromMe) return
        const body = m.message.conversation || m.message.extendedTextMessage?.text || ''
        const from = m.key.remoteJid
        const isGroup = from.endsWith('@g.us')
        const prefix = settings.prefix

        // COMANDO MENU (EL QUE PASASTE)
        if (body.startsWith(prefix + 'menu')) {
            const menuFinal = `
​╭───────────────╼
│  🐍 GAEL XIT - MODO TÓXICO
├───────────────╼
│ 🕵️ ${prefix}fakechat [texto]
│ 🤥 ${prefix}detectar [@user]
│ 💔 ${prefix}funar [@user]
│ 👁️ ${prefix}stalk [@user]
│ 💣 ${prefix}spam [texto]
╰───────────────╼
​╭───────────────╼
│  💀 ZONA PROHIBIDA / TURBIO
├───────────────╼
│ 🧟 ${prefix}dark
│ 💉 ${prefix}hospital
│ 🩸 ${prefix}snuff
│ 💊 ${prefix}drogas
│ 🦴 ${prefix}anatomia
╰───────────────╼
​╭───────────────╼
│  🔞 ZONA VIP EXTREMA (+18)
├───────────────╼
│ 👙 ${prefix}swimsuit
│ 🍑 ${prefix}panties
│ 💋 ${prefix}thighs
│ 🔞 ${prefix}xnxx [busqueda]
│ 💦 ${prefix}squirt
╰───────────────╼
​╭───────────────╼
│  🛡️ GESTIÓN DE GRUPO (ADMINS)
├───────────────╼
│ 🚫 ${prefix}kick @user (Sacar)
│ 📩 ${prefix}add [número] (Meter)
│ 👑 ${prefix}promote @user (Dar Admin)
│ ⚡ ${prefix}demote @user (Quitar Admin)
╰───────────────╼

🔥 *BY: GAEL XIT*`.trim()

            await conn.sendMessage(from, { 
                image: { url: settings.img }, 
                caption: menuFinal,
                contextInfo: { externalAdReply: { title: "GAEL XIT - MODO DIABLO", body: "Admin System Active", thumbnailUrl: settings.img, mediaType: 1, renderLargerThumbnail: true }}
            }, { quoted: m })
        }

        // --- LÓGICA DE ADMINISTRACIÓN ---
        if (body.startsWith(prefix + 'kick') && isGroup) {
            let user = m.message.extendedTextMessage?.contextInfo?.mentionedJid[0]
            if (user) await conn.groupParticipantsUpdate(from, [user], "remove")
        }

        if (body.startsWith(prefix + 'add') && isGroup) {
            let num = body.split(' ')[1] + "@s.whatsapp.net"
            await conn.groupParticipantsUpdate(from, [num], "add")
        }

        if (body.startsWith(prefix + 'promote') && isGroup) {
            let user = m.message.extendedTextMessage?.contextInfo?.mentionedJid[0]
            if (user) await conn.groupParticipantsUpdate(from, [user], "promote")
        }

        if (body.startsWith(prefix + 'demote') && isGroup) {
            let user = m.message.extendedTextMessage?.contextInfo?.mentionedJid[0]
            if (user) await conn.groupParticipantsUpdate(from, [user], "demote")
        }
    })
}
startGaelXit()
