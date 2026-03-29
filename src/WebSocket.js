import WebSocket, { WebSocketServer } from 'ws';
import SceneManager from './SceneManager.js';
import { LiveSceneMessage, UserInputMessage } from './Message.js';

let wss
const clients = new Set()

const send = (buffer) => {
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(buffer, { binary: true })
    }
  }
}

const receive = (message) => {
  const data = new UserInputMessage().decode(message)
  const manager = SceneManager.sharedInstance();

  if (data) {
    const scene = manager.playing?.scene
    if (!scene) return
    scene.user.add(data)
    scene.render()
  }
}

const update = (imageData) => {
  const manager = SceneManager.sharedInstance();
  const payload = new LiveSceneMessage().encode(imageData, manager.playing.info)
  if (payload) send(payload)
}

const startUpdates = () => {
  const manager = SceneManager.sharedInstance();
  manager.playing.removeListener('update', update)
  manager.playing.on('update', update)
}

const startWebsocket = (port = 7071) => {
  wss = new WebSocketServer({ port: port, binaryType: 'arraybuffer'});
  wss.on('connection', (ws) => {
    clients.add(ws);

    ws.on('message', receive);
    ws.on('close', () => {
      clients.delete(ws);
    });
    ws.on('error', () => {
      clients.delete(ws);
    });

    if (clients.size === 1) {
      startUpdates();
    }
  })

  wss.on('close', () => {
    clients.clear();
    const manager = SceneManager.sharedInstance();
    manager.playing.removeListener('update', update)
  });
}

const isClientConnected = () => {
  return clients.size > 0
}

export {
  startWebsocket
}
