import fs from 'fs';
import path from 'path';
import SceneImport from './Import.js';
import SceneManager from './SceneManager.js';
import logger from './Logger.js';

const defaults = {
  shouldWatchChanges: true
}

export default class SceneImporter {

  constructor(dir, options = {}) {
    options = { ...defaults, ...options };
    this._dir = dir

    if (options.shouldWatchChanges) {
      this.watchDir()
    }
  }

  async getPaths() {
    let files = await fs.promises.readdir(this.dir);
    files = files.filter(this.doesExist.bind(this))
    const paths = files.map(file => path.join(this.dir, file));
    return paths;
  }

  async import() {
    const paths = await this.getPaths();
    this.imports = paths.map(path => {
      return new SceneImport(path);
    });
    return this.imports;
  }

  async loadAll() {
    const scenes = await this.import();
    return Promise.all(scenes.map(async (s, idx) =>  {
      const scene = await s.load()
      return scene;
  }))
  }

  async loadOne(filename, hasChanged = false) {
    const scene = this.imports.find(s => s.filename === filename);
    logger.info(`loading scene ${scene.filename}`)
    return scene.load(hasChanged);
  }

  async doesExist(file) {
    const stat = await fs.promises.stat(path.join(this.dir, file));
    return stat.isFile();
  }

  watchDir() {
    this.reloader = fs.watch(this.dir, async (eventType, filename) => {
      if (eventType === 'change') {
        const scene = await this.loadOne(filename, true);
        SceneManager.sharedInstance().updateScene(scene);
      }
    });
  }

  destroy() {
    this.reloader.close();
  }

  get dir() {
    const rootPath = process.cwd();
    return path.join(rootPath, this._dir);
  }

}