import { React, useState } from 'react';
import ReactPlayer from 'react-player';
import classNames from 'classnames';
import styles from './Video.module.css'

import white_cross from '../../../resources/icons/white_cross.svg';

const Video = (props) => {
    return (
        <>
            <div className={(props.video) ? styles["container-video"] : "container-hidden"}>
                <div>
                    <img className={classNames("button-cross", styles["button-cross-right"])} src={white_cross}
                        onClick={(e) => {
                            props.setVideo(false);
                        }}
                    ></img>
                </div>
                <div>
                    <ReactPlayer url={props.urlVideo}
                        controls={true}
                    />
                </div>
            </div>
        </>
    );
}

export default Video;