/*
 * Взаимодействие с серверной частью приложения по протоколу HTTP
 */

import { useState, useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import address_config from '../config/address/address.config';
import default_config from '../config/default/default.config';

export const useHttp = () => {
    const auth = useContext(AuthContext);

    // Установка состояний ошибки и загрузки
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const originalRequest = useCallback(async (url, method = 'GET', body = null, headers = {}) => {
        setLoading(true);
        try {
            const response = await fetch(url, { method, body, headers });
            const data = await response.json();

            setLoading(false);

            return {response, data};
        } catch (e) {
            setLoading(false);
            setError(e.message);
            throw e;
        }
    }, []);

    const refreshToken = useCallback(async (token, typeAuth) => {
        setLoading(true);
        try {
            const response = await fetch(
                default_config.serverCentHostAddress + address_config.auth_refresh_token,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        refresh_token: token,
                        type_auth: typeAuth
                    })
                }
            );
            const data = await response.json();
            auth.login(data.type_auth, data.access_token, data.refresh_token, data.users_id, data.attributes, data.modules);
            
            setLoading(false);

            return data;
        } catch (e) {
            setLoading(false);
            setError(e.message);
            throw e;
        }
    }, []);

    const request = useCallback(async (url, method = 'GET', body = null, headers = {}) => {
        setLoading(true);
        try {
            if (body) {
                body = JSON.stringify(body);
                headers['Content-Type'] = 'application/json';
            }

            let localData = JSON.parse(localStorage.getItem(default_config.storageName));

            if(localData){
                headers['Authorization'] = `Bearer ${localData?.type_auth} ${localData?.access_token}`;
            }

            let { response, data } = await originalRequest(url, method, body, headers);
            // Status code 401 = UnAuthorized
            if(response.status === 401){
                localData = await refreshToken(localData.refresh_token, localData.type_auth);

                headers['Authorization'] = `Bearer ${localData?.type_auth} ${localData?.access_token}`;

                const updateResponse = await originalRequest(url, method, body, headers);

                response = updateResponse.response;
                data = updateResponse.data;
            }

            setLoading(false);

            return data;
        } catch (e) {
            setLoading(false);
            setError(e.message);
            throw e;
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);  // Очистка ошибок

    return { loading, request, error, clearError};             // Возвращение объектов для взаимодействия с сервером
};