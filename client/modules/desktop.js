/**
 * PC客户端启动脚本
 */

import 'styles/desktop.less';

import uuid from 'node-uuid';
import io from 'socket.io-client';

import { getQuaternion } from 'utils/quaternion';

export default class App {

    static run() {
        console.log('load success')

        const socket = io();
        // let myid = '895244ca-4820-47df-bed2-09176d892c1c'; //uuid();;
        let myid = uuid();
        let img = new Image();

        let qrcodeDOM = document.querySelector('.qrcode');
        let boxDOM = document.querySelector('.box');

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

        socket.on('state change', ({alpha, beta, gamma}) => {
            /**
             * 四元数:
             * 高阶复数: q = [w, x, y, z];
             * 四元数的基本数学方程式: q = cos(a/2) + i (x * sin(a/2)) + j (y * sin(a/2)) + k (z * sin(a/2))
             */
            let {x, y, z, angle} = getQuaternion(alpha, beta, gamma);

            let rotate = `rotateX(90deg) rotate3d(${-x}, ${y}, ${-z}, ${angle}deg)`;

            if (boxDOM.style.webkitTransform) {
                boxDOM.style.webkitTransform = rotate;
            } else {
                boxDOM.style.transform = rotate;
            }
        });

        /*
        socket.on('reconnect', () => {
            socket.emit('desktop ready', myid);
        });
        //*/
    }
}

App.run();
