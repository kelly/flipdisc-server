import { Hono } from 'hono'
import { serve } from "@hono/node-server";
import API from './api/index.js';
import SceneManager from './SceneManager.js'
import { startWebsocket } from './WebSocket.js';

SceneManager.sharedInstance().loadLocal()
const app = new Hono()
const server = serve(app, (info) => {
  console.log(`Listening on http://localhost:${info.port}`)
})
startWebsocket()

// scenes
app.get('/api/scenes', API.getScenes)
app.get('/api/scenes/:id', API.getSceneByID)

// playing
app.post('/api/playing/next', API.postPlayingNext)
app.post('/api/playing',  API.postPlaying)
app.post('/api/playing/pause', API.postPlayingPause)
app.post('/api/playing/resume', API.postPlayingResume)
app.post('/api/playing/toggle', API.postPlayingToggle)

// display
app.get('/api/display', API.getDisplay)


export default app