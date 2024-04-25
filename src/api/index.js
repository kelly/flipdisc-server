import { getDisplay } from './display.js'
import { 
  postPlaying,
  postPlayingNext,
  postPlayingPause,
  postPlayingResume,
  postPlayingToggle } from './playing.js'
import { 
  getSceneByID,
  getScenes }from './scene.js'


const API = { 
  getScenes,
  getSceneByID,
  getDisplay,
  postPlaying,
  postPlayingNext,
  postPlayingPause,
  postPlayingResume,
  postPlayingToggle

}

export default API;