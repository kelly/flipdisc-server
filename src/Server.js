import { Hono } from 'hono'
import { serve } from "@hono/node-server";
import * as API from './api.js';

const app = new Hono()
const server = serve(app, (info) => {
  console.log(`Listening on http://localhost:${info.port}`) // Listening on http://localhost:3000
})

app.get('/scenes', API.getScenes)
app.get('/scenes/:id', API.getSceneByID)
app.get('/display', API.getDisplay)
app.post('/playing/next', API.postPlayingNext)
app.post('/playing',  API.postPlaying)
app.post('/playing/pause', API.postPlayingPause)
app.post('/playing/resume', API.postPlayingResume)


export default app