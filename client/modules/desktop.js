/**
 * PC客户端启动脚本
 */

import 'styles/desktop.less';

import uuid from 'node-uuid';
import io from 'socket.io-client';

export default class App {

    static run() {
        console.log('load success')

        const socket = io();
        let myid = uuid();;
        let img = new Image();

        let qrcodeDOM = document.querySelector('.qrcode');

        while(qrcodeDOM.lastChild) {
            qrcodeDOM.removeChild(qrcodeDOM.lastChild);
        }

        img.src = `/qrcode?uuid=${myid}`;
        img.addEventListener('load', () => {
            qrcodeDOM.appendChild(img);
        }, false);

        socket.on('connect', () => {
            socket.emit('desktop ready', myid);
        });

        socket.on('state change', (vector) => {
            console.log(vector);
        });

        /*
        socket.on('reconnect', () => {
            socket.emit('desktop ready', myid);
        });
        //*/
    }
}

App.run();
