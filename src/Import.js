import path from 'path'

export default class SceneImport {
  constructor(path) {
    this.path = path
    this.import = null
  }

  async load(reload = false) {
    const path = reload ? `${this.path}?updated=${Date.now()}` : this.path;
    this.import = await import(path)
    return this.import;
  }

  get filename() {
    return path.basename(this.path)
  }

}