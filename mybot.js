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

// --- FUNGSI OTAK BOT (VERSION: HUMAN-LIKE, WARM & LONG) ---
function getSmartReply(text) {
    const msg = text.toLowerCase();

    // --- PRIORITY 1: IDENTITAS & KERAGUAN (Penting dijawab benar biar gak bingung) ---
    // (Handling: Siapa ini, Ini siapa, Kamu siapa)
    if (msg.includes('siapa ini') || msg.includes('ini siapa') || msg.includes('kamu siapa') || msg.includes('sapa nih')) {
        return "Aku asisten pribari Ridho sayanggg. Orangnya lagi ada urusan sebentar, jadi aku ditugasin buat nemenin tuan putri biar gak kesepian. Jangan galak-galak yaa 🤗❤️";
    }

    // (Handling: Boong, Bohong, Masa sih, Bote)
    if (msg.includes('boong') || msg.includes('bohong') || msg.includes('masa') || msg.includes('bote') || msg.includes('ah masa') || msg.includes('serius')) {
        const doubtReplies = [
            "Beneran sayangku cintaku, suer tekewer-kewer! Masa aku bohong sama kamu sih? ✌️😘",
            "Ya ampun sayang, aku serius lho ini. Percaya dong sama aku (dan Ridho). ❤️",
            "Gak bohong cantikkk. Emang aku keliatan muka penipu ya? (eh aku kan gak punya muka wkwk). Serius sayang!",
            "Duh harus bersumpah apa nih biar kamu percaya? Serius sayang, aku di sini buat kamu lho."
        ];
        return doubtReplies[Math.floor(Math.random() * doubtReplies.length)];
    }

    // (Handling: Bot, Robot)
    if (msg.includes('bot') || msg.includes('robot')) {
        return "Iya sayang, aku emang bot. Tapi aku bot spesial yang diprogram pake cinta khusus buat jagain mood kamu pas Ridho lagi sibuk. canggih kan? 😎❤️";
    }

    // --- PRIORITY 2: PERTIMBANGAN POSISI & DESAKAN ---
    
    // (Handling: Kemana, Dimana, Mana orangnya, Ridho mana, Dho mana)
    if (msg.includes('mana') || msg.includes('kemana') || msg.includes('kmn') || msg.includes('dimana') || msg.includes('dmn')) {
        return "Orangnya lagi ada urusan sebentar sayanggg. Dia lagi berjuang biar cepet kelar. Nanti kalau udah beres pasti langsung lari prioritasin chat kamu kok. Sabar ya cantik 😉";
    }

    // (Handling: Lagi apa, Ngapain)
    if (msg.includes('lagi apa') || msg.includes('lg apa') || msg.includes('ngapain') || msg.includes('ngpn')) {
        return "Aku lagi mantengin layar nungguin chat dari kamu dong. Kalau Ridho aslinya lagi fokus urusan bentar. Kamu lagi apa sayang? Udah makan belum? ❤️";
    }

    // (Handling: Maunya sekarang, Cepetan, Gak mau nunggu)
    if (msg.includes('sekarang') || msg.includes('cepet') || msg.includes('gamau nunggu') || msg.includes('lama')) {
        return "Iya sayanggg aku tau kamu kangen/pengen sekarang, tapi sabar sebentar yaa? Sedikiiit lagi. Nanti pas Ridho balik pasti langsung ditebus kok waktunya. Jangan ngambek ya? 🥺";
    }

    // --- PRIORITY 3: HANDLING MOOD JELEK (SANGAT PENTING) ---
    // Menangkap: Badmood, Betmud, Males, Mls, Mager, Capek, Bete
    if (msg.includes('badmood') || msg.includes('betmud') || msg.includes('betmut') || msg.includes('bete') || msg.includes('mood') || msg.includes('bad') || msg.includes('ancur')) {
        return "Yahhh kok badmood sih cantikk? 🥺 Jangan bete dongg, nanti dunikaku ikut mendung lho. Cerita sini sama aku, siapa yang bikin kesel? Sini biar aku amuk! 😤❤️";
    }

    if (msg.includes('males') || msg.includes('mls') || msg.includes('mager')) {
        return "Lagi males ya sayang? Yaudah gak papa, istirahat aja dulu, rebahan yang nyaman. Jangan dipaksain kalau emang lagi gak mood yaa. Aku temenin rebahan online dari sini 🤗";
    }

    if (msg.includes('capek') || msg.includes('cpe') || msg.includes('lelah')) {
        return "Utututu kasiannya pacar aku capek... Sini puk-puk dulu 🤗. Kamu hebat banget lho udah berjuang hari ini. Sekarang istirahat ya, lepasin semua beban pikiran kamu sayang.";
    }

    if (msg.includes('sedih') || msg.includes('nangis') || msg.includes('😭')) {
        return "Hey sayang... jangan sedih dong, aku jadi ikutan sedih nih 🥺. Hapus air matanya ya cantik? Inget ada aku (dan Ridho) yang sayang banget sama kamu. Love you! ❤️";
    }

    if (msg.includes('marah') || msg.includes('ngambek') || msg.includes('kesel')) {
        return "Jangan marah-marah dong sayanggg, nanti cantiknya ilang lho digondol kucing. Maafin ya kalau nunggu lama? Sayang banget lho sama kamu. Senyum dikit dong? 😊";
    }

    // --- PRIORITY 4: AFILIASI & ROMANTIS ---
    
    // (Handling: Kangen, Rindu, Miss)
    if (msg.includes('kangen') || msg.includes('rindu') || msg.includes('miss')) {
        return "Aaa aku juga kangen bangettt!! Sumpah gak boong 😭. Tahan ya sayang, rindu itu berat (kata Dilan), tapi kita pasti kuat! Tunggu bentar lagi ya sayang, nanti kita lepas rindu sepuasnya! ❤️";
    }

    // (Handling: Sayang, Yang, Baby, Dho, Ridho)
    if (msg.includes('sayang') || msg.includes('yangg') || msg.includes('yang') || msg.includes('babe') || msg.includes('dho') || msg.includes('ridho')) {
        const loveReplies = [
            "Iya sayangku cintaku duniaku semestaku? ❤️ Ada yang bisa dibantu tuan putri?",
            "Dalem sayanggg? Aku selalu ada di sini kok buat kamu. Kenapa cantik? 😘",
            "Hadir cintaku! Jangan khawatir ya, aku jagain chat kamu terus kok ini."
        ];
        return loveReplies[Math.floor(Math.random() * loveReplies.length)];
    }
    
    // (Handling: Selingkuh)
    if (msg.includes('selingkuh') || msg.includes('cewek lain') || msg.includes('cewe lain')) {
        return "Ya Allah sayanggg, gak mungkin lah! Mata dan hati aku cuma buat kamu doang. Cewek lain mah lewat semua, gak ada yang selevel sama kamu! ❤️😤";
    }

    // (Handling: Minta Telpon/VC)
    if (msg.includes('telpon') || msg.includes('call') || msg.includes('vc') || msg.includes('video')) {
        return "Duh pengen banget sebenernya denger suara kamu sayang 🥺. Tapi sabar bentar ya, nanti pas aku udah pegang HP beneran langsung kita telponan sampe kuping panas! Janji! 🤙❤️";
    }

    // --- PRIORITY 5: AKTIVITAS HARIAN ---
    if (msg.includes('tidur') || msg.includes('ngantuk') || msg.includes('bobo')) 
        return "Bobo gih sayang kalau udah ngantuk. Simpen tenaganya yah. Mimpi indah tuan putri, nanti aku bangunin (dalam doa wkwk). Good night love! 🌙❤️";
        
    if (msg.includes('makan') || msg.includes('laper') || msg.includes('lpr')) 
        return "Makan gih sayanggg. Jangan telat makan, nanti sakit lho :( Kalau kamu sakit aku sedih banget. Pake nasi ya makannya jangan pake emosi hihi 😘";

    if (msg.includes('mandi')) 
        return "Mandi sana gih sayang biar seger dan wangi. Walaupun kamu belum mandi juga aku tetep sayang kok, tapi mandilah biar makin cantik! 😋🧼";
        
    if (msg.includes('temenin')) 
        return "Sini aku temenin chat sampe pagi pun aku kuaaat! (Kan aku bot gak butuh tidur wkwk). Mau cerita apa sayang? Aku dengerin ❤️";

    // --- FALLBACK TERAKHIR (Kalau bot beneran gak ngerti) --- 
    // Jawabannya harus panjang, nanya balik, dan romantis. JANGAN CUEK.
    const safeReplies = [
        "Terus gimana lagi sayang? Cerita lagi dong, aku seneng baca chat kamu walaupun aku cuma bot hehe. ❤️",
        "Utututu... sini cerita pelan-pelan sayang. Maaf ya otak bot aku agak lemot, tapi hati aku full buat kamu kok! 😘",
        "Bisa aja kamu sayang. Eh tapi beneran deh, chat sama kamu tuh bikin semangat (walau aku cuma program). Cerita lagi dong?",
        "Duh gemes banget sih pacarku ini kalau lagi ngomong gitu. Pengen nyubit pipi rasanya (andai aku punya tangan) 😆❤️",
        "Iya sayangku, apapun yang kamu bilang aku iyain deh biar kamu seneng. Emangnya kenapa lagi cantik? Cerita sini..",
        "Hmm... gitu ya sayang? Aku jadi pengen cepet-cepet kelar urusan biar bisa bales chat kamu pake tangan sendiri (bukan bot). Tunggu yaa ❤️"
    ];

    return safeReplies[Math.floor(Math.random() * safeReplies.length)];
}

client.initialize();
