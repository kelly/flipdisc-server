import SceneManager from '../SceneManager.js'
const manager = SceneManager.sharedInstance();

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

const postPlayingToggle = async (c) => {
  manager.playing.toggle()
  c.status(200)
}

const postPlayingNext = async (c) => {
  manager.nextScene()
  c.json(manager.playing.schema)
}

const postPlayingPause = async (c) => {
  manager.playing.stop()
  c.status(200)
}

const postPlayingResume = async (c) => {
  manager.playing.resume()
  c.status(200)
}


export {
  postPlaying,
  postPlayingNext,
  postPlayingPause,
  postPlayingResume,
  postPlayingToggle
}