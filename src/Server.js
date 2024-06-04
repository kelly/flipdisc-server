import { Hono } from 'hono'
import { serve } from "@hono/node-server";
import { configureRoutes } from './api/index.js';
import SceneManager from './SceneManager.js'
import SceneTaskManager from './TaskManager.js';
import { startWebsocket } from './WebSocket.js';
import logger from './Logger.js'

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

  serve({
    fetch: app.fetch,
    port: options.port,
  }, (info) => {
    logger.info(`Listening on http://localhost:${info.port}`)
  })
  
  startWebsocket(options.wsPort)  
  configureRoutes(app)

  return app
}

export default createServer;