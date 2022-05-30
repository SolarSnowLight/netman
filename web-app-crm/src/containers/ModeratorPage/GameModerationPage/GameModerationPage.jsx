//***************************************************************************
// Страница проверки игры
//***************************************************************************

import React, { useEffect, useCallback, useState } from 'react';
import { Circle, GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useLocation, Link } from 'react-router-dom';
import { useMessage } from '../../../hooks/message.hook';
import Select from 'react-select';
import { getFormattedDate } from '../../../utils/date/DateFormatter';

// Конфигурационные файлы
import default_config from '../../../config/default/default.config';
import address_config from '../../../config/address/address.config';
import storage_config from '../../../config/storage/storage.config';
import routes_config from '../../../config/routes/routes.config';

// Таблицы стилей
import styles from './GameModerationPage.module.css';

// Загрузка изображений
import media from "../../../resources/images/creator_page/media.png";
import hint_image from "../../../resources/icons/hint_image.svg";
import send_message from "../../../resources/images/main/send_message.png";
import table_accepted from "../../../resources/icons/table_accepted.svg";

// Сетевое взаимодействие
import { useHttp } from '../../../hooks/http.hook';
import socketIOClient, { io } from 'socket.io-client';

const center = {    //default-центр Google Maps
    lat: 52.289588,
    lng: 104.280606
};

const socketOptions = {
    extraHeaders: { 'Access-Control-Allow-Credentials': true },
    allowEIO3: true
}

//socketIOClient(default_config.serverMessengerAddress, socketOptions)

const GameModerationPage = () => {

    const location = useLocation();

    // Для работы с сокетами
    let socket = null;

    // Nickname создателя
    const [creatorNickname, setCreatorNickname] = useState(null);

    // Полная информация об игре
    const [gameInfo, setGameInfo] = useState(null);

    // Статус текущей игры: 0 - неопределённый, 1 - одобренный, 
    // 2 - предупреждённый и 3 - забанено
    const [statusGame, setStatusGame] = useState({
        status: 0
    });

    // Активность чата между модератором и создателем (имеет смысл тогда, когда модератор выдал предупреждение)
    const [statusChat, setStatusChat] = useState({
        active: false
    });

    const [statusBan, setStatusBan] = useState({
        active: false
    });

    // Текст последнего предупреждения
    const [textWarning, setTextWarning] = useState({
        text: ""
    });

    // Причина бана
    const [textBan, setTextBan] = useState({
        text: ""
    });

    // Сообщения чата
    const [chatMessages, setChatMessages] = useState({
        messages: []
    });

    // Текущее сообщение для отправки
    const [sendMessage, setSendMessage] = useState({
        message: ''
    });

    // Информация об игре
    const [dataGameInfo, setDataGameInfo] = useState({
        location: '', date_begin: '', date_end: '',
        type: false, rating: 0, count_commands: 0,
        min_score: 0, age_limit: 0, name: ''
    });

    //проверка API KEY для работы Google Maps
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: default_config.googleMapsApiKey
    });

    // Данные для выпадающего списка
    const options = [
        { value: 'Иркутск', label: 'Иркутск' },
        { value: 'Ангарск', label: 'Ангарск' },
        { value: 'Черемхово', label: 'Черемхово' }
    ];

    const optionsAge = [
        { value: '0', label: '0+' },
        { value: '6', label: '6+' },
        { value: '12', label: '12+' },
        { value: '16', label: '16+' },
        { value: '18', label: '18+' },
    ];

    const gameInfoChangeHandler = event => {
        setDataGameInfo({ ...dataGameInfo, [event.target.name]: event.target.value });
    };

    const message = useMessage();
    const { loading, request, error, clearError } = useHttp();

    useEffect(async () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });

        /*socket = io(default_config.serverMessengerAddress);

        socket.emit('login', JSON.stringify({
            users_email: (JSON.parse(localStorage.getItem(default_config.storageName))).users_email,
            token: (JSON.parse(localStorage.getItem(default_config.storageName))).token
        }));

        socket.emit('leave_room');

        // Обработка события "обновление сообщений в чате"
        socket.on('set_user_messages', async(data) => {
            try {
                const values = JSON.parse(data);
                await setChatMessages({
                    messages: values
                });
            } catch (e) {}
        });

        socket.on('get_private_message', async (data) => {
            try {
                const values = JSON.parse(data);
                const allMessages = chatMessages.messages.slice(0);
                allMessages.push({
                    email_sender: "a@mail.ru",
                    message: "a@mail.ru",
                    date_send: new Date()
                });

                console.log("OPA");

                await setChatMessages({
                    messages: chatMessages.messages.slice(0)
                });

            } catch (e) {}
        });*/

        setCreatorNickname(location.state.nickname);
        getInformationGame(location.state.info_games_id);

        return () => {
            //socket.disconnect();
        }
    }, []);

    useEffect(() => {
        message(error, "error");
        clearError();
    }, [error, message, clearError]);

    const getInformationGame = async (info_games_id) => {  //чтение свободных меток для создания квестов
        try {
            // UsersId и AccessToken авторизованного пользователя взяты из локального хранилища
            const usersId = (JSON.parse(localStorage.getItem(default_config.storageName))).users_id;
            const accessToken = (JSON.parse(localStorage.getItem(default_config.storageName))).access_token;

            //получение информации об игре
            const values = await request(address_config.function_moderator_game_info, 'POST', {
                users_id: usersId,
                access_token: accessToken,
                info_games_id: info_games_id
            });

            //обработка ошибок
            if (values.message) {
                message(values.message, "error");

                const errors = values.errors;
                if (errors) {
                    errors.forEach(function (item) {
                        message(item.msg, "error");
                    });
                }
                return;
            }

            await setGameInfo({
                info_games: values.info_games
            });

            await setStatusGame({
                status: values.info_games.status
            });

            if (values.info_games.status === 2) {
                await setTextWarning({
                    text: values.info_games.warnings[(values.info_games.warnings.length - 1)].reason
                });

                await setStatusChat({
                    active: true
                });

                // Получение всех сообщений для текущего пользователя
                /*if (socket) {
                    socket.emit('get_user_messages', JSON.stringify({
                        email_current: (JSON.parse(localStorage.getItem(default_config.storageName))).users_email,
                        email_other: location.state.users_email
                    }));
                }*/
            } else if (values.info_games.status === 3) {
                await setTextBan({
                    text: values.info_games.bans[(values.info_games.bans.length - 1)].reason
                });

                await setStatusBan({
                    active: true
                });
            }

            message("Информация об игре была загружена!", "success")
        } catch (e) { }
    };

    const gameAccepted = async (info_games_id) => {  // Одобрение определённой игры
        try {
            // UsersId и AccessToken авторизованного пользователя взяты из локального хранилища
            const usersId = (JSON.parse(localStorage.getItem(default_config.storageName))).users_id;
            const accessToken = (JSON.parse(localStorage.getItem(default_config.storageName))).access_token;

            //получение свободных меток для создания квестов
            const values = await request(address_config.function_moderator_game_accepted, 'POST', {
                users_id: usersId,
                access_token: accessToken,
                info_games_id: info_games_id
            });

            //обработка ошибок
            if (values.message) {
                message(values.message, "error");

                const errors = values.errors;
                if (errors) {
                    errors.forEach(function (item) {
                        message(item.msg, "error");
                    });
                }
                return;
            }

            message("Игра была одобрена!", "success");
            window.history.back();
        } catch (e) { }
    };

    const gameWarning = async (info_games_id, text) => {  // Выдача предупреждения игре
        try {
            // UsersId и AccessToken авторизованного пользователя взяты из локального хранилища
            const usersId = (JSON.parse(localStorage.getItem(default_config.storageName))).users_id;
            const accessToken = (JSON.parse(localStorage.getItem(default_config.storageName))).access_token;

            //получение свободных меток для создания квестов
            const values = await request(address_config.function_moderator_game_warning, 'POST', {
                users_id: usersId,
                access_token: accessToken,
                info_games_id: info_games_id,
                reason: text
            });

            if (values.message) {
                message(values.message, "error");

                const errors = values.errors;
                if (errors) {
                    errors.forEach(function (item) {
                        message(item.msg, "error");
                    });
                }
                return;
            }

            message("Было выдано предупреждение!", "dark");
        } catch (e) { }
    };

    const gameBan = async (info_games_id, text) => {  // Блокировка игры
        try {
            // UsersId и AccessToken авторизованного пользователя взяты из локального хранилища
            const usersId = (JSON.parse(localStorage.getItem(default_config.storageName))).users_id;
            const accessToken = (JSON.parse(localStorage.getItem(default_config.storageName))).access_token;

            //получение свободных меток для создания квестов
            const values = await request(address_config.function_moderator_game_ban, 'POST', {
                users_id: usersId,
                access_token: accessToken,
                info_games_id: info_games_id,
                reason: text
            });

            // Обработка ошибок
            if (values.message) {
                message(values.message, "error");

                const errors = values.errors;
                if (errors) {
                    errors.forEach(function (item) {
                        message(item.msg, "error");
                    });
                }
                return;
            }

            message("Игра была заблокирована!", "dark");
        } catch (e) { }
    };

    const gameUnBan = async (info_games_id) => {  // Блокировка игры
        try {
            // UsersId и AccessToken авторизованного пользователя взяты из локального хранилища
            const usersId = (JSON.parse(localStorage.getItem(default_config.storageName))).users_id;
            const accessToken = (JSON.parse(localStorage.getItem(default_config.storageName))).access_token;

            // Получение свободных меток для создания квестов
            const values = await request(address_config.function_moderator_game_unban, 'POST', {
                users_id: usersId,
                access_token: accessToken,
                info_games_id: info_games_id,
            });

            // Обработка ошибок
            if (values.message) {
                message(values.message, "error");

                const errors = values.errors;
                if (errors) {
                    errors.forEach(function (item) {
                        message(item.msg, "error");
                    });
                }
                return;
            }

            message("Игра была разблокирована!", "success");
        } catch (e) { }
    };

    const renderPage = () => {
        if (gameInfo === null) {
            return (
                <div></div>
            );
        }

        return (
            <div className={styles["container-moderation-game-page"]}>
                {
                    (statusGame.status == 0) && <div className={styles["moderation-game-page-item-chat-block"]}>
                        <button className={styles["functional-accept-btn"]}
                            onClick={(e) => {
                                // Закрепление данной игры за модератором и открытие регистрации на данную игру
                                gameAccepted(gameInfo.info_games.id);
                            }}
                        >Одобрить</button>
                        <button className={styles["functional-warning-btn"]}
                            onClick={async (e) => {
                                await setStatusGame({
                                    status: 2
                                });
                            }}
                        >Предупреждение</button>
                        <button className={styles["functional-ban-btn"]}
                            onClick={async (e) => {
                                await setStatusGame({
                                    status: 3
                                });
                            }}
                        >Заблокировать</button>
                    </div>
                    ||
                    (statusGame.status == 1) && <div className={styles["moderation-game-page-item-chat-block-accepted"]}>
                        <button className={styles["functional-accept-btn"]}
                        >Игра одобрена!</button>
                    </div>
                    ||
                    (statusGame.status == 3) && <div className={styles["moderation-game-page-item-bans"]}>
                        {
                            (!statusBan.active) && <div className={styles["functional-block-enter-ban"]}>
                                <textarea name="ban-text" id="ban-text" placeholder="Причина бана"
                                    onChange={async (e) => {
                                        await setTextBan({
                                            text: e.target.value
                                        });
                                    }}
                                />
                                <button
                                    onClick={async (e) => {
                                        await gameBan(gameInfo.info_games.id, textBan.text);
                                        await setStatusBan({
                                            active: true
                                        });
                                    }}
                                >Заблокировать игру</button>
                            </div>
                            ||
                            (statusBan.active) && < div className={styles["functional-block-banned"]}>
                                <span className={styles["functional-bans-reason"]}>{textBan.text}</span>
                                <span className={styles["functional-ban-view"]}
                                >Игра заблокирована!</span>
                                <button className={styles["functional-unban-view"]}
                                    onClick={async (e) => {
                                        await gameUnBan(gameInfo.info_games.id);

                                        await setStatusBan({
                                            active: false
                                        });

                                        await setTextBan({
                                            text: ''
                                        });

                                        await setStatusGame({
                                            status: 0
                                        });
                                    }}
                                >Разблокировать игру</button>
                            </div>
                        }
                    </div>
                    ||
                    (statusGame.status == 2) && <div className={styles["moderation-game-page-item-chat-block-warning"]}>
                        {
                            (!statusChat.active) && <div className={styles["functional-block-enter-warning"]}>
                                <textarea name="warning-text" id="warning-text" placeholder="Текст предупреждения"
                                    onChange={async (e) => {
                                        await setTextWarning({
                                            text: e.target.value
                                        });
                                    }}
                                />
                                <button
                                    onClick={async (e) => {
                                        await gameWarning(gameInfo.info_games.id, textWarning.text);
                                        await setStatusChat({
                                            active: true
                                        });
                                    }}
                                >Отправить предупреждение</button>
                            </div>
                            ||
                            (statusChat.active) && <div className={styles["functional-block-chat-warning"]}>
                                <span className={styles["block-text-warning"]}>{textWarning.text}</span>
                                <div className={styles["block-chat"]}>
                                    {
                                        (chatMessages.messages.map((item) => (
                                            (item.sender_users_id === gameInfo.info_games.users_id)
                                            && <div className={styles["block-chat-message-other"]}>
                                                <Link
                                                    className={styles["message-nickname-this"]}
                                                    to={{
                                                        pathname: routes_config.function_moderator_creator_info,
                                                        state: {
                                                            users_id: gameInfo.info_games.users_id
                                                        }
                                                    }}
                                                >{creatorNickname}</Link>
                                                <span className={styles["message-text-this"]}>{item.message}</span>
                                                <span className={styles["message-date-this"]}>{getFormattedDate(item.date_send, false)}</span>
                                            </div>
                                            ||
                                            (item.sender_users_id !== gameInfo.info_games.users_id)
                                            && <div className={styles["block-chat-message-this"]}>
                                                <span className={styles["message-text-this"]}>{item.message}</span>
                                                <span className={styles["message-date-this"]}>{getFormattedDate(item.date_send, false)}</span>
                                            </div>


                                        )))
                                    }
                                </div>
                                <div className={styles["block-send-message"]}>
                                    <div className={styles["message-sender"]}>
                                        <input type="text" name="message" placeholder="Сообщение" id="message"
                                            value={sendMessage.message}
                                            onChange={async (e) => {
                                                await setSendMessage({
                                                    message: e.target.value
                                                });
                                            }}
                                        />
                                        <img src={send_message}
                                            onClick={async (e) => {
                                                if (sendMessage.message.trim().length === 0) {
                                                    return;
                                                }

                                                // Отправка личного сообщения
                                                /*if (socket) {
                                                    socket.emit('send_private_message',
                                                        JSON.stringify({
                                                            email_current: (JSON.parse(localStorage.getItem(default_config.storageName))).users_email,
                                                            email_other: location.state.users_email,
                                                            message: sendMessage.message
                                                        })
                                                    );

                                                    await setSendMessage({
                                                        message: ''
                                                    });
                                                }*/

                                                /*const messages = chatMessages.messages;
                                                messages.push({
                                                    email: null,
                                                    message: sendMessage.message,
                                                    date_send: (new Date()).toISOString()
                                                });

                                                await setChatMessages({
                                                    messages: messages
                                                });*/
                                            }}
                                        />
                                    </div>
                                    <button className={styles["table-accepted"]}
                                        onClick={async (e) => {
                                            await setStatusGame({
                                                status: 0
                                            });
                                            await setStatusChat({
                                                active: false
                                            });
                                        }}
                                    >
                                        <img src={table_accepted} />
                                    </button>
                                </div>
                            </div>
                        }
                    </div>
                }

                <div className={styles["moderation-game-page-item"]}>
                    <div className={styles["moderation-game-page-item-2"]}>
                        <input className={styles["moderation-game-page-input"]} id="name"
                            name="name"
                            type="text"
                            placeholder="Название игры"
                            value={gameInfo.info_games.name} />
                    </div>
                    <div className={styles["moderation-game-page-item-2"]}>
                        <div className={styles["moderation-game-page-item-3"]}>
                            <div className={styles["moderation-game-page-item-3-element"]}>
                                <div>
                                    <span>Город</span>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={gameInfo.info_games.location}
                                    />
                                </div>
                            </div>
                            <div className={styles["moderation-game-page-item-3-element"]}>
                                <div>
                                    <span>Дата начала</span>
                                </div>
                                <div>
                                    <input type="datetime-local"
                                        value={getFormattedDate(gameInfo.info_games.date_begin, true)}
                                    />
                                </div>
                            </div>
                            <div className={styles["moderation-game-page-item-3-element"]}>
                                <div>
                                    <span>Дата завершения</span>
                                </div>
                                <div>
                                    <input
                                        type="datetime-local"
                                        value={getFormattedDate(gameInfo.info_games.date_end, true)}
                                    />
                                </div>
                            </div>
                            <div className={styles["moderation-game-page-item-3-element"]}>
                                <div>
                                    <span>Ограничения</span>
                                </div>
                                <div>
                                    <input
                                        className={styles["white-bottom-border"]}
                                        type="text"
                                        value={gameInfo.info_games.age_limit + "+"}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles["moderation-game-page-item-3"]}>
                            <div className={styles["moderation-game-page-item-3-element"]}>
                                <div>
                                    <span>Рейтинг</span>
                                </div>
                                <div>
                                    <input
                                        className={styles["white-bottom-border"]}
                                        type="text"
                                        value={gameInfo.info_games.rating}
                                    />
                                </div>
                            </div>
                            <div className={styles["moderation-game-page-item-3-element"]}>
                                <div>
                                    <span>Число команд</span>
                                </div>
                                <div>
                                    <input
                                        className={styles["white-bottom-border"]}
                                        type="text"
                                        value={gameInfo.info_games.max_count_commands}
                                    />
                                </div>
                            </div>
                            <div className={styles["moderation-game-page-item-3-element"]}>
                                <div>
                                    <span>Мин. число очков</span>
                                </div>
                                <div>
                                    <input
                                        className={styles["white-bottom-border"]}
                                        type="text"
                                        value={gameInfo.info_games.min_score}
                                    />
                                </div>
                            </div>
                            <div className={styles["moderation-game-page-item-3-element"]}>
                                <div>
                                    <span>Технология дополненной реальности</span>
                                </div>
                                <div>
                                    <input type="checkbox" id="arcore" name="arcore"
                                        checked={gameInfo.info_games.type}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles["moderation-game-page-item-gm"]}>
                    <GoogleMap
                        mapContainerClassName={styles["moderation-game-page-item-1-gm"]}
                        center={center}
                        zoom={16}
                        options={{
                            fullscreenControl: false,
                            draggableCursor: "default",
                            draggingCursor: "default",
                            disableDoubleClickZoom: true,
                        }}
                    >
                        {
                            //Добавление свободных меток на карту создателя
                        }

                        {(gameInfo !== null) && gameInfo.info_games.quests.map(item => (
                            <Marker
                                position={{
                                    lat: item.lat,
                                    lng: item.lng
                                }}
                            >
                                {
                                    //Определение радиуса действия задания и радиуса квеста, который будет
                                    //отрисован при близком приближении к цели квеста
                                }

                                <Circle
                                    center={{
                                        lat: item.lat,
                                        lng: item.lng
                                    }}
                                    radius={50}
                                    options={{
                                        strokeColor: "grey",
                                        fillColor: "grey",
                                    }}
                                >
                                </Circle>

                                <Circle
                                    center={{
                                        lat: item.lat,
                                        lng: item.lng
                                    }}
                                    radius={item.radius}
                                    options={{
                                        strokeColor: "green",
                                        fillColor: "green"
                                    }}
                                >
                                </Circle>
                            </Marker>
                        ))
                        }
                    </GoogleMap>
                </div>
                <div className={styles["moderation-game-page-item"]}>
                    {(gameInfo !== null) && gameInfo.info_games.quests.map(item => (
                        <div className={styles["moderation-game-page-item-1-quest-created"]}>
                            {
                                /* Блок для заполнения информации о каждом отдельном квесте */
                            }
                            <div className={styles["item-1-quest-created"]}>
                                <input className={styles["moderation-game-page-input"]} type="text" placeholder="Название"
                                    value={item.location}
                                    readOnly
                                />
                            </div>
                            <div className={styles["item-1-quest-created"]}>
                                <img src={media} alt="Ссылка на медиафайл" />
                                <input className={styles["moderation-game-page-input"]} type="text"
                                    value={item.ref_media}
                                    readOnly
                                />
                            </div>
                            <div className={styles["item-1-quest-block"]}>
                                <img src={hint_image} alt="Подсказка" />
                                <input className={styles["moderation-game-page-input"]} type="text"
                                    value={item.hint}
                                    readOnly
                                />
                            </div>
                            <div className={styles["item-1-quest-created"]}>
                                <textarea
                                    value={item.task}
                                />
                            </div>
                            <div className={styles["item-1-quest-created"]}>
                                <output>{item.radius}</output>
                                <input className={styles["moderation-game-page-input"]} type="range"
                                    min="1" max="50" defaultValue="1"
                                    value={item.radius}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (loadError) {
        // Страница не загрузилась
        return;
    }

    return isLoaded ? renderPage() : <></>
}

export default GameModerationPage;