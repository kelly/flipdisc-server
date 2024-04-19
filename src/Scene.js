import EventEmitter from 'events';
import { createCanvas } from 'node-canvas-webgl';
import Display from './Display.js';
import { ticker } from '../utils/animation.js';
import { PixiModule, ThreeModule, MatterModule } from './modules/index.js';
import { Utils } from 'flipdisc'
import { isImageData, formatRGBAPixels } from '../utils/Image.js';

const display = Display.sharedInstance()
const defaultOptions = {
  shouldAutoRender: true,
  loopInterval: 30
}

export default class Scene extends EventEmitter {

  constructor(options = {}) {
    super();
    this.options = { ...defaultOptions, ...options }; 
    this.canvas = createCanvas(display.width, display.height)
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
    const layers = this._renderModules()
    if (inputData) 
      layers.push(inputData)
    
    layers.push(this.imageData)
    const data = this._mergeLayers(layers)
    this.emit('update', data)
  }

  play() {
    const tick = this.tick.bind(this);
    const { loopInterval } = this.options;
    if (this.loop) 
      this.ticker = ticker(tick, loopInterval)
  }

  add(module) {
    // check to make sure is type of module
    this.modules.push(module)
  }

  tick(i, clock) {
    const { shouldAutoRender } = this.options;
    this.emit('tick')
    this.loop(i, clock)
    if (shouldAutoRender) 
      this.render()
  }

  stop() {
    // todo: stop all modules
    if (this.ticker) 
      this.ticker.stop();
  }

  resume() {
    // todo: resume all modules
    if (this.ticker) 
      this.ticker.start()
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

  destroy() {
    this.emit('unload')
    
    this.stop();
    this.modules.forEach(m =>  m.destroy())
    this.removeAllListeners();
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