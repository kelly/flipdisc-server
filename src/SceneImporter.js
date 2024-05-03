import fs from 'fs';
import path from 'path';
import appRoot from 'app-root-path';
import SceneImport from './SceneImport.js';
import SceneManager from './SceneManager.js';

export default class SceneImporter {

  constructor(dir) {
    this._dir = dir
    this.watchDir()
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
    console.log('loading scene', scene.filename)
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
    return path.join(appRoot.path, this._dir);
  }

}