import { Hono } from 'hono'
import { serve } from "@hono/node-server";
import API from './api/index.js';
import SceneManager from './SceneManager.js'
import SceneTaskManager from './SceneTaskManager.js';
import { startWebsocket } from './WebSocket.js';

let app;

const defaults = {
  port: 3000,
  wsPort: 7071,
  sceneDir: './scenes'
}

const createServer = async (options) => {
  options = { ...defaults, ...options }
  const scenes = await SceneManager.sharedInstance().loadLocal(options.sceneDir);
  const taskManager = new SceneTaskManager(scenes)

  const app = new Hono()

  const server = serve({
    fetch: app.fetch,
    port: options.port,
  }, (info) => {
    console.log(`Listening on http://localhost:${info.port}`)
  })
  startWebsocket(options.wsPort)

  // scenes
  app.get('/api/scenes', API.getScenes)
  app.post('/api/scenes/next', API.postScenesNext)
  app.post('/api/scenes/previous', API.postScenesPrevious)
  app.get('/api/scenes/:id', API.getSceneByID)

  // playing
  app.post('/api/playing',  API.postPlaying)
  app.post('/api/playing/pause', API.postPlayingPause)
  app.post('/api/playing/resume', API.postPlayingResume)
  app.post('/api/playing/toggle', API.postPlayingToggle)
  app.get('/api/playing', API.getPlaying)

  // display
  app.get('/api/display', API.getDisplay)

  return app
}

export default createServer;