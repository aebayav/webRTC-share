const http = require('http');

// 1. Basit bir HTTP sunucusu oluştur (CORS ve Sağlık kontrolü için)
const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, ngrok-skip-browser-warning');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Sunucu Calisiyor - Socket.io Aktif');
});

// 2. Socket.io'yu bu sunucuya bağla
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('Yeni baglanti:', socket.id);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-joined', socket.id);
        console.log(`Odaya girildi: ${roomId}`);
    });

    socket.on('signal', (data) => {
        if (data.targetId) {
            io.to(data.targetId).emit('signal', {
                signal: data.signal,
                senderId: socket.id
            });
        } else {
            socket.to(data.roomId).emit('signal', {
                signal: data.signal,
                senderId: socket.id
            });
        }
    });

    socket.on('disconnect', () => console.log('Ayrildi:', socket.id));
});

// 3. Sunucuyu 3000 portunda baslat
server.listen(3000, '0.0.0.0', () => {
    console.log("Sunucu http://localhost:3000 adresinde calisiyor.");
});