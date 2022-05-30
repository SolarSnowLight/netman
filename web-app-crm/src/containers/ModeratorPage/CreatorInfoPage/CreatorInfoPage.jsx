//-------------------------------------------------------------------
// Определение страницы для просмотра информации о конкретном создателе
//-------------------------------------------------------------------

import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useHttp } from '../../../hooks/http.hook';
import { useMessage } from '../../../hooks/message.hook';
import Select from 'react-select';
import { getFormattedDate } from '../../../utils/date/DateFormatter';

// Конфигурационные файлы
import default_config from '../../../config/default/default.config';
import address_config from '../../../config/address/address.config';
import storage_config from '../../../config/storage/storage.config';

// Загрузка таблиц стилей
//import '../../../styles/creator/view_game.css';
import ViewTableModule from '../../../styles/View.Table.module.css';
import styles from './CreatorInfoPage.module.css';

// Загрузка изображений
import down_arrow from '../../../resources/images/creator_page/view_game/down_arrow.svg';
import up_arrow from '../../../resources/images/creator_page/view_game/up_arrow.svg';
import row_menu from '../../../resources/images/creator_page/view_game/row_menu.png';
import cross from '../../../resources/images/creator_page/view_game/cross.png';
import default_profile from '../../../resources/images/main/default_image.png';
import gps from '../../../resources/icons/gps.svg';

const CreatorInfoPage = () => {
    const location = useLocation();

    // Информация обо всех актуальных созданных играх создателя
    const [createdGames, setCreatedGames] = useState({
        games_created: []
    });

    // Информация, которую видит создатель
    const [viewGames, setViewGames] = useState({
        view_games: []
    });

    // Информациия о создателе
    const [infoCreator, setInfoCreator] = useState({
        id: (-1),
        name: "",
        surname: "",
        nickname: "",
        ref_image: "",
        phone_num: "",
        date_birthday: "",
        location: "",
        date_register: "",
        users_id: "",
        modules: {
            creator: false,
            moderator: false,
            manager: false,
            admin: false
        }
    });

    const [arrows, setArrows] = useState({
        date_arrow: false,
        point_arrow: false,
        age_arrow: false
    });

    const [selectOptions, setSelectOptions] = useState({
        options: [{ value: 'Все города', label: 'Все города' }]
    });

    const message = useMessage();
    const { loading, request, error, clearError } = useHttp();

    useEffect(() => {
        message(error);
        clearError();
    }, [error, message, clearError]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        getCreatorInfo(location.state.users_id);
    }, []);

    Array.prototype.removeIf = function (callback) {
        var i = this.length;
        while (i--) {
            if (callback(this[i], i)) {
                this.splice(i, 1);
            }
        }
    };

    const getCreatorInfo = async (creator_users_id) => {
        try {
            // UsersId и AccessToken авторизованного пользователя взяты из локального хранилища
            const usersId = (JSON.parse(localStorage.getItem(default_config.storageName))).users_id;
            const accessToken = (JSON.parse(localStorage.getItem(default_config.storageName))).access_token;

            // Формирование POST-запроса к серверу
            const data = await request(address_config.function_moderator_creator_info, 'POST', { 
                users_id: usersId,
                creator_users_id: creator_users_id,
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

            for (let i = 0; i < data.info_games.length; i++) {
                data.info_games[i].selected = false;
            }

            await setCreatedGames({
                games_created: data.info_games.slice(0)
            });

            await setViewGames({
                view_games: data.info_games.slice(0)
            });

            let options = selectOptions.options;
            for (let i = 0; i < data.info_games.length; i++) {
                if (options.map((e) => (e.value)).indexOf(data.info_games[i].location) < 0) {
                    options.push({
                        value: data.info_games[i].location,
                        label: data.info_games[i].location
                    });
                }
            }

            setSelectOptions({
                options: options
            });

            setInfoCreator(data.info_creator);
            message("Информация о создателе загружена", "success");
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
        <div className={styles["container-moderator-creator-info"]}>
            <div className={styles["moderator-creator-info-block"]}>
                <div className={styles["moderator-creator-info-block-item"]}>
                    <img src={default_profile} />
                </div>
                <div className={styles["moderator-creator-info-block-item"]}>
                    <div>
                        <span className={styles["mcib-item-span-nickname"]}>{infoCreator.nickname}</span>
                    </div>
                    <div>
                        <span>{infoCreator.name + " " + infoCreator.surname}</span>
                    </div>
                    <div className={styles["moderator-creator-info-block-item-gps"]}>
                        <img src={gps} />
                        <span>{infoCreator.location}</span>
                    </div>
                    <div>
                        <span>{"Дата регистрации: " + getFormattedDate(infoCreator.date_register)}</span>
                    </div>
                </div>
                <div className={styles["moderator-creator-info-block-item-list-function"]}>
                    <div>
                        <span>{infoCreator.phone_num}</span>
                    </div>
                    <div>
                        <span>{infoCreator.email}</span>
                    </div>
                    <div>
                        <span>{"Дата рождения: " + getFormattedDate(infoCreator.date_birthday)}</span>
                    </div>
                </div>
                <div className={styles["moderator-creator-info-block-item-list-function"]}>
                    <div
                        style={{ display: (infoCreator.modules.creator)? "grid" : "none" }}
                    >
                        <span>Создатель</span>
                    </div>
                    <div
                        style={{ display: (infoCreator.modules.moderator) ? "grid" : "none" }}
                    >
                        <span>Модератор</span>
                    </div>
                    <div
                        style={{ display: (infoCreator.modules.manager) ? "grid" : "none" }}
                    >
                        <span>Менеджер</span>
                    </div>
                    <div
                        style={{ display: (infoCreator.modules.admin) ? "grid" : "none" }}
                    >
                        <span>Администратор</span>
                    </div>
                    <div
                        style={{ display: (infoCreator.modules.superadmin) ? "grid" : "none" }}
                    >
                        <span>Супер-администратор</span>
                    </div>
                </div>
            </div>
            <div className={ViewTableModule["container-moderator-creator-view-game"]}>
                <div className={ViewTableModule["container-creator-view-game-item"]}>
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
                            className={ViewTableModule["container-creator-view-game-item-select"]}
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
                {(viewGames.view_games !== null) && viewGames.view_games.map(item => (
                    <div className={ViewTableModule["container-creator-view-game-item"]}>
                        <div>
                        </div>
                        <div>
                            <span>{getFormattedDate(item.date_begin)}</span>
                        </div>
                        <div>
                            <span>{item.name}</span>
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
                                style={{ display: (item.accepted) ? 'grid' : 'none' }}
                            >Одобрено</span>
                            <span
                                style={{ display: ((item.bans.length === 0) && (!item.accepted)) ? 'grid' : 'none' }}
                            >{"Неодобрено(" + item.warnings.length + ")"}</span>
                            <span
                                style={{ display: (item.bans.length > 0) ? 'grid' : 'none' }}
                            >Забанено</span>
                        </div>
                        <div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CreatorInfoPage;