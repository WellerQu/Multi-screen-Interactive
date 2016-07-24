/**
 * 移动客户端启动脚本
 */

import 'styles/mobile.less';

import io from 'socket.io-client';

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

                // this.emit('mobile state change', [vector]);
                
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
