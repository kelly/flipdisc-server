import SceneManager from '../SceneManager.js'
const manager = SceneManager.sharedInstance();

const getScenes = async (c) => {
  return c.json(manager.scenes)
}
 
const getSceneByID = async (c) => {
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