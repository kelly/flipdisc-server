import WebSocket from 'ws';
import SceneManager from './SceneManager.js';
import { LiveSceneMessage, UserInputMessage } from './Message.js';

let wss 
let socket

const send = (buffer) => {
  socket.send(buffer, { binary: true })
}

const receive = (message) => {
  const data = new UserInputMessage().decode(message)
  const manager = SceneManager.sharedInstance();

  if (data) {
    const { point, size, isEnd } = data
    const scene = manager.playing?.scene
    scene.user.add(point, size, isEnd)
    scene.render()
  }  
}

const update = (imageData) => {
  const manager = SceneManager.sharedInstance();
  const payload = new LiveSceneMessage().encode(imageData, manager.playing.info)
  if (payload) send(payload)
}

const startWebsocket = (port = 7071) => {
  const manager = SceneManager.sharedInstance();
  wss = new WebSocket.Server({ port: port });
  wss.binaryType = 'arraybuffer';
  wss.on('connection', (ws) => {
    socket = ws;

    ws.on('message', receive);
    manager.playing.removeListener('update', send) // just in case, remove any existing listeners
    manager.playing.on('update', update)
  })
  
  wss.on('close', () => {
    manager.playing.removeListener('update', send)
  });
}


export {
  startWebsocket
}
