/**
 * 服务端启动脚本
 */

import express from 'express';
import path from 'path';

import io from 'socket.io';
import http from 'http';

import uuid from 'node-uuid';

import webpack from 'webpack';
import webpackConfiguraion from '../webpack.config.development.js';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

const compiler = webpack(webpackConfiguraion);

const app = express();
const port = process.argv.length > 2 ? +process.argv[2] : 8080;

const staticDir = path.join(__dirname, `assets/dist/${process.env.NODE_ENV}`);

app.use(webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: webpackConfiguraion.output.publicPath
}));

app.use(webpackHotMiddleware(compiler));

app.use('/', (req, res) => {
    res.status(304).redirect('/static/app.html');
});

const httpService = http.Server(app);
const socketService = io(httpService);

socketService.on('connection', (accpetSocket) => {
    console.log('a user connected');

    accpetSocket.emit('uuid', uuid())

    accpetSocket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

httpService.listen(port, (err) => {
    if (err) return console.log(err);

    console.log(`listen success on ${port}, access http://localhost:8080`);
    console.log('press ctrl + c to stop listen');
});
