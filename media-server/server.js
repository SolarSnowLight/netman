//**************************************
// Работа серверной части приложения
//**************************************

const express = require('express');
const config = require("config");
const logger = require('./logger/logger');
const cors = require('cors');

const app = express()

app.use(express.static(__dirname));
app.use(express.json({ extended: true }));
app.use(cors());

// Определение основных маршрутов
app.use('/media', require('./routes/media.routes'));
app.use('/users', require('./routes/users.icons.routes'));

const PORT = config.get('port') || 6000;

function start() {                                     
    try {
        const data = app.listen(PORT, () => console.log(`Сервер запущен с портом ${PORT}`));
        logger.info({
            port: (config.get('port') || 6000),
            message: "Запуск сервера"
        });
        return data;
    } catch (e) {
        logger.error({
            message: e.message
        });
        process.exit(1); // Выход из процесса
        return null;
    }
    return null;
}

start();
