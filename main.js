const { default:makeWaSocket,fetchLatestBaileysVersion,useSingleFileAuthState,DisconnectReason,makeInMemoryStore,
        MessageType, MessageOptions, Mimetype, downloadMediaMessage} = require('@adiwajshing/baileys')
const {state, saveState} = useSingleFileAuthState("./session/sessions.json")
const { Boom } = require('@hapi/boom')
const pino = require("pino")
const fs = require("fs")
const { Sticker,StickerTypes } = require("wa-sticker-formatter")
const {isGroup, smsg} = require("./config/msgHand")
const {prefix} = require("./config/con")

// const {encode,decode} = require("uint8-to-base64")

const data = require("./helper/info");
const moment = require("moment")
const store = makeInMemoryStore({
    logger: pino().child({
        level: 'silent',
        stream: 'store'
    })
})


const startWaBot = async ()  => {
    const moment2 = moment().format("LTS")
    const sock = makeWaSocket({
        logger:pino({level:"silent"}),
        printQRInTerminal: true,
        browser: ["Uji COba bang", "Uner", "1.0.0"],
        auth: state
    })

    store.bind(sock.ev)

    sock.ev.on("creds.update",saveState)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ' + lastDisconnect.error + ', reconnecting ' + shouldReconnect)
            // reconnect if not logged out
            if(shouldReconnect) {
                startWaBot()
            }
        } else if(connection === 'open') {
            console.log('Koneksi Terbuka')
        } 
    })

       sock.ev.on('messages.upsert', async (m) => {
        if(!m.messages[0].key.fromMe && m.type == "notify"){
            // console.log(m.messages[0])
            console.log("\n\n")
            let p = m.messages[0]
            // console.log(p.message)
            // let c = await store.loadMessage(p.key.remoteJid, p.message.extendedTextMessage.contextInfo.stanzaId ,sock);
            // console.log(sock.ev.)
            console.log(isGroup(m))
            console.log(`${moment2} || ${m.messages[0].key.remoteJid.split("@")[0]} => ${m.messages[0].message.conversation || p.message.imageMessage.caption }`)
            if(p.message.imageMessage){
                if(p.message.imageMessage.caption == `${prefix}sticker`){
                    let down = await downloadMediaMessage(p,"buffer",{},{logger: pino({level: "silent"}),reuploadRequest: sock.updateMediaMessage})
                    const stiker = new Sticker(down,{
                        pack : 'Abogoboga',
                        author : "Ayonima",
                        type: StickerTypes.FULL,
                        categories : ['🤩', '🎉'],
                        id: 'AyouniMa',
                        quality: 99,
                        background: "#000"
                    })
        
                    await sock.sendMessage(m.messages[0].key.remoteJid, await stiker.toMessage());
                }
            }
            // await sock.sendMessage(m.messages[0].key.remoteJid, {text: "Halo!"}, {quoted : m.messages[0]});
            // let down = await downloadMediaMessage(p, 'stream',{}, {logger: pino({level:"silent"}),reuploadRequest : sock.updateMediaMessage})
            
        }
    })
}

startWaBot()
