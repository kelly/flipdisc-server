import { isImageData } from '../utils/Image.js';
import Display from './Display.js';
import SceneImporter from './SceneImporter.js';
import ScenePlaying from './ScenePlaying.js';
import SceneQueue from './SceneQueue.js';

let manager;

const defaults = {
  autoPlay: true,
  sceneDir: './scenes'
}

export default class SceneManager {

  constructor(scenes, options = {}) {
    this.options = { ...defaults, ...options };
    this.scenes = scenes;
    this.playing = new ScenePlaying();
    this.queue = new SceneQueue(this.scenes);
    this._autoPlayIfEnabled();
    this._destroyOnExit();
    this._registerEvents()
  }

  async _autoPlayIfEnabled() {
    if (this.isPlayingScene) return
    if (this.options.autoPlay && this.scenes?.length > 0) {
      const item = this.queue.hasItems ? this.queue.next() : { id: 0 }
      this.play(item)
    }
  }

  async loadLocal(dir = this.options.sceneDir) {
    this.importer = new SceneImporter(dir);
    const scenes = await this.importer.loadAll()
    this.scenes = scenes;
    this._autoPlayIfEnabled()

    return this.scenes
  }  

  // next() {
  //   let item = {}
  //   if (this.queue.hasItems) {
  //     item = this.queue.next()
  //   } else {
  //     const _id = this.playing.schema.id || 0
  //     item.id = (_id >= this.scenes.length - 1) ? 0 : _id + 1
  //   }
  //   this.setPlayingQueueItem(item)
  // }

  // previous() {
  //   let item = {}
  //   if (this.queue.hasItems) {
  //     item = this.queue.previous()
  //   } else {
  //     const idx = this.playing.schema.id || 0
  //     item.id = (idx === 0) ? this.scenes.length - 1 : idx - 1
  //   }
  //   this.setPlayingQueueItem(item)
  // }

  // async setPlayingQueueItem(item, shouldPlayLast = false) {
  //   const scene = this.scenes[item.id]
  //   if (shouldPlayLast && this.playing.isPlaying) this.addQueueItem({ id: this.playing.schema.id })
  //   await this.setPlaying(scene, item.options, item.duration)
  // }

  // async setPlayingByIndex(idx, options, duration) {
  //   if (idx => 0 && idx < this.scenes.length) {
  //     await this.setPlaying(this.scenes[idx], options, duration)
  //   }
  // }

  async play(item) {
    item.sceneObj = this.getScene(item.id)
    return this.playing.set(item)
  }

  getScene(idx) {
    if (idx >= 0 && idx < this.scenes.length) {
      return this.scenes[idx]
    }
  }

  getSceneIdFromTitle(title) {
    return this.scenes.findIndex(scene => scene.schema.title == title)
  }

  updateScene(scene) {
    console.log('updating scene', scene.schema.title)
    const id = this.getSceneIdFromTitle(scene.schema.title)
    if (id) {
      this.scenes[id] = this._decorateIdScene(scene, id)
      console.log('playing', this.playing.id, id)
      if (this.playing.id == id) this.play({ id })
    }
  }

  _decorateIdScene(scene, id) {
    scene.schema.id = id
    if (scene.task) scene.task.id = id
    return scene
  }

  get isPlayingScene() {
    return this.playing.isPlaying
  }

  get scenes() {
    return this._scenes;
  }

  set scenes(scenes) {
    scenes?.map((scene, idx) => {
      this._decorateIdScene(scene, idx)
    })
    this._scenes = scenes;
  }

  _registerEvents() {
    const display = Display.sharedInstance()

    this.playing.on('update', (data) => {
      if (!data) return;
      isImageData(data) ? display.sendImageData(data) : display.send(data)
    })
    
    this.playing.on('finished', () => {
      if (this.options.autoPlay && this.queue.hasItems) 
        this.play(this.queue.next())
    })
  }

  _destroyOnExit() {
    process.once('exit', () => {
      this.importer?.destroy()
      this.playing?.destroy();
      this.queue?.destroy();
      process.removeAllListeners()
    });
  }

  static sharedInstance() {
    if (!manager) 
      manager = new SceneManager()
    return manager;
  }
}