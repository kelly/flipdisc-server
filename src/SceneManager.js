import { isImageData } from '../utils/Image.js';
import Display from './Display.js';
import SceneImporter from './SceneImporter.js';
import ScenePlaying from './ScenePlaying.js';

const display = Display.sharedInstance()
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

  nextScene() {
    const idx = this.playingIndex
    const nextIdx = idx >= this.scenes.length - 1 ? 0 : idx + 1
    this.setPlayingByIndex(nextIdx)
  }

  prevScene() {
    const idx = this.playingIndex
    const prevIdx = idx === 0 ? this.scenes.length - 1 : idx - 1
    this.setPlayingByIndex(prevIdx)
  }

  setPlayingByIndex(idx) {
    if (idx => 0 && idx < this.scenes.length) {
      this.setPlaying(this.scenes[idx])
    }
  }

  async setPlaying(scene) {
    return this.playing.set(scene)
  }

  get playingIndex() {
    return this.scenes.findIndex(s => s.schema === this.playing.schema)
  }

  get isPlayingScene() {
    return this.playing.isPlaying
  }

  _registerEvents() {
    this.playing.on('update', (data) => {
      if (!data) return;
      isImageData(data) ? display.sendImageData(data) : display.send(data)
    })
    
    this.playing.on('finished', () => {
      if (this.options.autoPlay) this.nextScene() 
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