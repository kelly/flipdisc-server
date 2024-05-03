import EventEmitter from 'events';
import { createCanvas } from 'node-canvas-webgl';
import Display from './Display.js';
import { ticker } from '../utils/animation.js';
import { PixiModule, ThreeModule, MatterModule } from './modules/index.js';
import { Utils } from 'flipdisc'
import { isImageData, formatRGBAPixels } from '../utils/Image.js';
import createTask from '../src/SceneTask.js';

const defaultOptions = {
  shouldAutoRender: true,
  loopInterval: 30
}


class Scene extends EventEmitter {

  constructor(options = {}) {
    super();
    const { width, height } = Display.size()
    this.options = { ...defaultOptions, ...options }; 
    this.loopInterval = this.options.loopInterval;
    this.shouldAutoRender = this.options.shouldAutoRender;
    this.canvas = createCanvas(width, height)
    this.modules = []
  }

  async load() {
    const promise = await Promise.all(this.modules.map((m) => m.load()))
    this.emit('loaded')

    return promise;
  }

  loadFonts() {
    // do this another way
    const text = this.text;
  }

  _renderModules() {
    return this.modules.map((m) => m.render ? m.render() : null).filter((l) => l) || []
  }

  _mergeLayers(layers) {
    layers = layers.map((l) => {
      return isImageData(l) ? formatRGBAPixels(l, this.width, this.height) : l
    })
    return Utils.mergeFrames(layers)
  }

  render(inputData) {
    if (this.stopped) return

    const layers = this._renderModules()
    if (inputData) 
      layers.push(inputData)
    
    layers.push(this.imageData)
    const data = this._mergeLayers(layers)
    this.emit('update', data)
  }

  play() {
    const tick = this.tick.bind(this);
    const loopInterval = this.loopInterval;

    if (this.loop) 
      this.ticker = ticker(tick, loopInterval)
  }

  add(module) {
    // check to make sure is type of module
    this.modules.push(module)
  }

  tick(i, clock) {
    this.emit('tick')
    this.loop(i, clock)
    if (this.shouldAutoRender) 
      this.render()
  }

  stop() {
    this.stopped = true
    // todo: stop all modules
    if (this.ticker) 
      this.ticker.stop();
  }

  resume() {
    this.stopped = false
    // todo: resume all modules
    if (this.ticker) 
      this.ticker.start()
  }

  useLoop(loop, interval = this.loopInterval) {
    this.loop = loop;
    this.loopInterval = interval;
  }

  get width() {
    return this.canvas.width;
  }

  get height() {
    return this.canvas.height;
  }

  get imageData() {
    return this.canvas.toBuffer('raw')
  }

  get stage() {
    return this.pixi.stage
  }

  get isStatic() {
    return !this.loop;
  }

  destroy() {
    this.emit('unload')
    
    this.stop();
    this.modules.forEach(m =>  m.destroy())
    this.removeAllListeners();
    this.ticker = null;
    this.canvas = null;
    this.loop = null
    this.modules = [];
  }

  // simple getters for dealing with commonly used modules

  get three() {
    if (!this._three) {
      this._three = new ThreeModule(this.canvas);
      this.add(this._three)
    }
    return this._three;
  }

  get text() {
    return this.pixi;
  }

  get pixi() {
    if (!this._pixi) {
      this._pixi = new PixiModule();
      this.add(this._pixi)
    }
    return this._pixi;
  }

  get matter() {
    if (!this._matter) {
      this._matter = new MatterModule(this.canvas);
      this.add(this._matter)
    }
    return this._matter;
  }

}

function createScene(options) {
  return new Scene(options)
}

export { Scene as default, createScene }