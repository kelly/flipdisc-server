import WebSocket from 'ws';
import SceneManager from './SceneManager.js';
let wss 

const startWebsocket = (port = 7071) => {
  const manager = SceneManager.sharedInstance();
  wss = new WebSocket.Server({ port: port });
  wss.binaryType = 'arraybuffer';
  wss.on('connection', (ws) => {
    const send  = (imageData) => {
      const buffer = new Int8Array(imageData.flat());  
      ws.send(buffer, { binary: true })
    }

    ws.on('message', (message) => {
      console.log('received: %s', message);
    });
    manager.playing.removeListener('update', send) // just in case, remove any existing listeners
    manager.playing.on('update', send)
  })
  
  wss.on('close', () => {
    manager.playing.removeListener('update', send)
  });
    
}

export {
  startWebsocket
}
