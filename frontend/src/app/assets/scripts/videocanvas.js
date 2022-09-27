/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */

function streamCam() {
  const client = 'ws://172.20.4.195:9999';
  const canvas = document.getElementById('video-canvas');
  const player = new JSMpeg.Player(client, {
    canvas,
    audio: false,
  });
}
function streamCamRoom1() {
  const client = 'ws://172.20.4.195:9997';
  const canvas = document.getElementById('video-canvas1');
  const player = new JSMpeg.Player(client, {
    canvas,
    audio: false,
  });
}

function streamCamRoom2() {
  const client = 'ws://172.20.4.195:9998';
  const canvas = document.getElementById('video-canvas2');
  const player = new JSMpeg.Player(client, {
    canvas,
    audio: false,
  });
}
