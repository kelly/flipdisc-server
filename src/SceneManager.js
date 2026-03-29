import SceneImporter from './Importer.js';
import ScenePlaying from './Playing.js';
import SceneQueue from './Queue.js';
import logger from './Logger.js';

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

  async loadLocal(dir = this.options.sceneDir) {
    this.importer = new SceneImporter(dir);
    const scenes = await this.importer.loadAll()
    this.scenes = scenes;
    this._autoPlayIfEnabled()

    return this.scenes
  }  

  async play(item) {
    item.sceneObj = this.getScene(item.id)
    if (!item.sceneObj) {
      logger.warn(`Scene not found for id: ${item.id}`)
      return
    }
    item.duration = this._configureDuration(item)
    return this.playing.set(item)
  }

  getScene(idx) {
    if (idx >= 0 && idx < this.scenes.length) {
      return this.scenes[idx]
    }
  }

  updateScene(scene) {
    const id = this._getSceneIdFromTitle(scene.schema.title)
    if (id) {
      this.scenes[id] = this._decorateIdScene(scene, id)
      if (this.playing.id == id) this.play({ id })
    }
  }

  async _autoPlayIfEnabled() {
    if (this.isPlayingScene) return
    if (this.options.autoPlay && this.scenes?.length > 0) {
      const item = this.queue.hasItems ? this.queue.next() : { id: 0 }
      this.play(item)
    }
  }

  _configureDuration(item) {
    if (item.duration !== undefined) {
      return item.duration;
    }

    if (this.queue.hasItems) {
      return this.queue.defaultDuration;
    }

    return undefined; 
  }

  _getSceneIdFromTitle(title) {
    return this.scenes.findIndex(scene => scene.schema.title == title)
  }

  _decorateIdScene(scene, id) {
    scene.schema.id = id
    if (scene.task) scene.task.id = id
    return scene
  }

  _registerEvents() {
    this.playing.on('finished', () => {
      if (this.options.autoPlay && this.queue.hasItems) {
        this.play(this.queue.next()).catch(err => {
          logger.error(`Error auto-playing next scene: ${err.message}`)
        })
      }
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

  static sharedInstance() {
    if (!manager) 
      manager = new SceneManager()
    return manager;
  }
}