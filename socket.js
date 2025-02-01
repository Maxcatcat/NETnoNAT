const dgram = require('dgram');
const socket = dgram.createSocket('udp4');
const process = require('process')
const SERVER_IP = 'localhost'; // IP сервера
const SERVER_PORT = 12345;     // Порт сервера
const MY_ID = process.argv[2] || 'client1'; // Идентификатор клиента

let peerIp;
let peerPort;

// Регистрация клиента на сервере
socket.send(`REGISTER:${MY_ID}`, SERVER_PORT, SERVER_IP, (err) => {
    if (err) console.error('Ошибка при регистрации:', err);
    else console.log(`Клиент ${MY_ID} зарегистрирован на сервере`);
});

// Обработка полученных данных от сервера (информация для hole punching)
socket.on('message', (msg, rinfo) => {
    const data = msg.toString();
    console.log(`Получено сообщение от сервера: ${data}`);

    if (data.startsWith('CONNECT')) {
        const [_, peerId, ip, port] = data.split(':');
        peerIp = ip;
        peerPort = parseInt(port);
        console.log(`Пытаемся установить соединение с ${peerId} по адресу ${peerIp}:${peerPort}`);

        // Начинаем hole punching
        setInterval(() => {
            socket.send('PING', peerPort, peerIp, (err) => {
                if (err) console.error('Ошибка при отправке PING:', err);
                else console.log(`Отправлено сообщение PING на ${peerIp}:${peerPort}`);
            });
        }, 1000); // Отправляем PING сообщения для hole punching
    }
});

// Обработка получения данных
socket.on('message', (msg) => {
    if (msg.toString() === 'PONG') {
        console.log('Успешно установлено прямое соединение с клиентом!');
        // Теперь можно передавать данные
    }
});

// Функция для отправки данных (как в TCP)
function sendData(data) {
    socket.send(data, peerPort, peerIp, (err) => {
        if (err) console.error('Ошибка при отправке данных:', err);
        else console.log(`Данные отправлены на ${peerIp}:${peerPort}`);
    });
}

// Пример отправки данных
setTimeout(() => {
    sendData('Hello, peer!');
}, 5000); // Отправим данные через 5 секунд

// Запуск клиента
setTimeout(() => {
    console.log(`Клиент ${MY_ID} подключен. Ждем hole punching.`);
}, 3000);
