const dgram = require('dgram');
const server = dgram.createSocket('udp4');

const PORT = 12345;
const CLIENTS = {};

server.on('message', (msg, rinfo) => {
    const data = msg.toString();

    // Если клиент отправил данные для регистрации
    if (data.startsWith('REGISTER')) {
        const [_, clientId] = data.split(':');
        CLIENTS[clientId] = rinfo;
        console.log(`Зарегистрирован клиент: ${clientId} с IP: ${rinfo.address} и портом: ${rinfo.port}`);
        
        // Отправляем информацию другим клиентам
        for (const [id, address] of Object.entries(CLIENTS)) {
            if (id !== clientId) {
                const message = `CONNECT:${id}:${address.address}:${address.port}`;
                server.send(message, rinfo.port, rinfo.address);
                console.log(`Отправлено сообщение с информацией для hole punching клиенту ${clientId}`);
            }
        }
    }
});

server.bind(PORT, () => {
    console.log(`Сервер слушает на порту ${PORT}`);
});
