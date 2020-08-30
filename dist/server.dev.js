"use strict";

var express = require('express');

var app = express();

var server = require('http').Server(app);

var io = require('socket.io')(server);

var _require = require('uuid'),
    uuidV4 = _require.v4;

app.set('view engine', 'ejs');
app.use(express["static"]('public'));
app.get('/', function (req, res) {
  res.redirect("/".concat(uuidV4()));
});
app.get('/:room', function (req, res) {
  res.render('room', {
    roomId: req.params.room
  });
});
io.on('connection', function (socket) {
  socket.on('join-room', function (roomId, userId) {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);
    socket.on('disconnect', function () {
      socket.to(roomId).broadcast.emit('user-disconnected', userId);
    });
  });
});
server.listen(3000);