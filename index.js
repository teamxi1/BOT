const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys")
const pino = require('pino')
const fs = require('fs')

async function startGaelXit() {
    const settings = JSON.parse(fs.readFileSync('./settings.json'))
    const { state, saveCreds } = await useMultiFileAuthState('./session')
    
    const conn = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: ["Gael Xit", "Chrome", "1.0.0"]
    })

    // Vinculación por Código de 8 dígitos
    if (!conn.authState.creds.registered) {
        let num = settings.ownerNumber.replace(/[^0-9]/g, '')
        setTimeout(async () => {
            let code = await conn.requestPairingCode(num)
            console.log(`\n🔥 TU CÓDIGO GAEL XIT: ${code}\n`)
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

        // COMANDO MENU
        if (body.startsWith(prefix + 'menu')) {
            const menuFinal = `
​╭───────────────╼
│  🐍 GAEL XIT - MODO TÓXICO
├───────────────╼
│ 🕵️ .fakechat | 🤥 .detectar
│ 💔 .funar | 👁️ .stalk | 💣 .spam
╰───────────────╼
​╭───────────────╼
│  💀 ZONA PROHIBIDA / TURBIO
├───────────────╼
│ 🧟 .dark | 💉 .hospital | 🩸 .snuff
│ 💊 .drogas | 🦴 .anatomia
╰───────────────╼
​╭───────────────╼
│  🔞 ZONA VIP EXTREMA (+18)
├───────────────╼
│ 👙 .swimsuit | 🍑 .panties
│ 💋 .thighs | 💦 .squirt
│ 🔞 .xnxx [búsqueda]
╰───────────────╼
​╭───────────────╼
│  🛡️ GESTIÓN DE GRUPO
├───────────────╼
│ 🚫 .kick @user | 📩 .add [núm]
│ 👑 .promote | ⚡ .demote
╰───────────────╼
🔥 *BY: GAEL XIT*`

            await conn.sendMessage(from, { 
                image: { url: settings.img }, 
                caption: menuFinal,
                contextInfo: { externalAdReply: { title: "GAEL XIT - MODO DIABLO", body: "Admin System Active", thumbnailUrl: settings.img, mediaType: 1, renderLargerThumbnail: true }}
            }, { quoted: m })
        }

        // Comandos de Administración
        if (isGroup) {
            const groupMetadata = await conn.groupMetadata(from)
            const participants = groupMetadata.participants
            const mentioned = m.message.extendedTextMessage?.contextInfo?.mentionedJid[0]

            if (body.startsWith(prefix + 'kick')) {
                if (mentioned) await conn.groupParticipantsUpdate(from, [mentioned], "remove")
            }
            if (body.startsWith(prefix + 'promote')) {
                if (mentioned) await conn.groupParticipantsUpdate(from, [mentioned], "promote")
            }
            if (body.startsWith(prefix + 'demote')) {
                if (mentioned) await conn.groupParticipantsUpdate(from, [mentioned], "demote")
            }
        }
    })
}
startGaelXit()
