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
            
            let beta, gamma, alpha, vector;

            const handler = (event) => {
                // this.emit('mobile state change', [vector]);
                beta  = event.beta || 0, 
                gamma = event.gamma || 0,
                alpha = event.alpha || 0;

                vector = { beta, gamma, alpha };
                
                console.log(uuid, vector);
                socket.emit('mobile state change', uuid, vector);

            };

            const timespan = 100;
            const throttleHandler = throttle(handler, timespan, timespan);

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
