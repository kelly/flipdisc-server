import { getDisplay } from './display.js'
import { 
  postPlaying,
  postPlayingPause,
  postPlayingResume,
  postPlayingToggle } from './playing.js'
import { 
  getSceneByID,
  getScenes, 
  postScenesNext,
  postScenesPrevious }from './scene.js'


const API = { 
  getScenes,
  getSceneByID,
  postScenesNext,
  postScenesPrevious,
  getDisplay,
  postPlaying,
  postPlayingPause,
  postPlayingResume,
  postPlayingToggle
}

export default API;