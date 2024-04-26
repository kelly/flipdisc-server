import EventEmitter from 'events';

export default class Playing extends EventEmitter {
  
  constructor() {
    super();
    this.scene = null;
    this.isPlaying = false;
  }

  async set(sceneObj, options = {}) {
    const { scene, schema } = sceneObj;
    if (this.scene)
      this.cleanupScene()

    this.schema = schema;

    try {
      await this._setup(scene, schema, options);
    } catch (e) {
      this.emit('error', e);
    }

    this.isLoaded = await this.load()
    this.play()
  }

  async load() {
    return await this.scene.load();
  }

  async _setup(scene, schema, options) {
    this.scene = await scene(options)
    this.scene.on('update', (data) => {
      this.emit('update', data);
    });
  }

  play() {
    this.scene.play();
    this.isPlaying = true;
  }

  toggle() {
    this.isPlaying ? this.stop() : this.resume();
  }

  stop() {
    this.scene.stop();
    this.isPlaying = false;
  }

  resume() {
    this.isPlaying = true;
    this.scene.resume();
  }

  cleanupScene() {
    this.isPlaying = false;
    this.scene?.destroy();
    this.scene = null;
  }

  destroy() {
    this.cleanupScene();
    this.removeAllListeners()
  }

  get info() {
    return {
      isPlaying: this.isPlaying,
      schema: this.schema ? this.schema : null,
    }
  }

}