//----------------------------------------------------------------
// Определение объекта определяющего функционал для авторизации
// и разлогирования (log in and log out)
//----------------------------------------------------------------

import { useState, useCallback, useEffect } from 'react';
import default_config from '../config/default/default.config';
import address_config from '../config/address/address.config';
import { useHttp } from './http.hook';
import { useMessage } from './message.hook';

export const useAuth = () => {
    const [typeAuth, setTypeAuth] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);
    const [usersId, setUsersId] = useState(null);
    const [attributes, setAttributes] = useState(null);
    const [modules, setModules] = useState(null);

    const { loading, request, error, clearError } = useHttp();
    const message = useMessage();

    const login = useCallback((typeAuth, jwtAccessToken, jwtRefreshToken, usersId, atrib, mod) => {
        setTypeAuth(typeAuth);
        setAccessToken(jwtAccessToken);
        setRefreshToken(jwtRefreshToken);
        setUsersId(usersId);
        setAttributes(atrib);
        setModules(mod);

        localStorage.setItem(default_config.storageName, JSON.stringify({
            users_id: usersId,
            type_auth: typeAuth,
            access_token: jwtAccessToken,
            refresh_token: jwtRefreshToken,
            attributes: atrib,
            modules: mod,
        }));

    }, []);


    const logout = useCallback(async () => {
        try {
            const localData = JSON.parse(localStorage.getItem(default_config.storageName));

            const data = await request(address_config.auth_logout, 'POST', {
                users_id: localData.users_id,
                refresh_token: localData.refresh_token,
                access_token: localData.access_token,
                type_auth: localData.type_auth
            });

            if (data.message) {
                message(data.message, "error");

                const errors = data.errors;
                if (errors) {
                    errors.forEach(function (item) {
                        message(item.msg, "error");
                    });
                }
                return;
            }
        } catch (e) { }

        setTypeAuth(null);
        setAccessToken(null);
        setRefreshToken(null);
        setUsersId(null);
        setAttributes(null);
        setModules(null);

        localStorage.removeItem(default_config.storageName);
    }, []);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem(default_config.storageName));

        if ((data) && (data.access_token) && (data.refresh_token)) {
            login(data.type_auth, data.access_token, data.refresh_token, data.users_id, data.attributes, data.modules);
        }
    }, [login]);

    return { login, logout, typeAuth, accessToken, refreshToken, usersId, attributes, modules };
};