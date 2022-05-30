//*****************************************************************
// Определение страницы для просмотра игр, созданных создателем
//*****************************************************************

import React, { useState, useCallback, useEffect } from 'react';
import { useHttp } from '../../hooks/http.hook';
import { useMessage } from '../../hooks/message.hook';
import { Link, NavLink } from 'react-router-dom';
import Select from 'react-select';
import { getFormattedDate } from '../../utils/date/DateFormatter';

// Конфигурационные файлы
import default_config from '../../config/default/default.config';
import address_config from '../../config/address/address.config';
import storage_config from '../../config/storage/storage.config';
import routes_config from '../../config/routes/routes.config';

// Загрузка таблиц стилей
import styles from './ModeratorPage.module.css';

// Загрузка изображений
import down_arrow from '../../resources/images/creator_page/view_game/down_arrow.svg';
import up_arrow from '../../resources/images/creator_page/view_game/up_arrow.svg';
import row_menu from '../../resources/images/creator_page/view_game/row_menu.png';
import cross from '../../resources/images/creator_page/view_game/cross.png';

const ModeratorPage = () => {
    // Информация об играх, которые находятся в очереди на проверку
    const [queueGames, setQueueGames] = useState({
        queue_games: []
    });

    const [copyQueueGames, setCopyQueueGames] = useState({
        queue_games: []
    });

    const [checkedGames, setCheckedGames] = useState({
        checked_games: []
    });

    const [copyCheckedGames, setCopyCheckedGames] = useState({
        checked_games: []
    });

    const [arrows, setArrows] = useState({
        date_arrow: false
    });

    const [selectOptions1, setSelectOptions1] = useState({
        options: [{ value: 'Все города', label: 'Все города' }]
    });

    const [selectOptions2, setSelectOptions2] = useState({
        options: [{ value: 'Все города', label: 'Все города' }]
    });

    const message = useMessage();
    const { loading, request, error, clearError } = useHttp();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        message(error);
        clearError();
    }, [error, message, clearError]);

    useEffect(() => {
        getGamesQueue();
        getGamesChecked();
    }, []);

    Array.prototype.removeIf = function (callback) {
        var i = this.length;
        while (i--) {
            if (callback(this[i], i)) {
                this.splice(i, 1);
            }
        }
    };

    const getGamesQueue = async () => {
        try {
            // UsersId и AccessToken авторизованного пользователя взяты из локального хранилища
            const usersId = (JSON.parse(localStorage.getItem(default_config.storageName))).users_id;
            const accessToken = (JSON.parse(localStorage.getItem(default_config.storageName))).access_token;

            // Формирование POST-запроса к серверу
            const data = await request(address_config.function_moderator_games_queue, 'POST', {
                users_id: usersId,
                access_token: accessToken
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

            setQueueGames({
                queue_games: data.infoGamesList.slice(0)
            });

            setCopyQueueGames({
                queue_games: data.infoGamesList.slice(0)
            });

            let options = selectOptions1.options;
            for (let i = 0; i < data.infoGamesList.length; i++) {
                if (options.map((e) => (e.value)).indexOf(data.infoGamesList[i].location) < 0) {
                    options.push({
                        value: data.infoGamesList[i].location,
                        label: data.infoGamesList[i].location
                    });
                }
            }

            setSelectOptions1({
                options: options
            });

            message("Информация об актуальных созданных играх загружена!", "success");
        } catch (e) { }
    };

    const getGamesChecked = async () => {
        try {
            // UsersId и AccessToken авторизованного пользователя взяты из локального хранилища
            const usersId = (JSON.parse(localStorage.getItem(default_config.storageName))).users_id;
            const accessToken = (JSON.parse(localStorage.getItem(default_config.storageName))).access_token;

            //формирование POST-запроса к серверу
            const data = await request(address_config.function_moderator_games_checked, 'POST', {
                users_id: usersId,
                access_token: accessToken
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

            setCheckedGames({
                checked_games: data.infoGamesList.slice(0)
            });

            setCopyCheckedGames({
                checked_games: data.infoGamesList.slice(0)
            });

            let options = selectOptions2.options;
            for (let i = 0; i < data.infoGamesList.length; i++) {
                if (options.map((e) => (e.value)).indexOf(data.infoGamesList[i].location) < 0) {
                    options.push({
                        value: data.infoGamesList[i].location,
                        label: data.infoGamesList[i].location
                    });
                }
            }

            setSelectOptions2({
                options: options
            });

            message("Информация о проверенных играх загружена!", "success");
        } catch (e) { }
    };

    const gameDateSort = (data, type) => {
        const compare1 = (a, b) => {
            const date1 = new Date(a.date_begin), date2 = new Date(b.date_begin);
            if (date1 > date2) return 1;
            if (date1 == date2) return 0;
            if (date1 < date2) return -1;
        }

        const compare2 = (a, b) => {
            const date1 = new Date(a.date_begin), date2 = new Date(b.date_begin);
            if (date1 < date2) return 1;
            if (date1 == date2) return 0;
            if (date1 > date2) return -1;
        }
        data.sort((type) ? compare2 : compare1);

        return data;
    };

    const gameValueSort = (data, type, prop) => {
        const compare1 = (a, b) => {
            const val1 = a[prop], val2 = b[prop];
            if (val1 > val2) return 1;
            if (val1 == val2) return 0;
            if (val1 < val2) return -1;
        }

        const compare2 = (a, b) => {
            const val1 = a[prop], val2 = b[prop];
            if (val1 < val2) return 1;
            if (val1 == val2) return 0;
            if (val1 > val2) return -1;
        }

        data.sort((type) ? compare2 : compare1);

        return data;
    };

    const countSelected = (games) => {
        let count = 0;
        for (let i = 0; i < games.length; i++) {
            if (games[i].selected) {
                count++;
            }
        }

        return count;
    }

    return (
        <div className={styles["container-moderator"]}>
            <div className={styles["container-moderator-item"]}>
                <span className= {styles["name-container"]}>Непроверенные игры</span>
            </div>
            <div className={styles["container-moderator-view-game"]}>
                <div className={styles["container-moderator-view-game-item"]}>
                    <div>
                        <button
                            onClick={(e) => {
                                setArrows({
                                    date_arrow: (!arrows.date_arrow)
                                });

                                setQueueGames({
                                    queue_games: gameDateSort(queueGames.queue_games, arrows.date_arrow)
                                });
                            }}
                        >
                            <img src={(arrows.date_arrow) ? up_arrow : down_arrow} />
                        </button>
                        <span>Дата</span>
                    </div>
                    <div>
                        <span>Название</span>
                    </div>
                    <div>
                        <Select options={selectOptions1.options}
                            placeholder="Город"
                            className={styles["container-moderator-view-game-item-select"]}
                            onChange={(e) => {
                                let data = copyQueueGames.queue_games.slice(0);
                                if (e.value !== "Все города") {
                                    data.removeIf(function (item, idx) {
                                        return (item.location !== e.value);
                                    });
                                }

                                setQueueGames({
                                    queue_games: data
                                });
                            }}
                        />
                    </div>
                    <div>
                        <span>Создатель</span>
                    </div>

                    <div>
                        <span>Статус</span>
                    </div>
                </div>
                {(queueGames.queue_games !== null) && queueGames.queue_games.map(item => (
                    <div className={styles["container-moderator-view-game-item"]}>
                        <div>
                            <span>{getFormattedDate(item.date_begin)}</span>
                        </div>
                        <div>
                            <span><Link to={{
                                pathname: routes_config.function_moderator_game_moderation,
                                state: {
                                    info_games_id: item.id,
                                    nickname: item.nickname,
                                    users_id: item.users_id
                                }
                            }}>{item.name}</Link></span>
                        </div>
                        <div>
                            <span>{item.location}</span>
                        </div>
                        <div>
                            <span><Link
                                to={{
                                    pathname: routes_config.function_moderator_creator_info,
                                    state: {
                                        users_id: item.users_id
                                    }
                                }}
                            >{item.nickname}</Link></span>
                        </div>
                        <div>
                            <span>{"-"}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className={styles["container-moderator-item"]}>
                <span className= {styles["name-container-2"]}>Проверенные игры</span>
            </div>
            <div className={styles["container-moderator-view-game"]}>
                <div className={styles["container-moderator-view-game-item"]}>
                    <div>
                        <button
                            onClick={(e) => {
                                /*setArrows({
                                    date_arrow: (!arrows.date_arrow),
                                    age_arrow: arrows.age_arrow,
                                    point_arrow: arrows.point_arrow
                                });

                                setViewGames({
                                    view_games: gameDateSort(viewGames.view_games, arrows.date_arrow)
                                });*/
                            }}
                        >
                            <img src={(arrows.date_arrow) ? up_arrow : down_arrow} />
                        </button>
                        <span>Дата</span>
                    </div>
                    <div>
                        <span>Название</span>
                    </div>
                    <div>
                        <Select options={selectOptions2.options}
                            placeholder="Город"
                            className={styles["container-moderator-view-game-item-select"]}
                            onChange={(e) => {
                                let data = checkedGames.checked_games.slice(0);
                                if (e.value !== "Все города") {
                                    data.removeIf(function (item, idx) {
                                        return (item.location !== e.value);
                                    });
                                }

                                setCheckedGames({
                                    checked_games: data
                                });
                            }}
                        />
                    </div>
                    <div>
                        <span>Создатель</span>
                    </div>

                    <div>
                        <span className="tristate tristate-checkbox">
                            <input type="radio" id="item1-state-off" name="item1" value="-1" defaultChecked
                                onClick={(e) => {
                                    setCheckedGames({
                                        checked_games: checkedGames.checked_games.slice(0)
                                    });
                                }}
                            />
                            <input type="radio" id="item1-state-null" name="item1" value="0"
                                onClick={(e) => {
                                    let data = copyCheckedGames.checked_games.slice(0);
                                    data.removeIf(function (item, idx) {
                                        return (item.accepted);
                                    });

                                    setCheckedGames({
                                        checked_games: data
                                    });
                                }}
                            />
                            <input type="radio" id="item1-state-on" name="item1" value="1"
                                onClick={(e) => {
                                    let data = copyCheckedGames.checked_games.slice(0);
                                    data.removeIf(function (item, idx) {
                                        return (!item.accepted);
                                    });

                                    setCheckedGames({
                                        checked_games: data
                                    });
                                }}
                            />
                            <i></i>
                        </span>
                        <span>Статус</span>
                    </div>
                </div>
                {(checkedGames.checked_games !== null) && checkedGames.checked_games.map(item => (
                    <div className={styles["container-moderator-view-game-item"]}>
                        <div>
                            <span>{getFormattedDate(item.date_begin)}</span>
                        </div>
                        <div>
                            <span><Link to={{
                                pathname: routes_config.function_moderator_game_moderation,
                                state: {
                                    info_games_id: item.id,
                                    nickname: item.nickname,
                                    users_id: item.users_id
                                }
                            }}>{item.name}</Link></span>
                        </div>
                        <div>
                            <span>{item.location}</span>
                        </div>
                        <div>
                            <span><Link
                                to={{
                                    pathname: routes_config.function_moderator_creator_info,
                                    state: {
                                        users_id: item.users_id
                                    }
                                }}
                            >{item.nickname}</Link></span>
                        </div>
                        <div>
                            <span
                                style={{ display: (item.accepted) ? 'grid' : 'none' }}
                            >Одобрено</span>
                            <span
                                style={{ display: ((item.bans.length === 0) && (!item.accepted)) ? 'grid' : 'none' }}
                            >{"Неодобрено(" + item.warnings.length + ")"}</span>
                            <span
                                style={{ display: (item.bans.length > 0) ? 'grid' : 'none' }}
                            >Забанено</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ModeratorPage;