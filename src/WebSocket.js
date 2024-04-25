import WebSocket from 'ws';
import SceneManager from './SceneManager.js';
const manager = SceneManager.sharedInstance();
let wss 

const startWebsocket = () => {
  wss = new WebSocket.Server({ port: 7071 });
  wss.binaryType = 'arraybuffer';
  wss.on('connection', (ws) => {

    const send  = (imageData) => {
      const buffer = new Int8Array(imageData.flat());  
      ws.send(buffer, { binary: true })
    }

    ws.on('message', (message) => {
      console.log('received: %s', message);
    });
  
    manager.playing.on('update', send)

  })
  
  wss.on('disconnect', () => {
    manager.playing.removeListener('update', send)
  })
  wss.on('close', () => {
    manager.playing.removeListener('update', send)
  });
  
}



export {
  startWebsocket
}
