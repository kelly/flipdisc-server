import WebSocket from 'ws';
import SceneManager from './SceneManager.js';
let wss 
let socket

const send = (imageData) => {
  const buffer = new Int8Array(imageData.flat());  
  socket.send(buffer, { binary: true })
}

const startWebsocket = (port = 7071) => {
  const manager = SceneManager.sharedInstance();
  wss = new WebSocket.Server({ port: port });
  wss.binaryType = 'arraybuffer';
  wss.on('connection', (ws) => {
    socket = ws;
    ws.on('message', (message) => {
      console.log('received: %s', message);
    });

    manager.playing.removeListener('update', send) // just in case, remove any existing listeners
    console.log(manager.playing.listenerCount('update')) // just in case, check how many listeners are there
    manager.playing.on('update', send)
  })
  
  wss.on('close', () => {
    manager.playing.removeListener('update', send)
  });

}

export {
  startWebsocket
}
