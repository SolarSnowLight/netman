module.exports = function (sequelize, DataTypes) {
    return sequelize.define('media_results', {
        users_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        current_games: {
            type: DataTypes.INTEGER
        },
        games_id: {
            type: DataTypes.INTEGER
        },
        name_file: {
            type: DataTypes.STRING(512),
            allowNull: false
        },
        local_path: {
            type: DataTypes.STRING(1024),
            allowNull: false
        }
    });
};