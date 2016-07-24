/**
 * 移动客户端启动脚本
 */

import 'styles/mobile.less';

import io from 'socket.io-client';

const DEVICEORIENTATION = 'deviceorientation';

export default class Mobile {

    static run() {
        let regexp = /uuid=(.+)$/i, 
            uuid = '', 
            socket = null;

        let stateDOM = document.querySelector('.state');

        if (regexp.test(window.location.href)) {
            uuid = RegExp.$1;
            socket = io();

            socket.on('connect', () => {
                socket.emit('mobile ready', uuid);

                stateDOM.classList.remove('disconnected');
                stateDOM.classList.add('connecting');
            });

            socket.on('join', () => {
                stateDOM.classList.remove('connecting');
                stateDOM.classList.add('connected');

                window.removeEventListener(DEVICEORIENTATION);
                window.addEventListener(DEVICEORIENTATION, (event) => {
                    // this.emit('mobile state change', [vector]);
                    let X = event.beta, 
                        Y = event.gamma,
                        Z = event.alpha;

                    let vector = { X, Y, Z };

                    socket.emit('mobile state change', uuid, vector);
                }, false);
            });

            /*
            socket.on('reconnect', () => {
                socket.emit('mobile ready', uuid);               
            });
            //*/
        }
    }
}

Mobile.run();
