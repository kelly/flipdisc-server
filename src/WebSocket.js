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
  const msgName = 'UserInput'
  const buffer = new Uint8Array(message);      
  const data = decode(buffer, msgName)

  if (data) {
    const { point, size, isEnd } = data
    const scene = manager.playing?.scene
    scene.user.add(point, size, isEnd)
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
