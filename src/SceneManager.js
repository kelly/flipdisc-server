import { isImageData } from '../utils/Image.js';
import Display from './Display.js';
import SceneImporter from './SceneImporter.js';
import ScenePlaying from './ScenePlaying.js';

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

  next() {
    const idx = this.playing.schema.id
    const nextIdx = idx >= this.scenes.length - 1 ? 0 : idx + 1
    this.setPlayingByIndex(nextIdx)
  }

  previous() {
    const idx = this.playing.schema.id
    const prevIdx = idx === 0 ? this.scenes.length - 1 : idx - 1
    this.setPlayingByIndex(prevIdx)
  }

  async setPlayingByIndex(idx, options) {
    if (idx => 0 && idx < this.scenes.length) {
      await this.setPlaying(this.scenes[idx], options)
    }
  }

  async setPlaying(scene, options) {
    return this.playing.set(scene, options)
  }

  get isPlayingScene() {
    return this.playing.isPlaying
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