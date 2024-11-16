import WebSocket, { WebSocketServer } from 'ws';
import SceneManager from './SceneManager.js';
import { LiveSceneMessage, UserInputMessage } from './Message.js';

let wss 
let socket

const send = (buffer) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) return

  socket.send(buffer, { binary: true })
}

const receive = (message) => {
  const data = new UserInputMessage().decode(message)
  const manager = SceneManager.sharedInstance();

  if (data) {
    const scene = manager.playing?.scene
    scene.user.add(data)
    scene.render()
  }  
}

const update = (imageData) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) return

  const manager = SceneManager.sharedInstance();
  const payload = new LiveSceneMessage().encode(imageData, manager.playing.info)
  if (payload) send(payload)
}

const startUpdates = () => {
  const manager = SceneManager.sharedInstance();
  manager.playing.removeListener('update', send) // just in case, remove any existing listeners
  manager.playing.on('update', update)
}

const startWebsocket = (port = 7071) => {
  wss = new WebSocketServer({ port: port, binaryType: 'arraybuffer'});
  wss.on('connection', (ws) => {
    socket = ws;
    ws.on('message', receive);
    startUpdates();
  })
  
  wss.on('close', () => {
    const manager = SceneManager.sharedInstance();
    manager.playing.removeListener('update', send)
  });
}


export {
  startWebsocket
}
