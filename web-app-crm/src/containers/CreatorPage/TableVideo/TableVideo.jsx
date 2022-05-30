import { React, useState, useEffect } from 'react';
import Video from '../Video/Video';
import ReactPlayer from 'react-player';
import { useMessage } from '../../../hooks/message.hook';
import { useHttp } from '../../../hooks/http.hook';
import { getFormattedDate } from '../../../utils/date/DateFormatter';

import default_config from '../../../config/default/default.config';
import address_config from '../../../config/address/address.config';
import styles from './TableVideo.module.css';

import white_cross from '../../../resources/icons/white_cross.svg';

const TableVideo = (props) => {
    const [video, setVideo] = useState(false);
    const [urlVideo, setUrlVideo] = useState(null);
    const [statsVideo, setStatsVideo] = useState(null);
    const { loading, request, error, clearError } = useHttp();
    const message = useMessage();

    const getStatsVideo = async () => {
        try {
            // UsersId и AccessToken авторизованного пользователя взяты из локального хранилища
            const usersId = (JSON.parse(localStorage.getItem(default_config.storageName))).users_id;
            const accessToken = (JSON.parse(localStorage.getItem(default_config.storageName))).access_token;

            const data = await request((default_config.ngrok_serverMediaAddress + address_config.get_stats_instructions), 'POST', {
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

            setStatsVideo(data);

            message("Все видеоинструкции загружены!", "success");
        } catch (e) { }
    }

    useEffect(async () => {
        await getStatsVideo();
    }, []);

    useEffect(() => {
        message(error, "error");
        clearError();
    }, [error, message, clearError]);

    return (
        <>
            <Video urlVideo={urlVideo} video={video} setVideo={setVideo} />
            <div className={((props.tableVideo) && (!video)) ? styles["container-video-table"] : "container-hidden"}>
                <div className={styles["container-video-table-header"]}>
                    <span className={styles["cvth-item-1"]}>Медиа</span>
                    <img className={styles["button-cross"]} src={white_cross}
                        onClick={(e) => {
                            props.setTableVideo(false);
                        }}
                    ></img>
                </div>
                <div className={styles["cvt-table"]}>
                    <div className={styles["cvt-table-header"]}>
                        <span className={styles["cvt-table-item"]}>Дата создания</span>
                        <span className={styles["cvt-table-item"]}>Название</span>
                        <span className={styles["cvt-table-item"]}>Размер</span>
                        <div className={styles["cvt-table-item"]}></div>
                    </div>
                    <div className={styles["cvt-table-content"]}>
                        {
                            (statsVideo && statsVideo.stats) ?
                                statsVideo.stats.map(item => {
                                    return (
                                        <div
                                            key={item.name_file}
                                            className={styles["cvt-table-content-row"]}
                                        >
                                            <ReactPlayer
                                                className={styles["cvttcri-img-video"]}
                                                //url="https://67dc-195-206-47-120.ngrok.io/media/download/1212"
                                                url={(default_config.ngrok_serverMediaAddress + address_config.instructions_download + item.name_file)}
                                                controls={false}
                                                onClick={(e) => {
                                                    setUrlVideo((default_config.ngrok_serverMediaAddress + address_config.instructions_download + item.name_file));
                                                    setVideo(true);
                                                }}
                                            />
                                            <span className={styles["cvt-table-content-row-item"]}>{getFormattedDate(item.date_created)}</span>
                                            <span className={styles["cvt-table-content-row-item"]}>{item.name_file}</span>
                                            <span className={styles["cvt-table-content-row-item"]}>{item.size_mb + ' МБ'}</span>
                                            <div className={styles["cvt-table-content-row-item"]}>
                                                <button className="button-green"
                                                    onClick={(e) => {
                                                        props.setTableVideo(false);
                                                        props.setDataQuest({
                                                            task: props.dataQuest.task,
                                                            radius: props.dataQuest.radius,
                                                            ref_media: item.local_path,
                                                            hint: props.dataQuest.hint
                                                        });
                                                    }}
                                                >Добавить</button>
                                            </div>
                                        </div>);
                                })
                                :
                                <></>
                        }
                    </div>
                </div>
            </div>
        </>
    );
}

export default TableVideo;