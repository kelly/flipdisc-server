import { getDisplay } from './display.js'

import { 
  postPlaying,
  postPlayingPause,
  postPlayingResume,
  postPlayingToggle,
  postPlayingUserClear,
  getPlaying } from './playing.js'

import { 
  getSceneByID,
  getScenes
 } from './scene.js'

import {
  getQueue,
  getQueueSettings,
  postQueueSettings,
  postQueue,
  postQueueNext,
  postQueueSort,
  postQueuePrevious,
  deleteQueueItem
} from './queue.js'
 
const API = { 
  getScenes,
  getSceneByID,
  getDisplay,
  postPlaying,
  postPlayingPause,
  postPlayingResume,
  postPlayingToggle,
  postPlayingUserClear,
  getPlaying,
  getQueue,
  getQueueSettings,
  postQueueSettings,
  postQueue,
  postQueueSort,
  postQueueNext,
  postQueuePrevious,
  deleteQueueItem
}

const configureRoutes = (app) => {
  app.get('/api/playing', API.getPlaying)
  app.get('/api/display', API.getDisplay)
  app.get('/api/queue', API.getQueue)
  app.get('/api/queue/settings', API.getQueueSettings)
  app.get('/api/scenes/:id', API.getSceneByID)
  app.get('/api/scenes', API.getScenes)
  app.post('/api/scenes/next', API.postScenesNext)
  app.post('/api/scenes/previous', API.postScenesPrevious)
  app.post('/api/playing',  API.postPlaying)
  app.post('/api/playing/pause', API.postPlayingPause)
  app.post('/api/playing/resume', API.postPlayingResume)
  app.post('/api/playing/toggle', API.postPlayingToggle)
  app.post('/api/playing/user/clear', API.postPlayingUserClear)
  app.post('/api/queue/settings', API.postQueueSettings)
  app.post('/api/queue', API.postQueue)
  app.post('/api/queue/sort', API.postQueueSort)
  app.post('/api/queue/next', API.postQueueNext)
  app.post('/api/queue/previous', API.postQueuePrevious)
  app.delete('/api/queue/:id', API.deleteQueueItem)
}

export { API, configureRoutes}