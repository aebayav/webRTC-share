const { ipcRenderer } = require('electron');
const io = require('socket.io-client');
const Peer = require('simple-peer');
const config = require('./config.json');

window.global = window;

const socket = io(config.apiUrl, {
    extraHeaders: {
        "ngrok-skip-browser-warning": "69420"
    },
    transports: ['websocket', 'polling']
});

let currentStream = null;
let roomId = null;
let peers = {}; // Bağlı olan her izleyiciyi burada tutuyoruz

const startBtn = document.getElementById('start-btn');
const roomDisplay = document.getElementById('room-id-display');
const localVideo = document.getElementById('local-video');
const shareLink = document.getElementById('share-link');

// --- ANA BUTON MANTIĞI ---
startBtn.onclick = async () => {
    // Eğer yayın zaten varsa durdur
    if (currentStream) {
        stopStreaming();
        return;
    }

    // Yayın yoksa başlat
    try {
        const sources = await ipcRenderer.invoke('get-sources');
        currentStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: { mandatory: { chromeMediaSource: 'desktop', chromeMediaSourceId: sources[0].id } }
        });

        localVideo.srcObject = currentStream;
        
        // Odayı oluştur
        roomId = Math.random().toString(36).substring(2, 9);
        socket.emit('join-room', roomId);
        
        // Arayüzü güncelle
        updateUI(true);
        shareLink.innerText = roomId;

    } catch (err) { 
        console.error("Yayın başlatılamadı:", err); 
    }
};

// --- YAYINI DURDURMA FONKSİYONU ---
function stopStreaming() {
    console.log("Yayın sonlandırılıyor...");

    // 1. Tüm aktif Peer bağlantılarını yok et (İzleyicilerin ekranı kapanır)
    Object.keys(peers).forEach(userId => {
        if (peers[userId]) {
            peers[userId].destroy();
            delete peers[userId];
        }
    });

    // 2. Ekran yakalamayı fiziksel olarak durdur (İşlemci yükünü keser)
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }

    // 3. Sunucuya yayının bittiğini bildir
    socket.emit('stop-stream', roomId);

    // 4. UI ve Video elementini temizle
    localVideo.srcObject = null;
    updateUI(false);
}

// Arayüz Durumu (Aç/Kapat)
function updateUI(isStreaming) {
    if (isStreaming) {
        startBtn.innerText = "Yayını Bitir";
        startBtn.style.backgroundColor = "#ed4245"; // Kırmızı
        roomDisplay.style.display = 'block';
    } else {
        startBtn.innerText = "Ekran Paylaşımını Başlat";
        startBtn.style.backgroundColor = "#5865f2"; // Discord Mavisi
        roomDisplay.style.display = 'none';
    }
}

// --- İZLEYİCİ YÖNETİMİ ---
socket.on('user-joined', (userId) => {
    if (!currentStream) return; // Yayın yoksa bağlanma

    console.log(`${userId} bağlandı, el sıkışma başlıyor...`);

    const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: currentStream,
        config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
    });

    peer.on('signal', signal => {
        socket.emit('signal', { 
            roomId, 
            signal, 
            targetId: userId 
        });
    });

    peer.on('error', err => {
        console.error("Peer hatası:", err);
        delete peers[userId];
    });

    peers[userId] = peer;
});

socket.on('signal', data => {
    const peer = peers[data.senderId];
    if (peer) {
        peer.signal(data.signal);
    }
});