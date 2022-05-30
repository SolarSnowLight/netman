//-------------------------------------------------------------------
// Определение страницы для просмотра игр, созданных создателем
//-------------------------------------------------------------------

import React, { useState, useCallback, useEffect } from 'react';
import { useHttp } from '../../../hooks/http.hook';
import { useMessage } from '../../../hooks/message.hook';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import { getFormattedDate } from '../../../utils/date/DateFormatter';

// Конфигурационные файлы
import default_config from '../../../config/default/default.config';
import address_config from '../../../config/address/address.config';
import storage_config from '../../../config/storage/storage.config';
import routes_config from '../../../config/routes/routes.config';

// Загрузка таблиц стилей
import styles from './ViewGamePage.module.css';
import '../../../styles/navbar.css';

// Загрузка изображений
import down_arrow from '../../../resources/images/creator_page/view_game/down_arrow.svg';
import up_arrow from '../../../resources/images/creator_page/view_game/up_arrow.svg';
import row_menu from '../../../resources/images/creator_page/view_game/row_menu.png';
import white_cross from '../../../resources/icons/white_cross.svg';
import classNames from 'classnames';

const ViewGamePage = () => {
    // Информация обо всех актуальных созданных играх создателя
    const [createdGames, setCreatedGames] = useState({
        games_created: []
    });

    // Информация, которую видит создатель
    const [viewGames, setViewGames] = useState({
        view_games: []
    });

    const [arrows, setArrows] = useState({
        date_arrow: false,
        point_arrow: false,
        age_arrow: false
    });

    const [selectOptions, setSelectOptions] = useState({
        options: [{ value: 'Все города', label: 'Все города' }]
    });

    const [counterSelected, setCounterSelected] = useState(
        0
    );

    const [isSelected, setSelected] = useState(false);

    const message = useMessage();
    const { loading, request, error, clearError } = useHttp();

    useEffect(() => {
        message(error);
        clearError();
    }, [error, message, clearError]);

    useEffect(() => {
        getCreatedGames();
    }, []);

    Array.prototype.removeIf = function (callback) {
        var i = this.length;
        while (i--) {
            if (callback(this[i], i)) {
                this.splice(i, 1);
            }
        }
    };

    const getCreatedGames = async () => {
        try {
            // UsersId и AccessToken авторизованного пользователя взяты из локального хранилища
            const usersId = (JSON.parse(localStorage.getItem(default_config.storageName))).users_id;
            const accessToken = (JSON.parse(localStorage.getItem(default_config.storageName))).access_token;

            // Формирование POST-запроса к серверу
            const data = await request(address_config.function_creator_games_created, 'POST', {
                users_id: usersId, access_token: accessToken
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

            for (let i = 0; i < data.games_created.length; i++) {
                data.games_created[i].selected = false;
            }

            await setCreatedGames({
                games_created: data.games_created.slice(0)
            });

            await setViewGames({
                view_games: data.games_created.slice(0)
            });

            let options = selectOptions.options;
            for (let i = 0; i < data.games_created.length; i++) {
                if (options.map((e) => (e.value)).indexOf(data.games_created[i].location) < 0) {
                    options.push({
                        value: data.games_created[i].location,
                        label: data.games_created[i].location
                    });
                }
            }

            setSelectOptions({
                options: options
            });

            message("Информация об актуальных созданных играх загружена!", "success");
        } catch (e) { }
    };

    const deleteGames = async (id) => {
        try {
            // UsersId и AccessToken авторизованного пользователя взяты из локального хранилища
            const usersId = (JSON.parse(localStorage.getItem(default_config.storageName))).users_id;
            const accessToken = (JSON.parse(localStorage.getItem(default_config.storageName))).access_token;

            //формирование POST-запроса к серверу
            const data = await request(address_config.function_creator_games_delete, 'POST', { 
                users_id: usersId,
                access_token: accessToken,
                info_games_id: id
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

            if (data.delete) {
                message("Информация об игре удалена из базы данных!", "dark");
            }
        } catch (e) { }
    }

    //обработка отправки новых персональных данных на сервер
    /*const dispathNewDataUserHandler = async () => {
        setSave({
            active: false
        });

        try {
            const old_email = (JSON.parse(localStorage.getItem(default_config.storageName))).users_email;
            const token = (JSON.parse(localStorage.getItem(default_config.storageName))).token;
            const data = await request(address_config.function_player_info_update, 'POST', { ...form, token, old_email });

            if (data.message) {
                message(data.message);

                const errors = data.errors;
                if (errors) {
                    errors.forEach(function (item) {
                        message(item.msg);
                    });
                }
                return;
            }

            if (data.update === true) {
                localStorage.setItem(default_config.storageName, JSON.stringify({
                    users_email: form.new_email,
                    token: (JSON.parse(localStorage.getItem(default_config.storageName))).token,
                    attributes: (JSON.parse(localStorage.getItem(default_config.storageName))).attrib,
                    modules: (JSON.parse(localStorage.getItem(default_config.storageName))).modules,
                }));
            }

            message("Данные пользователя обновлены");
        } catch (e) { }
    };*/

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
        <div className={styles["container-creator-view-game"]}>
            <div className={styles["container-creator-view-game-item"]}
                style={{ display: (isSelected) ? 'none' : 'grid' }}
            >
                <div>
                </div>
                <div>
                    <button
                        onClick={(e) => {
                            setArrows({
                                date_arrow: (!arrows.date_arrow),
                                age_arrow: arrows.age_arrow,
                                point_arrow: arrows.point_arrow
                            });

                            setViewGames({
                                view_games: gameDateSort(viewGames.view_games, arrows.date_arrow)
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
                    <Select options={selectOptions.options}
                        placeholder="Город"
                        className={styles["container-creator-view-game-item-select"]}
                        onChange={(e) => {
                            let data = createdGames.games_created.slice(0);
                            if (e.value !== "Все города") {
                                data.removeIf(function (item, idx) {
                                    return (item.location !== e.value);
                                });
                            }

                            setViewGames({
                                view_games: data
                            });
                        }}
                    />
                </div>
                <div>
                    <button
                        onClick={(e) => {
                            setArrows({
                                date_arrow: arrows.date_arrow,
                                age_arrow: arrows.age_arrow,
                                point_arrow: (!arrows.point_arrow)
                            });

                            setViewGames({
                                view_games: gameValueSort(viewGames.view_games, arrows.point_arrow, "count_points")
                            });
                    }}><img src={(arrows.point_arrow) ? up_arrow : down_arrow} /></button>
                    <span>Точки</span>
                </div>
                <div>
                    <button
                        onClick={(e) => {
                            setArrows({
                                date_arrow: arrows.date_arrow,
                                age_arrow: (!arrows.age_arrow),
                                point_arrow: arrows.point_arrow
                            });

                            setViewGames({
                                view_games: gameValueSort(viewGames.view_games, arrows.age_arrow, "age_limit")
                            });
                        }}
                    ><img src={(arrows.age_arrow) ? up_arrow : down_arrow} /></button>
                    <span>Возраст</span>
                </div>
                <div>
                    <span className="tristate tristate-checkbox">
                        <input type="radio" id="item1-state-off" name="item1" value="-1" defaultChecked
                            onClick={(e) => {
                                setViewGames({
                                    view_games: createdGames.games_created.slice(0)
                                });
                            }}
                        />
                        <input type="radio" id="item1-state-null" name="item1" value="0"
                            onClick={(e) => {
                                let data = createdGames.games_created.slice(0);
                                data.removeIf(function (item, idx) {
                                    return (item.accepted);
                                });

                                setViewGames({
                                    view_games: data
                                });
                            }}
                        />
                        <input type="radio" id="item1-state-on" name="item1" value="1"
                            onClick={(e) => {
                                let data = createdGames.games_created.slice(0);
                                data.removeIf(function (item, idx) {
                                    return (!item.accepted);
                                });

                                setViewGames({
                                    view_games: data
                                });
                            }}
                        />
                        <i></i>
                    </span>
                    <span>Статус</span>
                </div>
                <div>
                </div>
            </div>

            <div className={classNames(styles["container-creator-view-game-item"], styles["vgi-header"])}
                style={{ display: (isSelected) ? 'grid' : 'none' }}
            >
                <div>
                    <button
                        onClick={(e) => {
                            setCounterSelected(0);
                            let arr = viewGames.view_games.slice(0);
                            arr.forEach((item) => {
                                item.selected = false;
                            });

                            setViewGames({
                                view_games: arr
                            });

                            setSelected(false);
                        }}
                    >
                        <img src={white_cross} />
                    </button>
                </div>
                <div>
                    <span>Выбрано: {counterSelected}</span>
                </div>
                <div>
                    <span></span>
                </div>
                <div>
                    <span></span>
                </div>
                <div>
                    <span></span>
                </div>
                <div>
                    {/*<button>Редактировать</button>*/ }
                </div>
                <div></div>
                <div>
                    <button className={styles["btn-del"]}
                        onClick={async (e) => {
                            for (let i = 0; i < viewGames.view_games.length; i++) {
                                if (viewGames.view_games[i].selected) {
                                    await deleteGames(viewGames.view_games[i].id);
                                }
                            }

                            await getCreatedGames();    // Загрузка новых данных обо всех играх
                            setCounterSelected(0);
                            setSelected(false);
                        }}
                    >Удалить</button>
                </div>
            </div>
            {(viewGames.view_games !== null) && viewGames.view_games.map(item => (
                <div className={styles["container-creator-view-game-item"]}>
                    <div>
                        <input type="checkbox"
                            onClick={(e) => {
                                setSelected(true);
                                item.selected = (!item.selected);
                                setCounterSelected(countSelected(viewGames.view_games));
                            }}
                            checked={item.selected}
                        />
                    </div>
                    <div>
                        <span>{getFormattedDate(item.date_begin)}</span>
                    </div>
                    <div>
                        <span><Link to={{
                            pathname: routes_config.function_creator_game_view,
                            state: {
                                info_games_id: item.id
                            }
                        }}>{item.name}</Link></span>
                    </div>
                    <div>
                        <span>{item.location}</span>
                    </div>
                    <div>
                        <span>{item.count_points}</span>
                    </div>
                    <div>
                        <span>{item.age_limit + "+"}</span>
                    </div>
                    <div>
                        <span
                            style={{ display: (item.accepted)? 'grid' : 'none'}}
                        >Одобрено</span>
                        <span
                            style={{ display: ((item.bans.length === 0) && (!item.accepted)) ? 'grid' : 'none' }}
                        >{"Неодобрено(" + item.warnings.length + ")"}</span>
                        <span
                            style={{ display: (item.bans.length > 0) ? 'grid' : 'none' }}
                        >Забанено</span>
                    </div>
                    <div>
                        <button class={styles["container-creator-view-game-item-btn-menu"]}><img src={row_menu} /></button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ViewGamePage;