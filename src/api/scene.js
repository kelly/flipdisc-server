import SceneManager from '../SceneManager.js'

const getScenes = async (c) => {
  const manager = SceneManager.sharedInstance();
  const scenes = manager.scenes.map(scene => scene.schema)
  return c.json(scenes)
}
 
const getSceneByID = async (c) => {
  const manager = SceneManager.sharedInstance();
  const id = c.req.param().id
  if (!manager.scenes[id]) {
    return c.notFound()
  } else {
    return c.json(manager.scenes[id])
  }
}

export {
  getSceneByID,
  getScenes
}
