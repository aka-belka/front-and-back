const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');

const vapidKeys = {
    publicKey: 'BOMxzebJlumRKjRsPdeh0FY2wZ_FiuFOWf73-FtiQfoRyL-913llgWjbcvl7RH3zvXJpGnIqgTmdcC8KENdr01M',
    privateKey: 'iDPkmPItr8ClEhUFmA2MP2bQfR9nNPv-oUDDIMEbNHw'
};

webpush.setVapidDetails(
    'mailto:sergeevnau18@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../'))); 

let subscriptions = [];

let server;

const certPath = path.join(__dirname, '..', 'localhost+2.pem');
const keyPath = path.join(__dirname, '..', 'localhost+2-key.pem');

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    const sslOptions = {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath)
    };
    server = https.createServer(sslOptions, app);
    console.log('HTTPS режим (сертификаты найдены)');
} else {
    server = http.createServer(app);
    console.log('HTTP режим (сертификаты не найдены)');
}


const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
    console.log('Клиент подключён:', socket.id);

    socket.on('newTask', (task) => {
        io.emit('taskAdded', task);

        const payload = JSON.stringify({
            title: 'Новая задача',
            body: task.text
        });

        subscriptions.forEach(sub => {
            webpush.sendNotification(sub, payload).catch(err =>
                console.error('Push error:', err));
        });
    });

    socket.on('disconnect', () => {
        console.log('Клиент отключён:', socket.id);
    });
});

app.post('/subscribe', (req, res) => {
    subscriptions.push(req.body);
    res.status(201).json({ message: 'Подписка сохранена' });
});

app.post('/unsubscribe', (req, res) => {
    const { endpoint } = req.body;
    subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint);
    res.status(200).json({ message: 'Подписка удалена' });
});

const PORT = 3001;

server.listen(PORT, () => {
    console.log(`Сервер запущен на ${fs.existsSync(certPath) ? 'https' : 'http'}://localhost:${PORT}`);
});