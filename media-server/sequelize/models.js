const config = require("config");           //подключение конфига
const logger = require('../logger/logger'); //логгер
const Sequelize = require("sequelize");
const sequelize = new Sequelize(            //установка подключения с базой данных
    config.get("database").database,
    config.get("database").user,
    config.get("database").password,
    {
        dialect: "postgres",
        host: config.get("database").host,
        port: config.get("database").port,
        define: {
            timestamps: false
        }
    }
);

//-----------------------------------------------------------------------------------------
//взаимодействие с моделями базы данных
const MediaResults      = require('../models/media_results')(sequelize, Sequelize);
const MediaInstructions = require('../models/media_instructions')(sequelize, Sequelize);
const UsersIcons        = require('../models/users_icons')(sequelize, Sequelize);

MediaInstructions.hasMany(MediaResults, {
    foreignKey: {
        name: 'media_instructions_id',
        allowNull: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    }
});


//синхронизация моделей с базой данных
sequelize.sync().then(result => {}).catch(err => {
    logger.error({
        method: 'Synchronization of models with the database',
        message: 'Ошибка при синхронизации моделей с базой данных',
    });
});

module.exports.MediaInstructions    = MediaInstructions;
module.exports.MediaResults         = MediaResults;
module.exports.UsersIcons           = UsersIcons;
module.exports.sequelize            = sequelize;
module.exports.Sequelize            = Sequelize;