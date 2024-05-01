import { isImageData } from '../utils/Image.js';
import Display from './Display.js';
import SceneImporter from './SceneImporter.js';
import ScenePlaying from './ScenePlaying.js';
import later from '@breejs/later';

let manager;

const defaults = {
  autoPlay: true,
  sceneDir: './scenes'
}

export default class SceneManager {

  constructor(scenes, options = {}) {
    this.options = { ...defaults, ...options };
    this.playing = new ScenePlaying();
    this.scenes = scenes;
    this.queue = [];
    this._autoPlayIfEnabled();
    this._destroyOnExit();
    this._registerEvents()
  }

  async _autoPlayIfEnabled() {
    if (this.isPlayingScene) return
    if (this.options.autoPlay && this.scenes?.length > 0) {
      this.setPlaying(this.scenes[0]);
    }
  }

  async loadLocal(dir = this.options.sceneDir) {
    this.importer = new SceneImporter(dir);
    const scenes = await this.importer.loadAll()
    this.scenes = scenes;
    this._autoPlayIfEnabled()

    return this.scenes
  }  

  addQueueItem(item) {
    this.queue.push(item)
  }

  next() {
    let item = {}
    if (this.queue.length > 0) {
      item = this.queue.shift()
    } else {
      const _id = this.playing.schema.id 
      item.id = (_id >= this.scenes.length - 1) ? 0 : _id + 1
      this.setPlayingByQueueItem(item)
    }
  }

  previous() {
    let item = {}
    if (this.queue.length > 0) {
      item = this.queue.pop()
    } else {
      const idx = this.playing.schema.id
      item.id = (idx === 0) ? this.scenes.length - 1 : idx - 1
    }
    this.setPlayingByQueueItem(item)
  }

  async setPlayingByQueueItem(item, shouldPlayLast = false) {
    const scene = this.scenes[item.id]
    if (shouldPlayLast && this.playing.isPlaying) this.addQueueItem({ id: this.playing.schema.id })
    await this.setPlaying(scene, item.options, item.duration)
  }

  async setPlayingByIndex(idx, options, duration) {
    if (idx => 0 && idx < this.scenes.length) {
      await this.setPlaying(this.scenes[idx], options, duration)
    }
  }

  async setPlaying(scene, options, duration) {
    return this.playing.set(scene, options, duration)
  }

  get isPlayingScene() {
    return this.playing.isPlaying
  }

  get scenes() {
    return this._scenes;
  }

  set scenes(scenes) {
    scenes?.map((scene, idx) => {
      scene.schema.id = idx
      if (scene.task) scene.task.id = idx
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
      if (this.options.autoPlay) this.next() 
    })
  }

  _destroyOnExit() {
    process.once('exit', () => {
      this.importer?.destroy()
      this.playingScene?.destroy();
      process.removeAllListeners()
    });
  }

  static sharedInstance() {
    if (!manager) 
      manager = new SceneManager()
    return manager;
  }
}