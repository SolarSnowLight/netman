//------------------------------------------------------------------
//Определение навигации для сайта
//------------------------------------------------------------------

import React, { useContext, useEffect, useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useHttp } from '../../hooks/http.hook';
import { useMessage } from '../../hooks/message.hook';
import classNames from 'classnames';

// Подключение изображений
import account_user from "../../resources/icons/account_user.svg";
import messenger from "../../resources/icons/messenger.svg";
import logo_netman from "../../resources/images/main/image_netman.png";

// Подключение таблицы стилей
import styles from "./Navbar.module.css";

// Подключение файлов конфигурации
import default_config from '../../config/default/default.config';
import address_config from '../../config/address/address.config';
import routes_config from '../../config/routes/routes.config';

const Navbar = () => {
    const history = useHistory();
    const auth = useContext(AuthContext);
    const message = useMessage();
    const { loading, request, error, clearError } = useHttp();
    let [nameRole, setNameRole] = useState("Модуль");
    let [currentFunction, setCurrentFunction] = useState(null);
    let [roleFunctions, setRoleFunctions] = useState({
        functions: []
    });

    useEffect(() => {
        message(error);
        clearError();
    }, [error, message, clearError]);

    // Обработка разлогирования пользователя
    const logoutHandler = (event) => {
        event.preventDefault();
        auth.logout();
        history.push(routes_config.line);
    };

    const toRegPage = () => {
        window.location.assign('http://' + default_config.serverAddress + routes_config.register);
    };

    // Проверка доступа к определённому функциональному модулю
    const checkAccess = async (event) => {
        try {
            const data = await request(address_config.sequrity_access, 'POST', {
                users_id: auth.usersId, name_module: event.target.name,
                access_token: (JSON.parse(localStorage.getItem(default_config.storageName))).access_token
            });

            if ((data.message) || (data.errors)) {
                message(data.message);

                const errors = data.errors;
                if (errors) {
                    errors.forEach(function (item) {
                        message(item.msg);
                    });
                }

                logoutHandler(event);
                return;
            }

            /*localStorage.setItem(default_config.storageName, JSON.stringify({
                ...JSON.parse(localStorage.getItem(default_config.storageName))
            }));*/

        } catch (e) {
            logoutHandler(event);
        }
    };

    return (
        <nav className={styles["navbar-wrapper"]}>
            <ul className={styles["navbar-topmenu"]}>
                <li className={styles["navbar-topmenu-item-2"]}>
                    {
                        // Установка функциональных кнопок для обеспечения пользователя тем или иным функционалом
                    }
                    <ul className={styles["topmenu-item-2-block-function"]}>
                        {(roleFunctions.functions !== null) && roleFunctions.functions.map(item => (
                            <li
                                key={item.name}
                            >
                                <NavLink to={item.ref}
                                    name={item.name}
                                    onClick={checkAccess}
                                    disabled={loading}
                                    className={styles["block-function-navlink"]}
                                    style={{
                                        color: 'white',
                                        fontWeight: ((currentFunction) && (currentFunction.function === item.name)) ? 'bold' : 'normal'
                                    }}
                                    onClick={(e) => {
                                        setCurrentFunction({
                                            function: item.name
                                        });
                                    }}
                                >
                                    {item.text}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </li>
                <li className={styles["navbar-topmenu-item-1"]}><img src={logo_netman} /></li>
                <li className={styles["navbar-topmenu-item-3"]}>
                    <label className={styles["topmenu-item-3-role"]}>{nameRole}</label>
                    <ul className={classNames(styles["submenu"], styles["buttons-block"])}>

                        {((auth.isAuthenticated) && (auth.modules) &&
                            (auth.modules.creator)) &&
                            <li>
                                <NavLink to={routes_config.function_creator}
                                    name="creator"
                                    onClick={checkAccess}
                                    disabled={loading}
                                >
                                <button onClick={() => {
                                    setNameRole("Создатель");
                                    setRoleFunctions({
                                        functions: [{
                                            ref: routes_config.function_creator,
                                            text: 'Создать игру',
                                            name: 'creator',
                                        },
                                            {
                                            ref: routes_config.function_creator_games_view_created,
                                            text: 'Просмотр игр',
                                            name: 'game_views',
                                        },
                                        {
                                            ref: routes_config.function_creator_games_archive,
                                            text: 'Архив игр',
                                            name: 'game_archive',
                                        }]
                                    });
                                }}>Создатель</button>
                            </NavLink>
                            </li>
                        }

                        {((auth.isAuthenticated) && (auth.modules) &&
                            (auth.modules.moderator)) &&
                            <li><NavLink to={routes_config.function_moderator}
                                name="moderator"
                                onClick={checkAccess}
                                disabled={loading}
                            ><button onClick={() => {
                                setNameRole("Модератор");
                                setRoleFunctions({
                                    functions: [{
                                        ref: routes_config.function_moderator,
                                        text: 'Просмотр игр',
                                        name: 'moderator'
                                    },
                                        {
                                        ref: routes_config.function_moderator_creators_list,
                                        text: 'Создатели',
                                        name: 'creator_list'
                                    }
                                    ]
                                });
                            }}>Модератор</button></NavLink></li>
                        }

                        {((auth.isAuthenticated) && (auth.modules) &&
                            (auth.modules.manager)) &&
                            <li><NavLink to={routes_config.function_manager}
                                name="manager"
                                onClick={checkAccess}
                                disabled={loading}
                            ><button onClick={() => {
                                setNameRole("Менеджер");
                            }}>Менеджер</button></NavLink></li>
                        }

                        {((auth.isAuthenticated) && (auth.modules) &&
                            (auth.modules.admin)) &&
                            <li><NavLink to={routes_config.function_admin}
                                name="admin"
                                onClick={checkAccess}
                                disabled={loading}
                            ><button onClick={() => {
                                setNameRole("Администратор");
                            }}>Админ</button></NavLink></li>
                        }

                        {((auth.isAuthenticated) && (auth.modules) &&
                            (auth.modules.super_admin)) &&
                            <li><NavLink to={routes_config.function_superadmin}
                                name="super_admin"
                                onClick={checkAccess}
                                disabled={loading}
                            ><button onClick={() => {
                                setNameRole("Бог");
                            }}>Бог</button></NavLink></li>
                        }
                    </ul>
                </li>
                <li className={styles["navbar-topmenu-item-4"]}>
                    <img src={messenger} />
                    <ul className={classNames(styles["submenu"], styles["buttons-block"])}>
                        <li>
                            <a href="/">
                                <button onClick={logoutHandler}>New</button>
                            </a>
                        </li>
                    </ul>
                </li>
                <li className={styles["navbar-topmenu-item-5"]}>
                    <img src={account_user} />
                    <ul className={classNames(styles["submenu"], styles["buttons-block"])}>
                        <li>
                            <a href="/">
                                <button onClick={logoutHandler}>Выход</button>
                            </a>
                        </li>
                    </ul>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;