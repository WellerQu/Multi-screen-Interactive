/**
 * 移动客户端启动脚本
 */

import 'styles/mobile.less';
import { throttle } from 'utils/throttle';

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
            
            let X, Y, Z, vector;

            const handler = (event) => {
                // this.emit('mobile state change', [vector]);
                X = event.beta || 0, 
                Y = event.gamma || 0,
                Z = event.alpha || 0;

                vector = { X, Y, Z };
                
                console.log(uuid, vector);
                socket.emit('mobile state change', uuid, vector);

            };

            const throttleHandler = throttle(handler, 1000, 1000);

            socket.on('connect', () => {
                socket.emit('mobile ready', uuid);

                stateDOM.classList.remove('disconnected');
                stateDOM.classList.add('connecting');
            });

            socket.on('join', () => {
                stateDOM.classList.remove('connecting');
                stateDOM.classList.add('connected');

                window.removeEventListener(DEVICEORIENTATION, throttleHandler);
                window.addEventListener(DEVICEORIENTATION, throttleHandler, false);
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
