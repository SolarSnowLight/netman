//********************************************************************
// Маршрутизация для загрузки и скачивания пользовательских иконок
//********************************************************************

const { Router } = require('express');
const router = Router();                    // Маршрутизация
const fs = require('fs');                   // Модуль файловой системы
const logger = require('../logger/logger'); // Логгер
const fetch = require('node-fetch');        // Для отправки запросов
const config = require("config");           // Подключение конфига
const { address_config }
    = require('../config/address.config');  // Константы маршрутов
const { checkExists, checkToken }
    = require('../checks/token.access');    // Функции проверки пользовательских данных
const multer = require("multer");
const upload = multer({ dest: "icons" });   // Загрузка изображений в папку icons
const {
    MediaResults, MediaInstructions, sequelize, Sequelize, UsersIcons
} = require('../sequelize/models');


// Загрузка пользовательского изображения на сервер
router.post(address_config.u_icons_upload, upload.single("file"), async function (req, res) {
    try {
        const {
            users_id,
            access_token
        } = JSON.parse(req.body.image_data); // Данные о пользовательской иконке

        let filedata = req.file;

        if (!filedata) {
            logger.error({
                method: 'POST',
                address: address_config.u_icons_upload,
                message: 'Некорректные данные при загрузки изображения на сервер',
            });

            return res.status(201).json({
                errors: null,
                message: "Ошибка при загрузке изображения!"
            });
        }

        // *****************
        // [BLOCK START CHECK]
        let checks = {
            token: false,
            exists: false
        };

        checks.token = await checkToken(access_token);
        checks.exists = await checkExists(users_id);

        if ((!checks.token) || (!checks.exists)) {
            // Удаление загруженного файла
            fs.unlinkSync(filedata.path);

            logger.error({
                method: 'POST',
                address: address_config.u_icons_upload,
                message: 'Не действующий токен или такого пользователя не существует',
            });

            return res.status(404).json({
                errors: null,
                message: "Невозможно установить изображение!"
            });
        }

        // [BLOCK END CHECK]
        // *****************

        const currentUser = await UsersIcons.findOne({
            where: {
                users_id: users_id
            }
        });

        if (currentUser) {
            // Удаление старого пользовательского изображения
            fs.unlinkSync(currentUser.local_path);

            await currentUser.update({
                local_path: filedata.path,
                name_file: filedata.filename,
            });
        } else {
            await UsersIcons.create({
                users_id: users_id,
                local_path: filedata.path,
                name_file: filedata.filename,
            });
        }

        return res.status(201).json({
            errors: null,
            message: null,
        });
    } catch (e) {
        console.log(e);
    }
});


// Скачивание пользовательского изображения с основного сервера
router.post(address_config.u_icons_download, async function (req, res) {
    try {
        const {
            users_id,
            access_token
        } = req.body;

        // *****************
        // [BLOCK START CHECK]
        let checks = {
            token: false,
            exists: false
        };

        checks.token = await checkToken(access_token);
        checks.exists = await checkExists(users_id);

        if ((!checks.token) || (!checks.exists)) {
            logger.error({
                method: 'POST',
                address: address_config.u_icons_downloas,
                message: 'Не действующий токен или такого пользователя не существует',
            });

            return res.status(404).json({
                errors: null,
                message: "Невозможно установить изображение!"
            });
        }
        // [BLOCK END CHECK]
        // *****************

        const userIcon = await UsersIcons.findOne({
            where: {
                users_id: users_id
            }
        });

        if (!userIcon) {
            return res.status(404).json({
                errors: null,
                message: "Файла не найдено!"
            });
        }

        res.status(201)
            .set({
                "filename": userIcon.name_file
            })
            .download(userIcon.local_path, userIcon.name_file);
    } catch (e) {
        console.log(e);
    }
});

// Скачивание изображения члена команды с основного сервера
router.post(address_config.u_team_players_icons_download, async function (req, res) {
    try {
        const {
            users_id,
            team_users_id,
            name_previous_file,
            access_token
        } = req.body;

        // *****************
        // [BLOCK START CHECK]
        let checks = {
            token: false,
            exists: false
        };

        checks.token = await checkToken(access_token);
        checks.exists = await checkExists(users_id);
        checks.exists = checks.exists && (await checkExists(team_users_id));

        if ((!checks.token) || (!checks.exists)) {
            logger.error({
                method: 'POST',
                address: address_config.users_team_players_icons_download,
                message: 'Не действующий токен или такого пользователя не существует',
            });

            return res.status(404).json({
                errors: null,
                message: "Невозможно установить изображение!"
            });
        }
        // [BLOCK END CHECK]
        // *****************

        const userIcon = await UsersIcons.findOne({
            where: {
                users_id: team_users_id
            }
        });

        if (!userIcon) {
            return res.status(404).json({
                errors: null,
                message: "Файла не найдено!"
            });
        }

        if ((name_previous_file) && (userIcon.name_file == name_previous_file)) {
            // Если известно имя файла и оно совпадает с тем, что есть
            // в БД, то нет необходимости его заново загружать
            return res.status(404).json({
                errors: null,
                message: null
            });
        }

        // Если же имя файла не известно, или оно не совпадает с
        // именем файла в БД, то необходимо обновить картинку у запрашиваемого пользователя
        res.status(201)
            .set({
                "filename": userIcon.name_file
            })
            .download(userIcon.local_path, userIcon.name_file);
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;