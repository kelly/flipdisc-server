import EventEmitter from 'events';
import { createTimer } from '../utils/timer.js';
import Display from './Display.js';

export default class Playing extends EventEmitter {
  
  constructor() {
    super();
    this.scene = null;
    this.isPlaying = false;
    this.timer = null;
  }

  async set(item) {
    const { sceneObj, props, duration } = item;
    const { scene, schema } = sceneObj;
    
    if (this.scene)
      this.cleanupScene()

    this.schema = schema;
    this.props = props;
    this.duration = duration;

    await this._setup(scene, props);

    this.isLoaded = await this.load()

    duration !== undefined ? this.playFor(duration) : this.play();

    return this
  }

  async load() {
    return await this.scene.load();
  }

  async _setup(scene, props) {
    try {
      this.scene = await scene(props)
    } catch (e) {
      console.error('Error setting up scene', e)
      this.emit('finished')
      return;
    }
    this.scene.on('update', (data) => {
      this.emit('update', data);
      Display.sharedInstance().send(data);
    });
  }

  playFor(duration) {
    this.play();
    this.timer = createTimer(() => {
      this.stop();
      this.emit('finished')
    }, duration);
  }

  play() {
    this.scene?.play();
    this.isPlaying = true;
  }

  toggle() {
    this.isPlaying ? this.stop() : this.resume();
  }

  stop() {
    this.scene?.stop();
    this.timer?.pause();
    this.isPlaying = false;
  }

  resume() {
    this.isPlaying = true;
    this.timer?.resume();
    this.scene?.resume();
  }

  cleanupScene() {
    this.timer?.clear();
    this.timer = null;
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
      schema: this.schema || {},
      id: this.schema?.id,
      props: this.props || {},
      timeRemaining: this.timer?.getTimeRemaining(),
      isStatic: this.scene?.isStatic,
      duration: this.duration
    }
  }

}