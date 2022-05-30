/*
 * Определение состава  и функционала страницы авторизации
*/

import React, { useEffect, useState, useContext } from 'react';
import { useHttp } from '../../hooks/http.hook';
import { useMessage } from '../../hooks/message.hook';
import { AuthContext } from '../../context/AuthContext';
import GoogleLogin, { GoogleLogout} from 'react-google-login';
import default_config from '../../config/default/default.config';
import address_config from '../../config/address/address.config';
import logo_netman from '../../resources/images/main/image_netman.png';
import styles from './AuthPage.module.css';

const AuthPage = () => {
    const auth = useContext(AuthContext);
    const message = useMessage();
    const { loading, request, error, clearError } = useHttp();

    // Состояние формы, для отправки на сервер при авторизации
    const [form, setForm] = useState({
        email: '', password: ''
    });

    useEffect(() => {
        message(error, "error");
        clearError();
    }, [error, message, clearError]);

    // При изменении значений элементов на форме будут изменяться свойства объекта form
    const changeHandler = event => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    // Обработка авторизации стандартным способом
    const loginHandler = async () => {
        try {
            // Отправка POST-запроса на сервер с передачей данных, полученных с формы
            const data = await request(address_config.auth_login, 'POST', { ...form });

            // Обработка ошибок
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

            auth.login(data.type_auth, data.access_token, data.refresh_token, data.users_id, data.attributes, data.modules);
            message("Авторизация прошла успешно!", "success");
        } catch (e) { }
    };

    // Обработка авторизации с помощью OAuth
    const loginOAuthHandler = async (response) => {
        try {

            const data = await request(address_config.auth_oauth, 'POST', { code: response.code });

            // Обработка ошибок
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

            auth.login(data.type_auth, data.access_token, data.refresh_token, data.users_id, data.attributes, data.modules);
            message("Авторизация прошла успешно!", "success");
        } catch (e) { }
    };

    /*
     * Пример работы перенаправления с одной страницы на другую
     */
    /*const toRegPage = () => {
        window.location.assign(default_config.serverAddress + "/register");
    };*/

    return (
        <div className={styles["container-login"]}>
            <div className={styles["content"]}>
                <div className={styles["item-login-1"]}>
                    <img className={styles["auth-logo-img"]} src={logo_netman} />
                    <span className={styles["auth-logo-text"]}>NetMan AR Game</span>
                </div>

                <div className={styles["item-login-2"]}>
                        <span className={styles["auth-txt"]}>Авторизация</span>

                        <div className={styles["btn-mail-pswrd"]}>
                            Email
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="Введите email"
                                    className={styles["login-input-field"]}
                                    onChange={changeHandler}
                                />
                        </div>
                        <div className={styles["btn-mail-pswrd"]}>
                            Password
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    placeholder="Введите пароль"
                                    className={styles["login-input-field"]}
                                    onChange={changeHandler}
                                />
                        </div>
                        <div className={styles["restore-password"]}>
                            <a className={styles["restore-ref"]} href="">
                                Забыл пароль
                            </a>
                        </div>

                        <button
                            className={styles["btn-auth-std"]}
                            onClick={loginHandler}
                            disabled={loading}
                        >
                            <span>Войти</span>
                        </button>

                        <div className={styles["btn-google"]}>
                            <GoogleLogin
                                className={styles["btn-auth-google"]}
                                clientId={default_config.googleAuthApiKey}
                                buttonText="Авторизоваться через Google"
                                onSuccess={loginOAuthHandler}
                                cookiePolicy={"single_host_origin"}
                                responseType='code'
                                accessType='offline'
                            ></GoogleLogin>
                        </div>
                    </div>
                </div>
            </div>
    );
}

export default AuthPage;