/**
 * 服务端启动脚本
 */

import express from 'express';
import path from 'path';

import io from 'socket.io';
import http from 'http';

import os from 'os';

import uuid from 'node-uuid';
import qr from 'qr-image';

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
    res.status(304).redirect('/static/app.html');
});

app.use('/qrcode', (req, res) => {
    try {
        let uuid = req.query.uuid;
        let img = qr.image(`/static/mobile.html?uuid=${uuid}`, { size: 10 });

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

socketService.on('connection', (accpetSocket) => {
    console.log(`a user connected  ${hostName}`);

    accpetSocket.emit('uuid', uuid())

    accpetSocket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

httpService.listen(port, (err) => {
    if (err) return console.log(err);

    console.log(`listen success on ${port}, access 🌍 http://${IPv4}:8080`);
    console.log('press ctrl + c to stop listen');
});
