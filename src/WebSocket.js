import WebSocket from 'ws';
import SceneManager from './SceneManager.js';
import { prepare, decode } from '../utils/message.js';

let wss 
let socket

const send = (buffer) => {
  socket.send(buffer, { binary: true })
}

const prepareLiveSceneMessage = (imageData, info) => {
  const msgName = 'LiveScene'
  const buffer = new Int8Array(imageData.flat()); 
  const { id, isPlaying, timeRemaining } = info
  const payload = {
    id,
    isPlaying,
    timeRemaining,
    imageData: buffer
  }
  const data = prepare(payload, msgName)
  if (data) send(data)
}


const receive = (message) => {
  const manager = SceneManager.sharedInstance();
  const data = new Int8Array(message)
  if (data.length !== 4) return console.error('Invalid message')

  const point = new Int8Array([data[0], data[1]])
  const size = data[2] 
  const isNew = data[3]
  const scene = manager.playing?.scene

  if (scene) {
    scene.user.addTouch(point, size, isNew)
    scene.render()
  }
}

const startWebsocket = (port = 7071) => {
  const manager = SceneManager.sharedInstance();
  wss = new WebSocket.Server({ port: port });
  wss.binaryType = 'arraybuffer';
  wss.on('connection', (ws) => {
    socket = ws;

    ws.on('message', receive);
    manager.playing.removeListener('update', send) // just in case, remove any existing listeners
    manager.playing.on('update', (imageData) => {
      prepareLiveSceneMessage(imageData, manager.playing.info)
    })
  })
  
  wss.on('close', () => {
    manager.playing.removeListener('update', send)
  });

}

export {
  startWebsocket
}
