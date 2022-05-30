//-------------------------------------------------------------------
// Определение страницы для просмотра списка создателей
//-------------------------------------------------------------------

import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useHttp } from '../../../hooks/http.hook';
import { useMessage } from '../../../hooks/message.hook';
import Select from 'react-select';

// Конфигурационные файлы
import default_config from '../../../config/default/default.config';
import address_config from '../../../config/address/address.config';
import routes_config from '../../../config/routes/routes.config';
import storage_config from '../../../config/storage/storage.config';

// Загрузка таблиц стилей
import styles from './CreatorListPage.module.css';

// Загрузка изображений
import down_arrow from '../../../resources/images/creator_page/view_game/down_arrow.svg';
import up_arrow from '../../../resources/images/creator_page/view_game/up_arrow.svg';
import row_menu from '../../../resources/images/creator_page/view_game/row_menu.png';
import cross from '../../../resources/images/creator_page/view_game/cross.png';
import default_profile from '../../../resources/images/main/default_image.png';

const CreatorListPage = () => {
    // Информация обо всех действующих создателях
    const [creatorsList, setCreatorsList] = useState({
        creators: []
    });

    // Та информация о создателях, которую видит отдельный пользователь
    const [copyCreatorsList, setCopyCreatorsList] = useState({
        creators: []
    });

    const [ageArrow, setAgeArrow] = useState({
        orientation: false
    });

    const [gamesArrow, setGamesArrow] = useState({
        orientation: false
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
        getCreatorsList();
    }, []);

    Array.prototype.removeIf = function (callback) {
        var i = this.length;
        while (i--) {
            if (callback(this[i], i)) {
                this.splice(i, 1);
            }
        }
    };

    const getCreatorsList = async () => {
        try {
            // UsersId и AccessToken авторизованного пользователя взяты из локального хранилища
            const usersId = (JSON.parse(localStorage.getItem(default_config.storageName))).users_id;
            const accessToken = (JSON.parse(localStorage.getItem(default_config.storageName))).access_token;

            //формирование POST-запроса к серверу
            const data = await request(address_config.function_moderator_creators_list, 'POST', {
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

            await setCreatorsList({
                creators: data.creators.slice(0)
            });

            await setCopyCreatorsList({
                creators: data.creators.slice(0)
            });

            let options = selectOptions.options;
            for (let i = 0; i < data.creators.length; i++) {
                if (options.map((e) => (e.value)).indexOf(data.creators[i].location) < 0) {
                    options.push({
                        value: data.creators[i].location,
                        label: data.creators[i].location
                    });
                }
            }

            setSelectOptions({
                options: options
            });

            message("Список создателей загружен!", "success");
        } catch (e) { }
    };

    const creatorValueSort = (data, type, prop) => {
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

    return (
        <div className={styles["container-creator-list-view-game"]}>
            <div className={styles["container-creator-list-view-game-item"]}>
                <div></div>
                <div>
                    <span>Никнейм</span>
                </div>
                <div>
                    <span>Имя Фамилия</span>
                </div>
                <div>
                    <Select options={selectOptions.options}
                        placeholder="Город"
                        className={styles["container-creator-list-view-game-item-select"]}
                        onChange={async (e) => {
                            let data = creatorsList.creators.slice(0);
                            if (e.value !== "Все города") {
                                data.removeIf(function (item, idx) {
                                    return (item.location !== e.value);
                                });
                            }

                            await setCopyCreatorsList({
                                creators: data
                            });
                        }}
                    />
                </div>
                <div>
                    <button
                        onClick={async (e) => {
                            await setGamesArrow({
                                orientation: !gamesArrow.orientation
                            });

                            await setCopyCreatorsList({
                                creators: creatorValueSort(copyCreatorsList.creators, gamesArrow.orientation, "count_games")
                            });
                        }}><img src={(gamesArrow.orientation) ? up_arrow : down_arrow} /></button>
                    <span>Количество игр</span>
                </div>
                <div>
                    <button
                        onClick={async (e) => {
                            await setAgeArrow({
                                orientation: !ageArrow.orientation
                            });

                            await setCopyCreatorsList({
                                creators: creatorValueSort(copyCreatorsList.creators, ageArrow.orientation, "age")
                            });
                        }}
                    ><img src={(ageArrow.orientation) ? up_arrow : down_arrow} /></button>
                    <span>Возраст</span>
                </div>
            </div>
            {(copyCreatorsList.creators !== null) && copyCreatorsList.creators.map(item => (
                <div className={styles["container-creator-list-view-game-item"]}>
                    <div>
                        <img src={default_profile} />
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
                        <span>{item.name + " " + item.surname}</span>
                    </div>
                    <div>
                        <span>{item.location}</span>
                    </div>
                    <div>
                        <span>{item.count_games}</span>
                    </div>
                    <div>
                        <span>{item.age}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default CreatorListPage;