"use strict";

var socket = io('/');
var videoGrid = document.getElementById('video-grid');
var myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
});
var myVideo = document.createElement('video');
myVideo.muted = true;
var peers = {};
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(function (stream) {
  addVideoStream(myVideo, stream);
  myPeer.on('call', function (call) {
    call.answer(stream);
    var video = document.createElement('video');
    call.on('stream', function (userVideoStream) {
      addVideoStream(video, userVideoStream);
    });
  });
  socket.on('user-connected', function (userId) {
    connectToNewUser(userId, stream);
  });
});
socket.on('user-disconnected', function (userId) {
  if (peers[userId]) peers[userId].close();
});
myPeer.on('open', function (id) {
  socket.emit('join-room', ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  var call = myPeer.call(userId, stream);
  var video = document.createElement('video');
  call.on('stream', function (userVideoStream) {
    addVideoStream(video, userVideoStream);
  });
  call.on('close', function () {
    video.remove();
  });
  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', function () {
    video.play();
  });
  videoGrid.append(video);
}