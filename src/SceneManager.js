import { isImageData } from '../utils/Image.js';
import Display from './Display.js';
import fs from 'fs';
import path from 'path';
import appRoot from 'app-root-path';

const display = Display.sharedInstance()

const defaults = {
  autoPlay: true,
  sceneDir: './scenes'
}

export default class SceneManager {

  constructor(scenes, options = {}) {
    this.options = { ...defaults, ...options };
    this.playingScene = null;
    this.scenes = scenes;
    this._autoPlayIfEnabled();
    this._reloadIfNeeded();
    this._destroyOnExit();
  }

  _autoPlayIfEnabled() {
    if (this.isPlaying) return
    if (this.options.autoPlay && this.scenes?.length > 0) {
      this.setPlaying(this.scenes[0]);
    }
  }

  async _getScenePaths() {
    let files = await fs.promises.readdir(this.sceneDir);
    files = files.filter(async (file) => {
      const stat = await fs.promises.stat(path.join(this.sceneDir, file));
      return stat.isFile();
    });
    const paths = files.map(file => path.join(this.sceneDir, file));
    return paths;
  }

  _reloadIfNeeded() {
    this.reloadWatcher = fs.watch(this.sceneDir, async (eventType, filename) => {
      if (eventType === 'change') {
        console.log(`File ${filename} has changed. Reloading scenes...`);
        await this.loadLocal(this.options.sceneDir, filename);
      }
    });
  }

  async loadLocal(dir, changedFile) {
    if (dir) this.options.sceneDir = dir; 

    const paths = await this._getScenePaths();
    const scenes = paths.map(p => {
      const filename = path.basename(p)
      const changedPath = `${p}?updated=${Date.now()}`
      const newPath = filename === changedFile ? changedPath : p

      return import(newPath)
    });
    this.scenes = await Promise.all(scenes);
    this._autoPlayIfEnabled();

    return this.scenes;
  }  

  nextScene() {
    let nextIndex = this.playingIndex + 1;
    if (nextIndex >= this.scenes.length) {
      nextIndex = 0;
    }
    this.setPlayingByIndex(nextIndex);
  }

  setPlayingByIndex(idx) {
    if (idx => 0 && idx < this.scenes.length) {
      this.changeScene(this.scenes[idx]);
    }
  }

  _registerEvents(playing) {
    playing.load()

    playing.on('loaded', () => {
      playing.play()
    });

    playing.on('update', (data) => {
      if (!data) return;
      isImageData(data) ? display.sendImageData(data) : display.send(data)
    })
    
    playing.on('finished', () => {
      if (this.options.autoPlay) this.nextScene() 
    })
  }

  _destroyOnExit() {
    process.on('exit', () => {
      this.reloadWatcher.close();
      this.playingScene.destroy();
      process.removeAllListeners()
    });
  }

  async setPlaying(scene) {
    this.playingScene = await scene.scene()
    this.playing = scene
    this._registerEvents(this.playingScene);
  }

  changeScene(scene) {
    if (this.playingScene) {
      this.playingScene.destroy();
      this.playingScene = null;
      this.playing = null;
    }

    return this.setPlaying(scene);
  }

  get playingIndex() {
    return this.scenes.findIndex((s) => s.title == this.playing.title);
  } 

  get isPlaying() {
    return this.playingScene 
  }

  get sceneDir() {
    return path.join(appRoot.path, this.options.sceneDir);
  }

}