const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox']
    }
});

// --- KONFIGURASI ---
let isBusyMode = false; 
const respondedUsers = new Set(); 

// --- DAFTAR ORANG PENTING (WHITELIST) ---
// Masukkan nomor di sini (format string).
// Gunakan kode negara (62), bukan 08. Jangan pakai spasi atau tanda +.
// Contoh: '628123456789'
const specialContacts = [
    '6282251409098', // Ganti dengan nomor Pacar
];

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Silakan scan QR code di atas menggunakan WhatsApp di HP Anda.');
});

client.on('ready', () => {
    console.log('Bot Siap!');
    console.log('Mode Sibuk: ' + (isBusyMode ? 'ON' : 'OFF'));
    console.log(`Bot dikonfigurasi untuk membalas ke ${specialContacts.length} nomor spesifik saja.`);
});

client.on('message_create', async (message) => {
    
    // 1. Cek Perintah dari Pemilik (Anda sendiri)
    if (message.fromMe) {
        const text = message.body.toLowerCase();
        
        if (text === '!sibuk') {
            isBusyMode = true;
            console.log('STATUS: Mode Sibuk AKTIF.');
        } 
        else if (text === '!ada') {
            isBusyMode = false;
            respondedUsers.clear(); 
            console.log('STATUS: Mode Sibuk MATI.');
        }
        return; 
    }

    // 2. Logika Bot Membalas
    // FIX: Tambahkan try-catch agar bot tidak crash saat kena pesan Channel/Newsletter
    try {
        if (message.from.includes('@newsletter')) return; // Abaikan pesan dari Channel WA
        
        const chat = await message.getChat();
        
        if (isBusyMode && !chat.isGroup && !message.isStatus) {
            
            // Ambil nomor pengirim saja (buang @c.us di belakangnya)
            const senderNumber = message.from.replace('@c.us', '');

            // CEK APAKAH NOMOR INI ADA DI DAFTAR SPESIAL?
            const isSpecial = specialContacts.includes(senderNumber);

            if (isSpecial) {
                console.log(`Pesan dari pacar/orang spesial (${message.from}): ${message.body}`);
                
                // --- MODIFIKASI: MODE CHAT OTOMATIS (JADE AI STYLE SEDERHANA) ---
                // Kita hapus pengecekan 'respondedUsers' agar bot bisa ngobrol terus-terusan.
                
                // Simulasi "Ngetik..." biar terlihat natural
                chat.sendStateTyping();

                // Delay sedikit biar gak terlalu cepat (seperti manusia) - 2 detik
                await new Promise(resolve => setTimeout(resolve, 2000));

                // LOGIKA JAWABAN (Bisa diganti dengan API OpenAI/ChatGPT jika punya key)
                const reply = getSmartReply(message.body);
                
                await client.sendMessage(message.from, reply);
                
            } else {
                // Jika orang bukan spesial chat, abaikan atau balas sekali saja
                // console.log(`Mengabaikan chat dari ${senderNumber} karena bukan nomor spesial.`);
            }
        }
    } catch (error) {
        // Jika error terjadi (misal dari status/channel aneh), abaikan saja agar bot tidak mati
        // console.error("Error processing message:", error.message);
    }
});

// --- FUNGSI OTAK BOT (VERSION: BASED ON REAL CHAT HISTORY) ---
function getSmartReply(text) {
    const msg = text.toLowerCase();

    // --- 1. RESPON UNTUK EMOJI NANGIS (😭) YANG SERING DIPAKAI ---
    // Dia sering pakai 😭 untuk hal lucu atau ngeluh manja
    if (msg.includes('😭')) {
        const cryReplies = [
            "Utututu jangan nangis dong sayang, nanti cantiknya luntur lho 😭❤️",
            "Ih kok nangis? Sini peluk dulu biar tenang 🤗",
            "Kenapa sayang kok nangis? Ada yang jahatin kamu? Bilang aku sini!",
            "Wkwkwk lucu banget sih kamu kalau lagi drama gini 😘"
        ];
        return cryReplies[Math.floor(Math.random() * cryReplies.length)];
    }

    // --- 2. RESPON MENEMANI (Nemenin, Telpon, Tidur) ---
    if (msg.includes('temenin') || msg.includes('nemenin')) {
        return "Iya sayangku, aku temenin terus kok di sini 24 jam. Jangan takut sendirian yaa ❤️";
    }
    
    if (msg.includes('telpon') || msg.includes('call') || msg.includes('vc')) {
        return "Nanti pas aku pegang HP langsung kita telponan ya sayang sampe pagi! 😍 Sekarang chatan sama bot dulu yaa.";
    }

    if (msg.includes('bosen') || msg.includes('bosan') || msg.includes('bete')) {
        return "Bosen ya? Sabar ya sayang, nanti kita jalan-jalan atau ngapain gitu biar gak bosen. Sekarang cerita aja dulu sama aku.";
    }

    // --- 3. AKTIVITAS HARIAN (Nyuci, Baju, Mandi, Makan) ---
    if (msg.includes('nyuci') || msg.includes('baju')) {
        return "Rajin banget sih calon istriku nyuci terus. Semangat ya sayang! Jangan capek-capek nanti sakit 🥺";
    }

    if (msg.includes('makan') || msg.includes('mkn') || msg.includes('maem') || msg.includes('laper')) {
        return "Udah makan belum sayang? Jangan telat makan, nanti sakit. Aku sedih lho kalau kamu sakit 🥺";
    }

    if (msg.includes('mandi') || msg.includes('mndi')) {
        return "Mandi yang bersih ya sayang, tapi jangan lama-lama nanti masuk angin. Wangi-wangi buat aku ya! 😋";
    }

    // --- 4. ROMANTIS & PERASAAN (Sayang, Love you, Kangen) ---
    if (msg.includes('love') || msg.includes('lav') || msg.includes('luv')) {
        return "Love you more than anything sayangkuuu! ❤️❤️❤️❤️❤️";
    }

    if (msg.includes('sayang') || msg.includes('yangg') || msg.includes('yang')) {
        const loveReplies = [
            "Iya sayangku cintaku duniaku? ❤️",
            "Dalem sayang? Kangen aku yaa? 😋",
            "Kenapa sayang? Aku di sini kok nemenin kamu."
        ];
        return loveReplies[Math.floor(Math.random() * loveReplies.length)];
    }

    if (msg.includes('kangen') || msg.includes('rindu') || msg.includes('miss')) {
        return "Aku juga kangen bangeeet! Tunggu bentar lagi ya sayang, nanti aku bales beneran 😘";
    }

    // --- 5. RESPON KETAWA/LUCCU (Jokes bapak-bapak, receh) ---
    if (msg.includes('lucu') || msg.includes('joks') || msg.includes('wakaka') || msg.includes('wkwk')) {
        return "Hehe iya dong, pacar siapa dulu. Seneng deh liat kamu ketawa gitu 😘";
    }

    // --- 6. RESPON KE BINGUNG/TANYA (Kok bisa, Kenapa) ---
    if (msg.includes('kok bisa') || msg.includes('kenapa') || msg.includes('knp')) {
        return "Ya bisa dong sayang, namanya juga cinta. Apapun bisa terjadi kalau buat kamu. ❤️";
    }

    // --- 7. RESPON TIDUR (Ngantuk, Bobo) ---
    if (msg.includes('tidur') || msg.includes('ngantuk') || msg.includes('bangun')) {
        return "Bobo gih sayang kalau udah ngantuk. Mimpi indah ya, nanti aku bangunin (dalam mimpi). Good night love! 🌙";
    }

    // --- 8. MODE "SERIUS" (Serius, Jujur) ---
    if (msg.includes('serius') || msg.includes('jujur') || msg.includes('beneran')) {
        return "Iya sayang serius, aku gak bercanda kok. Dua rius malah! ✌️";
    }

    // --- DEFAULT REPLY (Kombinasi agar nyambung dengan chat log) ---
    const randomReplies = [
        "Iya sayang, aku ngerti kok perasaan kamu.",
        "Gak papa sayang, santai aja sama aku mah.",
        "Duh gemes banget sih pacarku ini.",
        "Sabar ya sayang, orang sabar disayang aku. Hehe.",
        "Cerita aja terus, aku dengerin kok (baca) semuanya.",
        "Semangat ya sayang hari ini! Jangan lupa senyum.",
        "Aku beruntung banget punya kamu yang pengertian gini ❤️",
        "Iya sayanggg temenin aku terus yaa."
    ];

    return randomReplies[Math.floor(Math.random() * randomReplies.length)];
}
        "Kamu tau gak bedanya kamu sama jam? Jam muterin waktu, kalau kamu muterin kepalaku. eaaa",
        "Pap dong, kangen liat muka kamu.",
        "Cita-citaku sederhana, cuma pengen bahagiain kamu. (Ini serius lho, bukan gombalan bot)",
        "Duh, chat kamu tuh notifikasi favorit aku tau gak.",
        "Semangat ya hari ini! Inget ada aku yang selalu support kamu.",
        "Coba itung bintang di langit, sebanyak itu rasa sayang aku ke kamu.",
        "Jangan lupa minum air putih ya, biar tetep fokus mencintai aku wkwk.",
        "Eh, senyum dong. Nah gitu, cantik banget.",
        "Aku aslinya lagi sibuk banget, tapi demi kamu apa sih yang nggak?",
        "Sayang? Masih disitu kan? Jangan kemana-mana ya.",
        "Definisi sempurna itu pas aku liat nama kamu muncul di layar HP."
    ];

    return randomReplies[Math.floor(Math.random() * randomReplies.length)];
}

client.initialize();
