import SceneManager from '../SceneManager.js'

const getScenes = async (c) => {
  const manager = SceneManager.sharedInstance();
  const scenes = manager.scenes.map(scene => scene.schema)
  return c.json(scenes)
}
 
const getSceneByID = async (c) => {
  const manager = SceneManager.sharedInstance();
  if (!manager.scenes[c.params.id]) {
    return c.notFound()
  } else {
    return c.json(manager.scenes[c.params.id])
  }
 }

export {
  getSceneByID,
  getScenes
}