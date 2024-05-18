import { Hono } from 'hono'
import { serve } from "@hono/node-server";
import API from './api/index.js';
import SceneManager from './SceneManager.js'
import SceneTaskManager from './TaskManager.js';
import { startWebsocket } from './WebSocket.js';

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
  app.post('/api/playing/user/clear', API.postPlayingUserClear)
  app.get('/api/playing', API.getPlaying)

  // display
  app.get('/api/display', API.getDisplay)

  // queue
  app.get('/api/queue', API.getQueue)
  app.get('/api/queue/settings', API.getQueueSettings)
  app.post('/api/queue/settings', API.postQueueSettings)
  app.post('/api/queue', API.postQueue)
  app.post('/api/queue/sort', API.postQueueSort)
  app.post('/api/queue/next', API.postQueueNext)
  app.post('/api/queue/previous', API.postQueuePrevious)
  app.delete('/api/queue/:id', API.deleteQueueItem)

  return app
}

export default createServer;