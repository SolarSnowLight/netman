// *********************************************************
// Маршрутизация для управления базой данных медиа файлов
// *********************************************************

const { Router } = require('express');
const router = Router();                    //маршрутизация
const logger = require('../logger/logger'); //логгер
const fetch = require('node-fetch');
const config = require("config");           //подключение конфига
const { address_config }
    = require('../config/address.config');  //константы маршрутов
const multer = require("multer");
const upload = multer({ dest: "uploads" });
const {
    MediaResults, MediaInstructions, sequelize, Sequelize
} = require('../sequelize/models');

router.post(address_config.m_upload, upload.single("file"), async function (req, res) {
    try {
        const {
            current_games,
            users_id,
            games_id,
            ref_media_instructions,
            access_token
        } = JSON.parse(req.body.video_data); // Данные о видео

        // Проверка токена ...

        let filedata = req.file;

        if (!filedata) {
            return res.status(201).json({
                message: "Видео не загружено!"
            });
        }
        else {
            const mediaInstructions = await MediaInstructions.findOne({
                where: {
                    local_path: ref_media_instructions
                }
            });

            const localPathResults = await MediaResults.create({
                current_games: current_games,
                users_id: users_id,
                games_id: games_id,
                media_instructions_id: mediaInstructions.id,
                name_file: filedata.filename,
                local_path: filedata.path
            });

            return res.status(201).json({
                errors: null,
                message: null,
                local_path: localPathResults.local_path
            });
        }
    } catch (e) {
        console.log(e);
    }
});

router.post(address_config.m_download, async function (req, res) {
    try {
        const {
            local_path,
            access_token
        } = req.body;

        // Проверка токена ...

        const mediaFile = await MediaResults.findOne({
            where: {
                local_path: local_path
            }
        });

        if (!mediaFile) {
            return res.status(404).json({
                errors: null,
                message: "Файла не найдено!"
            });
        }

        res.status(201)
            .set({
                "filename": mediaFile.name_file
            })
            .download(mediaFile.local_path, mediaFile.name_file);
    } catch (e) {
        console.log(e);
    }
});

router.post(address_config.m_instructions_download, async function (req, res) {
    try {
        const {
            local_path,
            access_token
        } = req.body;

        // Проверка токена ...

        const mediaFile = await MediaInstructions.findOne({
            where: {
                local_path: local_path
            }
        });

        if (!mediaFile) {
            return res.status(404).json({
                errors: null,
                message: "Файла не найдено!"
            });
        }

        res.status(201)
            .set({
                "filename": mediaFile.name_file
            })
            .download(mediaFile.local_path, mediaFile.name_file);
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;