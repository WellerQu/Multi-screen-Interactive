/**
 * 客户端启动脚本
 */

import 'babel-polyfill';
import 'styles/app.less';

import io from 'socket.io-client';

export default class App {

    static run() {
        console.log('load success')

        const socket = io();
        let myid = null;

        socket.on('uuid', (uuid) => {
            myid = uuid;
        });

        socket.on('rotate', (vector) => {
          if (myid == vector) {

          }
        });
    }
}

App.run();
