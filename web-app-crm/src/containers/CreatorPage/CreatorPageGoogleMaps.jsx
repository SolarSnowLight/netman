//--------------------------------------------------------------------------
// Страница создания квестов (по-умолчанию главная страница создателя)
//--------------------------------------------------------------------------

import React, { useEffect, useCallback, useState } from "react";
import {
  Circle,
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useHttp } from "../../hooks/http.hook";
import { useMessage } from "../../hooks/message.hook";
import Select from "react-select";
import TableVideo from "./TableVideo";
import classNames from "classnames";

//конфигурационные файлы
import default_config from "../../config/default/default.config";
import address_config from "../../config/address/address.config";
import storage_config from "../../config/storage/storage.config";

//таблицы стилей
import styles from "./CreatorPage.module.css";

//загрузка изображений
import delete_image from "../../resources/icons/delete.svg";
import edit_image from "../../resources/icons/edit.svg";
import hint_image from "../../resources/icons/hint_image.svg";

// TODO: Заменить на последнее местоположени пользователя или области действия создателя (его центра)
const center = {
  // Default-центр Google Maps
  lat: 52.289588,
  lng: 104.280606,
};

const CreatorPage = () => {
  const [tableVideo, setTableVideo] = useState(false);

  // Список квестов, который показан на экране
  // в карточном виде (квесты, которые пользователь заполнил и одобрил)
  const [listQuests, setListQuests] = useState({
    quests: [],
  });

  // Загруженные свободные метки, которые можно использовать
  // для добавления квестов
  const [dataMarks, setDataMarks] = useState(null);

  // Данные о текущей метке
  const [dataCurrentMark, setDataCurrentMark] = useState({
    location: "Выберите метку на карте",
    lat: 0,
    lng: 0,
    id: 0,
  });

  // Данные с заполненной карты квеста
  const [dataQuest, setDataQuest] = useState({
    task: "",
    radius: 1,
    ref_media: "",
    hint: "",
  });

  // Состояние блока, использующийся для заполнения
  // информации о квесте
  const [blockQuest, setBlockQuest] = useState({
    display: "none",
  });

  // Состояние блока, использующийся для редактирования
  // квеста
  const [blockEditQuest, setBlockEditQuest] = useState({
    display: "none",
  });

  // Информация об игре
  const [dataGameInfo, setDataGameInfo] = useState({
    location: "",
    date_begin: "",
    date_end: "",
    type: false,
    rating: 0,
    count_commands: 0,
    min_score: 0,
    age_limit: 0,
    name: "",
  });

  //проверка API KEY для работы Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: default_config.googleMapsApiKey,
  });

  // Данные для выпадающего списка
  const options = [
    { value: "Иркутск", label: "Иркутск" },
    { value: "Ангарск", label: "Ангарск" },
    { value: "Черемхово", label: "Черемхово" },
  ];

  const optionsAge = [
    { value: "0", label: "0+" },
    { value: "6", label: "6+" },
    { value: "12", label: "12+" },
    { value: "16", label: "16+" },
    { value: "18", label: "18+" },
  ];

  const gameInfoChangeHandler = (event) => {
    setDataGameInfo({
      ...dataGameInfo,
      [event.target.name]: event.target.value,
    });
  };

  const message = useMessage();
  const { loading, request, error, clearError } = useHttp();

  useEffect(() => {
    message(error, "error");
    clearError();
  }, [error, message, clearError]);

  const addNewGame = async () => {
    try {
      // UsersId и AccessToken авторизованного пользователя взяты из локального хранилища
      const usersId = JSON.parse(
        localStorage.getItem(default_config.storageName)
      ).users_id;
      const accessToken = JSON.parse(
        localStorage.getItem(default_config.storageName)
      ).access_token;

      const data = await request(
        address_config.function_creator_games_add,
        "POST",
        {
          ...dataGameInfo,
          quests: listQuests.quests,
          users_id: usersId,
          access_token: accessToken,
        }
      );

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

      message("Новая игра добавлена!", "success");
    } catch (e) {}
  };

  const getFreeMarks = async () => {
    //чтение свободных меток для создания квестов
    try {
      // UsersId и AccessToken авторизованного пользователя взяты из локального хранилища
      const usersId = JSON.parse(
        localStorage.getItem(default_config.storageName)
      ).users_id;
      const accessToken = JSON.parse(
        localStorage.getItem(default_config.storageName)
      ).access_token;

      //получение свободных меток для создания квестов
      const values = await request(address_config.map_marks_free, "POST", {
        users_id: usersId,
        access_token: accessToken,
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

      //добавление дополнительных свойств каждой полученной метке
      values.data.forEach((item) => {
        item.radius_quest = 1;
      });

      //обновление базы меток
      await setDataMarks(values.data);
      message("Свободные метки были загружены!", "success");
    } catch (e) {}
  };

  //идентификация маркера, на который было произведено нажатие (клик)
  const getMarkerState = (dataMarks, obj) => {
    if (!dataMarks || !obj) return null;

    for (let i = 0; i < dataMarks.length; i++) {
      if (dataMarks[i].lat == obj.lat && dataMarks[i].lng == obj.lng) {
        return dataMarks[i];
      }
    }

    return null;
  };

  const getMarkerIndex = (dataMarks, obj) => {
    if (!dataMarks || !obj) return null;

    for (let i = 0; i < dataMarks.length; i++) {
      if (dataMarks[i].lat == obj.lat && dataMarks[i].lng == obj.lng) {
        return i;
      }
    }

    return null;
  };

  const resetQuestBlock = () => {
    setBlockEditQuest({
      display: "none",
    });

    setBlockQuest({
      display: "none",
    });

    setDataCurrentMark({
      location: "Местоположение",
      lat: 0,
      lng: 0,
    });

    setDataQuest({
      task: "",
      radius: 1,
      ref_media: "",
      hint: "",
    });
  };

  // Обработка события нажатия на маркер
  const clickMarkerHandler = async (e) => {
    window.scrollTo({ top: 0, behavior: "smooth" }); // возвращение к началу страницы
    await setBlockEditQuest({
      display: "none",
    });

    // Открытие блока для добавления квеста
    await setBlockQuest({
      display: "grid",
    });

    await setDataQuest({
      task: "",
      radius: 1,
      ref_media: "",
      hint: "",
    });

    let marker = getMarkerState(dataMarks, {
      lat: parseFloat(e.latLng.lat()),
      lng: parseFloat(e.latLng.lng()),
    });

    if (!marker) {
      return;
    }

    let index = findQuestByLatLng(marker.lat, marker.lng);
    if (index >= 0) {
      // Считывание данных о квесте, который будет редактируем
      await setDataQuest({
        task: listQuests.quests[index].task,
        radius: listQuests.quests[index].radius,
        ref_media: listQuests.quests[index].ref_media,
        hint: listQuests.quests[index].hint,
      });

      await setBlockEditQuest({
        display: "grid",
      });
    }

    await setDataCurrentMark({
      location: marker.location,
      lng: marker.lng,
      lat: marker.lat,
      id: marker.id,
    });

    message("Метка выбрана", "success");
  };

  // Получение данных после преобразования координат {lat; lng} в адрес в виде строки
  /*const onGoogleLocationHandler = async (e) => {
        // Альтернативная версия загрузки геолокации:
        await Geocoder.from(parseFloat(dataTask.lat), parseFloat(dataTask.lng))
            .then(json => {
                dataTask.location = json.results[0].formatted_address;
                let marker = getMarkerState(dataMarks, { lat: parseFloat(dataTask.lat), lng: parseFloat(dataTask.lng) });
                if (marker) {
                    marker.location = dataTask.location;
                }

                dataTask.location = marker.location;

                message("Геолокация обнаружена");
            }).catch(error => {
                console.warn(error);
            });

        try {
            const token = (JSON.parse(localStorage.getItem(default_config.storageName))).token;
            const data = await request(address_config.map_geocoder_address, 'POST', { lat: dataTask.lat, lng: dataTask.lng, token: token });

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

            dataTask.location = data.address;
            let marker = getMarkerState(dataMarks, { lat: parseFloat(dataTask.lat), lng: parseFloat(dataTask.lng) });
            if (marker) {
                marker.location = dataTask.location;
            }

            message("Геолокация обнаружена");
        } catch (e) { }

        changeHandler(e);
    };*/

  const findQuestById = (id) => {
    let index = -1;
    for (let i = 0; i < listQuests.quests.length; i++) {
      if (listQuests.quests[i].id == id) {
        index = i;
        break;
      }
    }

    return index;
  };

  const findQuestByLatLng = (lat, lng) => {
    let index = -1;
    for (let i = 0; i < listQuests.quests.length; i++) {
      if (listQuests.quests[i].lat == lat && listQuests.quests[i].lng == lng) {
        index = i;
        break;
      }
    }

    return index;
  };

  const renderPage = () => {
    return (
      <>
        {/* Таблица с видео материалами */}
        <TableVideo
          dataQuest={dataQuest}
          setDataQuest={setDataQuest}
          tableVideo={tableVideo}
          setTableVideo={setTableVideo}
        />

        {/* Основное содержимое страницы создателя */}

        <div
          className={
            tableVideo
              ? classNames(styles["container-creator-page"], "container-blur")
              : styles["container-creator-page"]
          }
        >
          <div className={styles["creator-header"]}>
            Основная инофрмация об игре
          </div>
          <div className={styles["creator-page-item"]}>
            {/*Главна информация*/}
            <div className={styles["creator-page-item-2"]}>
              <div className={styles["creator-page-item-3"]}>
                <div className={styles["creator-page-item-3-element"]}>
                  <span className={styles["creator-page-name-main-fields"]}>
                    Название игры
                  </span>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={dataGameInfo.name}
                    onChange={gameInfoChangeHandler}
                  />
                </div>
                <div className={styles["creator-page-item-3-element"]}>
                  <span className={styles["creator-page-name-main-fields"]}>
                    Город
                  </span>
                  <div className="select">
                    <Select
                      options={options}
                      id="location"
                      name="location"
                      placeholder="Выбор города"
                      className="select"
                      onChange={(e) => {
                        setDataGameInfo({
                          location: e.value,
                          date_begin: dataGameInfo.date_begin,
                          date_end: dataGameInfo.date_end,
                          type: dataGameInfo.type,
                          rating: dataGameInfo.rating,
                          count_commands: dataGameInfo.count_commands,
                          min_score: dataGameInfo.min_score,
                          age_limit: dataGameInfo.age_limit,
                          name: dataGameInfo.name,
                        });
                      }}
                    />
                  </div>
                </div>
                <div className={styles["creator-page-item-3-element"]}>
                  <span className={styles["creator-page-name-main-fields"]}>
                    {" "}
                    Ограничения
                  </span>
                  <div>
                    <Select
                      options={optionsAge}
                      placeholder="Возраст"
                      className="select"
                      onChange={(e) => {
                        setDataGameInfo({
                          location: dataGameInfo.location,
                          date_begin: dataGameInfo.date_begin,
                          date_end: dataGameInfo.date_end,
                          type: dataGameInfo.type,
                          rating: dataGameInfo.rating,
                          count_commands: dataGameInfo.count_commands,
                          min_score: dataGameInfo.min_score,
                          age_limit: e.value,
                          name: dataGameInfo.name,
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className={styles["creator-page-item-3"]}>
                <div className={styles["creator-page-item-3-element"]}>
                  <span className={styles["creator-page-name-main-fields"]}>
                    Дата начала
                  </span>
                  <div>
                    <input
                      id="date_begin"
                      name="date_begin"
                      type="datetime-local"
                      onChange={gameInfoChangeHandler}
                    />
                  </div>
                </div>
                <div className={styles["creator-page-item-3-element"]}>
                  <span className={styles["creator-page-name-main-fields"]}>
                    Дата завершения
                  </span>
                  <div>
                    <input
                      id="date_end"
                      name="date_end"
                      type="datetime-local"
                      onChange={gameInfoChangeHandler}
                    />
                  </div>
                </div>
                <div className={styles["creator-page-item-3-element"]}>
                  <span className={styles["creator-page-name-main-fields"]}>
                    Рейтинг
                  </span>
                  <div>
                    <input
                      type="text"
                      id="rating"
                      name="rating"
                      onChange={gameInfoChangeHandler}
                    />
                  </div>
                </div>
              </div>

              <div className={styles["creator-page-item-3"]}>
                <div className={styles["creator-page-item-3-element"]}>
                  <span className={styles["creator-page-name-main-fields"]}>
                    Число команд
                  </span>
                  <div>
                    <input
                      type="text"
                      id="count_commands"
                      name="count_commands"
                      onChange={gameInfoChangeHandler}
                    />
                  </div>
                </div>
                <div className={styles["creator-page-item-3-element"]}>
                  <span className={styles["creator-page-name-main-fields"]}>
                    Мин. число очков
                  </span>
                  <div>
                    <input
                      type="text"
                      id="min_score"
                      name="min_score"
                      onChange={gameInfoChangeHandler}
                    />
                  </div>
                </div>
                <div className={styles["creator-page-item-3-element"]}>
                  <span className={styles["creator-page-name-main-fields"]}>
                    Технология дополненной реальности
                  </span>
                  <div>
                    <input
                      type="checkbox"
                      id="arcore"
                      name="arcore"
                      onChange={(e) => {
                        setDataGameInfo({
                          location: dataGameInfo.location,
                          date_begin: dataGameInfo.date_begin,
                          date_end: dataGameInfo.date_end,
                          type: !dataGameInfo.type,
                          rating: dataGameInfo.rating,
                          count_commands: dataGameInfo.count_commands,
                          min_score: dataGameInfo.min_score,
                          age_limit: dataGameInfo.age_limit,
                          name: dataGameInfo.name,
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles["creator-header"]}>Создание меток</div>
          <div className={styles["creator-page-item"]}>
            <div className={styles["creator-page-item-1"]}>
              <GoogleMap
                mapContainerClassName={styles["creator-page-item-1-gm"]}
                center={center}
                zoom={16}
                options={{
                  fullscreenControl: false,
                  draggableCursor: "default",
                  draggingCursor: "default",
                  disableDoubleClickZoom: true,
                }}
                onDblClick={(e) => {
                  resetQuestBlock();
                }}
                onLoad={getFreeMarks}
              >
                {
                  //Добавление свободных меток на карту создателя
                }

                {dataMarks !== null &&
                  dataMarks.map((item) => (
                    <Marker
                      position={{
                        lat: item.lat,
                        lng: item.lng,
                      }}
                      onClick={clickMarkerHandler}
                    >
                      {
                        //Определение радиуса действия задания и радиуса квеста, который будет
                        //отрисован при близком приближении к цели квеста
                      }

                      <Circle
                        center={{
                          lat: item.lat,
                          lng: item.lng,
                        }}
                        radius={
                          item.lat === dataCurrentMark.lat &&
                          item.lng === dataCurrentMark.lng
                            ? 0
                            : 50
                        }
                        options={{
                          strokeColor:
                            findQuestByLatLng(item.lat, item.lng) >= 0
                              ? "grey"
                              : "blue",
                          fillColor:
                            findQuestByLatLng(item.lat, item.lng) >= 0
                              ? "grey"
                              : "blue",
                        }}
                      ></Circle>

                      <Circle
                        center={{
                          lat: item.lat,
                          lng: item.lng,
                        }}
                        radius={1}
                        options={{
                          strokeColor: "green",
                          fillColor: "green",
                        }}
                      ></Circle>
                    </Marker>
                  ))}

                {dataCurrentMark.lat !== 0 && dataCurrentMark.lng !== 0 && (
                  <Circle
                    center={{
                      lat: dataCurrentMark.lat,
                      lng: dataCurrentMark.lng,
                    }}
                    radius={50}
                    options={{
                      strokeColor: "red",
                      fillColor: "white",
                    }}
                  ></Circle>
                )}

                {dataCurrentMark.lat !== 0 &&
                  dataCurrentMark.lng !== 0 &&
                  dataQuest && (
                    <Circle
                      center={{
                        lat: dataCurrentMark.lat,
                        lng: dataCurrentMark.lng,
                      }}
                      radius={dataQuest.radius}
                      options={{
                        strokeColor: "green",
                        fillColor: "green",
                      }}
                    ></Circle>
                  )}
              </GoogleMap>
            </div>
            <div className={styles["creator-page-create-fields"]}>
              {/* Блок для заполнения информации о каждом отдельном квесте */}
              <div className={styles["item-1-quest-block"]}>
                <span className={styles["creator-page-name-main-fields"]}>
                  Местоположение
                </span>
                <input type="text" value={dataCurrentMark.location} />
              </div>
              <div className={styles["item-1-quest-block"]}>
                <span className={styles["creator-page-name-main-fields"]}>
                  Медиафайл
                </span>
                <input
                  type="text"
                  placeholder="Нажмите для выбора медиафайла"
                  id="ref_media"
                  name="ref_media"
                  value={dataQuest.ref_media}
                  readOnly
                  onClick={(e) => {
                    setTableVideo(true);
                  }}
                  onChange={(e) => {
                    setDataQuest({
                      task: dataQuest.task,
                      radius: dataQuest.radius,
                      ref_media: e.target.value,
                      hint: dataQuest.hint,
                    });
                  }}
                />
              </div>
              <div className={styles["item-1-quest-block"]}>
                <span className={styles["creator-page-name-main-fields"]}>
                  Подсказка
                </span>
                <input
                  type="text"
                  placeholder="Подсказка для нахождения квеста"
                  id="hint"
                  name="hint"
                  value={dataQuest.hint}
                  onChange={(e) => {
                    setDataQuest({
                      task: dataQuest.task,
                      radius: dataQuest.radius,
                      ref_media: dataQuest.ref_media,
                      hint: e.target.value,
                    });
                  }}
                />
              </div>
              <div className={styles["item-1-quest-block"]}>
                <span className={styles["creator-page-name-main-fields"]}>
                  Задание
                </span>
                <textarea
                  className={styles["white-bottom-border-create-mark-task"]}
                  placeholder="Задание"
                  id="task"
                  name="task"
                  value={dataQuest.task}
                  onChange={(e) => {
                    setDataQuest({
                      task: e.target.value,
                      radius: dataQuest.radius,
                      ref_media: dataQuest.ref_media,
                      hint: dataQuest.hint,
                    });
                  }}
                />
              </div>
              <div className={styles["item-1-quest-block"]}>
                <output>{dataQuest.radius}</output>
                <input
                  type="range"
                  id="radius"
                  name="radius"
                  min="1"
                  max="50"
                  defaultValue="1"
                  value={dataQuest.radius}
                  onChange={(e) => {
                    setDataQuest({
                      task: dataQuest.task,
                      radius: parseInt(e.target.value),
                      ref_media: dataQuest.ref_media,
                      hint: dataQuest.hint,
                    });
                  }}
                />
              </div>
              <div className={styles["creator-page-item-1-buttons-block"]}>
                <button
                  className="button-gray"
                  onClick={() => {
                    resetQuestBlock();
                  }}
                >
                  Очистить
                </button>
                <button
                  className="button-green"
                  style={{
                    display:
                      blockEditQuest.display === "none" ? "grid" : "none",
                  }}
                  onClick={(e) => {
                    let marker = getMarkerState(dataMarks, {
                      lat: parseFloat(dataCurrentMark.lat),
                      lng: parseFloat(dataCurrentMark.lng),
                    });

                    if (!marker) {
                      message("Необходимо выбрать маркер на карте!", "error");
                      return;
                    }

                    let quests = listQuests.quests;
                    if (findQuestByLatLng(marker.lat, marker.lng) >= 0) {
                      message("Данная метка уже добавлена!", "warning");
                      return;
                    }

                    /* Валидация входных данных для добавления квеста */
                    if (
                      dataQuest.task.length === 0 ||
                      dataQuest.ref_media.length === 0
                    ) {
                      message("Необходимо заполнить данные квеста!", "error");
                      return;
                    }

                    quests.push({
                      id:
                        listQuests.quests.length > 0
                          ? quests[quests.length - 1].id + 1
                          : 1,
                      location: marker.location,
                      lat: marker.lat,
                      lng: marker.lng,
                      task: dataQuest.task,
                      ref_media: dataQuest.ref_media,
                      radius: dataQuest.radius,
                      hint: dataQuest.hint,
                      marks_id: marker.id,
                    });

                    setListQuests({
                      quests: quests,
                    });

                    message("Квест добавлен в список!", "success");
                    resetQuestBlock();
                  }}
                >
                  Добавить
                </button>
                <button
                  className="button-green"
                  style={{ display: blockEditQuest.display }}
                  onClick={(e) => {
                    let marker = getMarkerState(dataMarks, {
                      lat: parseFloat(dataCurrentMark.lat),
                      lng: parseFloat(dataCurrentMark.lng),
                    });

                    if (!marker) {
                      return;
                    }

                    let quests = listQuests.quests;
                    let index = findQuestByLatLng(marker.lat, marker.lng);
                    if (index < 0) {
                      message("Данного квеста нет в списке!", "error");
                      return;
                    }

                    /* Валидация входных данных для добавления квеста */
                    if (
                      dataQuest.task.length === 0 ||
                      dataQuest.ref_media.length === 0
                    ) {
                      message("Необходимо заполнить данные квеста!", "error");
                      return;
                    }

                    quests[index].task = dataQuest.task;
                    quests[index].ref_media = dataQuest.ref_media;
                    quests[index].radius = dataQuest.radius;
                    quests[index].hint = dataQuest.hint;

                    setListQuests({
                      quests: quests,
                    });

                    message("Квест успешно редактирован!", "success");
                    resetQuestBlock();
                  }}
                >
                  Редактировать
                </button>
              </div>
            </div>
          </div>
          <div className={styles["creator-header"]}>
            Созданные метки
          </div>
          {
            // Информация об игре, которая будет создана
          }
          <div className={styles["creator-page-item"]}>
            {listQuests.quests !== null &&
              listQuests.quests.map((item) => (
                <div className={styles["creator-page-item-1-quest-created"]}>
                  {/* Блок для заполнения информации о каждом отдельном квесте */}
                  <input
                    type="text-card"
                    value={item.location}
                    readOnly
                  />
                  <input
                    type="text-card"
                    value={item.ref_media}
                    readOnly
                  />
                  <div className={styles["item-1-quest-block"]}>
                    <img src={hint_image} alt="Подсказка" />
                    <input
                      type="text-card"
                      value={item.hint}
                      readOnly
                    />
                  </div>
                  <textarea type="textarea-card" value={item.task} />
                  <output>{item.radius}</output>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    defaultValue="1"
                    value={item.radius}
                  />
                  <div className={styles["creator-page-item-1-buttons-block"]}>
                  <button
                    className="button-gray"
                    onClick={(e) => {
                      let marker = getMarkerState(dataMarks, {
                        lat: parseFloat(item.lat),
                        lng: parseFloat(item.lng),
                      });

                      if (!marker) {
                        return;
                      }

                      let quests = listQuests.quests;
                      let index = findQuestByLatLng(marker.lat, marker.lng);
                      if (index < 0) {
                        message("Данной метки нет в списке!", "error");
                        return;
                      }

                      quests.splice(index, 1);
                      setListQuests({
                        quests: quests,
                      });

                      message("Квест удалён из списка!", "dark");

                      resetQuestBlock();
                    }}
                  >
                    Удалить
                  </button>
                  <button
                    className="button-green"
                    onClick={(e) => {
                      let marker = getMarkerState(dataMarks, {
                        lat: parseFloat(item.lat),
                        lng: parseFloat(item.lng),
                      });

                      if (!marker) {
                        return;
                      }

                      let quests = listQuests.quests;
                      let index = findQuestByLatLng(marker.lat, marker.lng);
                      if (index < 0) {
                        message("Данного квеста нет в списке!", "error");
                        return;
                      }

                      window.scrollTo({ top: 0, behavior: "smooth" }); // возвращение к началу страницы
                      setBlockEditQuest({
                        display: "grid",
                      });

                      // Открытие блока для добавления квеста
                      setBlockQuest({
                        display: "grid",
                      });

                      setDataQuest({
                        task: quests[index].task,
                        ref_media: quests[index].ref_media,
                        radius: quests[index].radius,
                        hint: quests[index].hint,
                      });

                      setDataCurrentMark({
                        location: quests[index].location,
                        lat: quests[index].lat,
                        lng: quests[index].lng,
                      });

                      message("Редактирование квеста", "info");
                    }}
                  >
                    Редактировать
                  </button>
                  </div>

                </div>
              ))}
          </div>
          <div className={styles["creator-page-item"]}>
            <button
              className="button-green"
              onClick={async (e) => {
                if (dataGameInfo.name.length === 0) {
                  message("Необходимо добавить название игры!", "error");
                  return;
                }

                try {
                  if (
                    new Date(dataGameInfo.date_begin) >
                    new Date(dataGameInfo.date_end)
                  ) {
                    message(
                      "Дата начала игры не может быть позднее даты её завершения!",
                      "error"
                    );
                    return;
                  } else if (
                    dataGameInfo.date_begin === "" ||
                    dataGameInfo.date_end === ""
                  ) {
                    message(
                      "Необходимо указать дату начала и завершения игры!",
                      "error"
                    );
                    return;
                  }
                } catch (e) {
                  message("Неверный формат даты!", "error");
                  return;
                }

                if (dataGameInfo.count_commands < 5) {
                  message(
                    "Максимальное число команд не может быть меньше 5!",
                    "error"
                  );
                  return;
                }

                if (dataGameInfo.location.length < 3) {
                  message(
                    "Название города должно содержать не менее трёх символов!",
                    "error"
                  );
                  return;
                }

                if (dataGameInfo.rating < 10) {
                  message(
                    "Получаемый рейтинг не может быть меньше 10",
                    "error"
                  );
                  return;
                }

                if (dataGameInfo.min_score < 10) {
                  message(
                    "Минимальное число очков для прохождения игры не может быт меньше 10",
                    "error"
                  );
                  return;
                }

                if (listQuests.quests.length == 0) {
                  message(
                    "Необходимо добавить квесты для создания игры!",
                    "error"
                  );
                  return;
                }

                await addNewGame();
                resetQuestBlock();
                await getFreeMarks();
                setListQuests({
                  quests: [],
                });
              }}
            >
              Создать игру
            </button>
          </div>
        </div>
      </>
    );
  };

  if (loadError) {
    //обработка ошибки в случае, когда карта не загрузилась
    return;
  }

  return isLoaded ? renderPage() : <></>;
};

export default CreatorPage;
