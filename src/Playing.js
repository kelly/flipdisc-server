import EventEmitter from 'events';
import Display from './Display.js';
import Recording from './Recording.js';
import logger from './Logger.js'
import Renderer from './Renderer.js';

const defaults = {
  isRecording: true
}

export default class Playing extends EventEmitter {
  
  constructor(options = {})  {
    super();
    options = { ...defaults, ...options };
    this.scene = null;
    this.renderer = new Renderer();

    if (options.isRecording) {
      this.recorder = new Recording();
    }
  }

  async set(item) {
    if (this.scene) this._cleanupScene()

    const { sceneObj, props, duration } = item;
    const { scene, schema } = sceneObj;

    this.schema = schema;
    this.props = props;
    this.duration = duration;
    this.scene = await this._exec(scene, props);

    if (this.scene) {
      this.isLoaded = await this.load()
      this.subscribe()
      duration !== undefined ? this.playFor(duration) : this.play();
    }

    return this
  }

  async load() {
    return await this.scene.load();
  }

  async _exec(scene, props) {
    try {
      return await scene(props)
    } catch (e) {
      logger.error('Error setting up scene')
      this.emit('finished')
    }
  }

  subscribe() {
    this.scene.on('update', (data) => {
      this.emit('update', data);
      Display.sharedInstance().send(data);
      this.recorder?.record(this.id, data);
    });
  }

  playFor(duration) {
    this.play();
    this.renderer.setFinish(() => {
      this.emit('finished')
    }, duration);
  }

  play() {
    this.renderer.setScene(this.scene);
  }

  toggle() {
    this.renderer.isPlaying ? this.stop() : this.resume();
  }

  stop() {
    this.renderer.stop();
  }

  resume() {
    this.renderer.start();
  }

  destroy() {
    this._cleanupScene();
    this.removeAllListeners()
  }

  _cleanupScene() {
    this.recorder?.save()
    this.renderer.clear();
    this.scene?.destroy();
    this.scene = null;
  }


  get id() {
    return this.schema?.id
  }
  
  get info() {
    return {
      isPlaying: this.renderer.isPlaying,
      schema: this.schema || {},
      id: this.schema?.id,
      props: this.props || {},
      timeRemaining: this.renderer.timeRemaining,
      isStatic: this.scene?.isStatic,
      duration: this.renderer.duration
    }
  }

}