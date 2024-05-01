import SceneManager from '../SceneManager.js'

const postPlaying = async (c) => {
  const manager = SceneManager.sharedInstance();
  const data = await c.req.json()
  const id = data.id
  const options = data.options || {}
  if (id === undefined || id >= manager.scenes.length) {
    return c.status(404).json({ error: 'scene not found' })
  }
  await manager.setPlayingByIndex(id, options)
  return c.json(manager.playing.info)
}

const postPlayingToggle = async (c) => {
  const manager = SceneManager.sharedInstance();
  manager.playing.toggle()
  return c.json(manager.playing.info)
}

const postPlayingResume = async (c) => {
  const manager = SceneManager.sharedInstance();
  manager.playing.resume()
  return c.status(200)
}

const postPlayingPause = async (c) => {
  const manager = SceneManager.sharedInstance();
  manager.playing.stop()
  return c.status(200)
}

const getPlaying = async (c) => {
  const manager = SceneManager.sharedInstance();
  return c.json(manager.playing.info)
}
 

export {
  postPlaying,
  postPlayingPause,
  postPlayingResume,
  postPlayingToggle,
  getPlaying
}