import SceneManager from '../SceneManager.js'

const getQueue = async (c) => {
  const manager = SceneManager.sharedInstance();
  const items = manager.queue.items
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
  return c.json(manager.queue.items)
}

const postQueueNext = async (c) => {
  const manager = SceneManager.sharedInstance();
  const next = manager.queue.next()
  if (next) {
    manager.play(next)
    return c.json(manager.playing.info)
  } else {
    return c.notFound()
  }
}

const postQueuePrevious = async (c) => {
  const manager = SceneManager.sharedInstance();
  const previous = manager.queue.previous()
  if (previous) {
    manager.play(previous)
    return c.json(manager.playing.info)
  } else {
    return c.notFound()
  }
}

export {
  getQueue,
  getQueueSettings,
  postQueueSettings,
  postQueue,
  postQueueNext,
  postQueuePrevious
}