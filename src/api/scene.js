import SceneManager from '../SceneManager.js'

const getScenes = async (c) => {
  const manager = SceneManager.sharedInstance();
  return c.json(manager.scenes)
}
 
const getSceneByID = async (c) => {
  const manager = SceneManager.sharedInstance();
  if (!manager.scenes[c.params.id]) {
    return c.notFound()
  } else {
    return c.json(manager.scenes[c.params.id])
  }
 }

const postScenesNext = async (c) => {
  const manager = SceneManager.sharedInstance();
  manager.next()
  return c.json(manager.playing.info)
}

const postScenesPrevious = async (c) => {
  const manager = SceneManager.sharedInstance();
  manager.previous()
  return c.json(manager.playing.info)
}


export {
  getSceneByID,
  getScenes,
  postScenesNext,
  postScenesPrevious
}