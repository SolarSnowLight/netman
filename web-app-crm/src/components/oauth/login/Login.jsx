import React, { useEffect, useState, useContext } from 'react';
import { useHttp } from '../../../hooks/http.hook';
import { useMessage } from '../../../hooks/message.hook';
import { AuthContext } from '../../../context/AuthContext';
import GoogleLogin, { GoogleLogout } from 'react-google-login';
import default_config from '../../../config/default/default.config';
import address_config from '../../../config/address/address.config';
import logo_netman from '../../../resources/images/main/image_netman.png';

const Login = (props) => {
    const { loading, request, error, clearError } = useHttp();
    const message = useMessage();

     // Обработка авторизации с помощью OAuth
     const loginOAuthHandler = async (response) => {
        try {
            // Отправка POST-запроса на сервер с передачей данных
            console.log(response);
            const data = await request(address_config.auth_oauth, 'POST', { access_token: response.accessToken });

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

            props.auth.login(data.access_token, data.refresh_token, data.users_id, data.attributes, data.modules);
            message("Авторизация прошла успешно!", "success");
        } catch (e) { }
    };

    return (
        <div className={props.styles["btn-google"]} >
            <GoogleLogin
                className={props.styles["btn-auth-google"]}
                clientId={default_config.googleAuthApiKey}
                buttonText="Авторизоваться через Google"
                onSuccess={loginOAuthHandler}
                cookiePolicy={"single_host_origin"}
                isSignedIn={true}
                accessType='offline'
            ></GoogleLogin>
        </div >
    );
}

export default Login;
