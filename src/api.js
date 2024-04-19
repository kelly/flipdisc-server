import SceneManager from './SceneManager.js'
import Display from './Display.js'

const manager = new SceneManager();
const display = Display.sharedInstance()

manager.loadLocal()

const getScenes = async (c) => {
 c.json(manager.scenes)
}

const getSceneByID = async (c) => {
  c.json(manager.scenes[c.params.id])
}

const getDisplay = async (c) => {
  c.json(display.info)
}

const postPlaying = async (c) => {
  const { id } = c.body
  const scene = manager.scenes[id]

  if (!scene) {
    return c.status(404).json({ error: 'scene not found' })
  }

  manager.changeScene(scene);
  scene.play()

  c.json(scene)
}

const postPlayingNext = async (c) => {
  manager.nextScene()
  c.json(manager.playingScene)
}

const postPlayingPause = async (c) => {
  manager.playingScene.stop()
  c.status(200)
}

const postPlayingResume = async (c) => {
  manager.playingScene.resume()
  c.status(200)
}

export {
  getScenes,
  getSceneByID,
  getDisplay,
  postPlaying,
  postPlayingNext,
  postPlayingPause,
  postPlayingResume
}