module.exports = function (sequelize, DataTypes) {
    return sequelize.define('media_instructions', {
        users_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        name_file: {
            type: DataTypes.STRING(512),
            allowNull: false
        },
        local_path: {
            type: DataTypes.STRING(1024),
            allowNull: false
        },
        date_created: {
            type: DataTypes.DATE,
            allowNull: false
        }
    });
};