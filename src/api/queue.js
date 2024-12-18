import SceneManager from '../SceneManager.js'

const getQueue = async (c) => {
  const manager = SceneManager.sharedInstance();
  const items = manager.queue.itemsArray
  return c.json(items)
}

const getQueueSettings = async (c) => {
  const manager = SceneManager.sharedInstance();
  return c.json(manager.queue.settings)
}

const postQueueSettings = async (c) => {
  const manager = SceneManager.sharedInstance();
  const data = await c.req.json()
  manager.queue.settings = data
  return c.json(manager.queue.settings)
}

const postQueue = async (c) => {
  const manager = SceneManager.sharedInstance();
  const data = await c.req.json()
  if (data.id === undefined || data.id >= manager.scenes.length) {
    return c.notFound()
  }
  manager.queue.add(data)
  return c.json(manager.queue.itemsArray)
}

const postQueueNext = async (c) => {
  const manager = SceneManager.sharedInstance();
  const next = manager.queue.next()
  if (next) {
    manager.play(next)
    return c.json({
      playing: manager.playing.info,
      queue: manager.queue.itemsArray
    })
  } else {
    return c.notFound()
  }
}

const postQueueSort = async (c) => {
  const manager = SceneManager.sharedInstance();
  const data = await c.req.json()
  manager.queue.sort(data)
  return c.json(manager.queue.itemsArray)
}

const postQueuePrevious = async (c) => {
  const manager = SceneManager.sharedInstance();
  const previous = manager.queue.previous()
  if (previous) {
    manager.play(previous)
    return c.json({
      playing: manager.playing.info,
      queue: manager.queue.itemsArray
    })
  } else {
    return c.notFound()
  }
}

const deleteQueueItem = async (c) => {
  const manager = SceneManager.sharedInstance();
  const id = c.req.param().id
  manager.queue.remove(parseInt(id))
  return c.json(manager.queue.itemsArray)
}

export {
  getQueue,
  getQueueSettings,
  postQueueSettings,
  postQueue,
  postQueueSort,
  postQueueNext,
  postQueuePrevious,
  deleteQueueItem
}