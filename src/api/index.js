import { getDisplay } from './display.js'
import { 
  postPlaying,
  postPlayingPause,
  postPlayingResume,
  postPlayingToggle,
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

export default API;