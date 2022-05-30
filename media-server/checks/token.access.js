//****************************************
// Проверка токена
//****************************************

const fetch = require('node-fetch');
const config = require('config');
const { address_config }
    = require('../config/address.config');

const checkToken = async (token) => {
    try {
        let check = false;
        await fetch(address_config.cs_sequrity_token, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ access_token: token })
        }).then(res => res.json())
            .then(json => {
                check = json.check;
            });

        if (!check)
            return false;

        return true;
    } catch (e) {
        logger.error({
            method: 'Check sequrity user token',
            message: e.message,
        });
        return false;
    }
};

const checkExists = async (users_id) => {
    try {
        let check = false;
        await fetch(address_config.cs_sequrity_exists, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ users_id: users_id })
        }).then(res => res.json())
            .then(json => {
                check = json.check;
            });

        if (!check) {
            return false;
        }

        return true;
    } catch (e) {
        logger.error({
            method: 'Check sequrity user exists',
            message: e.message,
        });
        return false;
    }
}

module.exports.checkToken = checkToken;
module.exports.checkExists = checkExists;