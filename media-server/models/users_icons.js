module.exports = function (sequelize, DataTypes) {
    return sequelize.define('users_icons', {
        users_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        name_file: {
            type: DataTypes.STRING(512),
            allowNull: false
        },
        local_path: {
            type: DataTypes.STRING(1024),
            allowNull: false
        },
    });
};
