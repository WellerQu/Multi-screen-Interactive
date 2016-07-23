/**
 * 移动客户端启动脚本
 */

import 'styles/mobile.less';

import io from 'socket.io-client';

export default class Mobile {

    static run() {
        let regexp = /uuid=(.+)$/i;
        if (regexp.test(window.location.href)) {
            console.log(Regexp.$1);
            alert(Regexp.$1);
        }
    }
}

Mobile.run();
