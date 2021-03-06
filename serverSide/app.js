/**
 * 服务端启动脚本
 */

import express from 'express';
import path from 'path';

import io from 'socket.io';
import http from 'http';

import os from 'os';

import qr from 'qr-image';

import { ENUM_CLIENT_TYPE, getClientType } from '../constants/clientType';

import webpack from 'webpack';
import webpackConfiguraion from '../webpack.config.development.js';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

const compiler = webpack(webpackConfiguraion);

const app = express();
const port = process.argv.length > 2 ? +process.argv[2] : 8080;

const staticDir = path.join(__dirname, `assets/dist/${process.env.NODE_ENV}`);

let IPv4,
    en1 = os.networkInterfaces().en1,
    hostName = os.hostname();

for (let i = 0; i < en1.length; i++) {
    if (en1[i].family == 'IPv4') {
        IPv4 = en1[i].address;
    }
}

app.use(webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: webpackConfiguraion.output.publicPath
}));

app.use(webpackHotMiddleware(compiler));

app.use('/app', (req, res) => {
    res.status(304).redirect('/static/desktop.html');
});

app.use('/qrcode', (req, res) => {
    try {
        let uuid = req.query.uuid;
        let img = qr.image(`http://${IPv4}:${port}/static/mobile.html?uuid=${uuid}`, { size: 10 });

        res.writeHead(200, { 'Content-Type': 'image/png' });
        img.pipe(res);
    } catch (e) {
        /* handle error */
        res.writeHead(414, { 'Content-Type': 'text/html' });
        res.end('');
    }
});

const httpService = http.Server(app);
const socketService = io(httpService);

const roomMap = {};

socketService.on('connection', (accpetSocket) => {
    let userAgent = accpetSocket.request.headers['user-agent'];
    let clientType = getClientType(userAgent);

    let clientTypeName = clientType == ENUM_CLIENT_TYPE.MOBILE ? 'mobile' : 'desktop';

    accpetSocket.custom = {
        clientTypeName,
        clientType
    };

    if (clientType == ENUM_CLIENT_TYPE.MOBILE) {
        accpetSocket.on('mobile ready', function(uuid) {
            if (roomMap[uuid] == 1) {
                this.custom.uuid = uuid;
                this.join(uuid, (err) => {
                    if (err) return console.log(`mobile join failed: ${err}`);

                    console.log(`mobile join room[${uuid}] success`);

                    this.emit('join');
                    this.in(uuid).emit('mobile connected');
                });
            }
        });

        accpetSocket.on('mobile state change', function(uuid, vector) {
            this.in(uuid).emit('state change', vector);
        });
    } else if (clientType == ENUM_CLIENT_TYPE.DESKTOP) {
        accpetSocket.on('desktop ready', function(uuid) {
            this.custom.uuid = uuid;
            this.join(uuid, (err) => {
                if (err) return console.log(`desktop join failed: ${err}`);

                console.log(`desktop join room[${uuid}] success`);
            });

            roomMap[uuid] = roomMap[uuid] || 0;
            roomMap[uuid]++;
        });
    }

    accpetSocket.on('disconnect', function() {
        let { uuid, clientTypeName, clientType  } = this.custom;

        if (clientType == ENUM_CLIENT_TYPE.MOBILE)
            this.in(uuid).emit('mobile disconnected');
        else if (clientType == ENUM_CLIENT_TYPE.DESKTOP) {
            delete roomMap[uuid];
            this.in(uuid).emit('desktop disconnected');
        }

        this.leave(uuid);

        console.log(`${clientTypeName} leave room[${uuid}]`);
        console.log(`${clientTypeName} client[${this.id}] disconnected`);
    });

    console.log(`${clientTypeName} client[${accpetSocket.id}] connected  ${hostName}`);
});

httpService.listen(port, (err) => {
    if (err) return console.log(err);

    console.log(`listen success on ${port}`);
    console.log(`access 🌍 http://${IPv4}:8080/app`);
    console.log('press ctrl + c to stop listen');
});
