import EventEmitter from 'events';
import later from '@breejs/later';

export default class Playing extends EventEmitter {
  
  constructor() {
    super();
    this.scene = null;
    this.isPlaying = false;
    this.timer = null;
  }

  async set(item) {
    const { sceneObj, options, duration } = item;
    const { scene, schema } = sceneObj;
    
    if (this.scene)
      this.cleanupScene()

    this.schema = schema;
    console.log(this.schema)

    try {
      await this._setup(scene, schema, options);
    } catch (e) {
      this.emit('error', e);
    }

    this.isLoaded = await this.load()

    duration ? this.playFor(duration) : this.play();

    return this
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

  playFor(duration) {
    const time = later.parse.text(duration);
    this.play();
    this.timer = later.setTimeout(() => {
      this.stop();
      this.emit('finished')
    }, time)  
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
    clearTimeout(this.timer);
    this.isPlaying = false;
    this.scene?.destroy();
    this.scene = null;
  }

  destroy() {
    this.cleanupScene();
    this.removeAllListeners()
  }

  get id() {
    return this.schema?.id
  }
  
  get info() {
    return {
      isPlaying: this.isPlaying,
      schema: this.schema ? this.schema : null,
      id: this.schema ? this.schema.id : null
    }
  }

}