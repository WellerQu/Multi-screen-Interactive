/**
 * PC客户端启动脚本
 */

import 'styles/app.less';

import io from 'socket.io-client';

export default class App {

    static run() {
        console.log('load success')

        const socket = io();
        let myid = null;

        socket.on('uuid', (uuid) => {
            myid = uuid;
            let img = new Image();
            img.src = `/qrcode?uuid=${uuid}`;
            img.addEventListener('load', () => {
                console.log(uuid);
                document.querySelector('.qrcode').appendChild(img);
            }, false);
        });

        socket.on('rotate', (vector) => {
          if (myid == vector) {

          }
        });
    }
}

App.run();
