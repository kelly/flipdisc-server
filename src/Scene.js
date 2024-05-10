import EventEmitter from 'events';
import { createCanvas } from 'node-canvas-webgl';
import Display from './Display.js';
import { ticker } from '../utils/animation.js';
import { PixiModule, ThreeModule, MatterModule, UserInputModule } from './modules/index.js';
import { Utils } from 'flipdisc'
import { isImageData, formatRGBAPixels } from '../utils/Image.js';

const defaultOptions = {
  shouldAutoRender: true,
  loopInterval: 30
}

class Scene extends EventEmitter {

  constructor(options = {}) {
    super();
    const { width, height } = Display.size()
    this.options = { ...defaultOptions, ...options }; 
    this.loop = null;
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

  _stopAllModules() {
    this.modules.forEach((m) => m.stop === 'function' && m.stop())
  }

  _resumeAllModules() {
    this.modules.forEach((m) => m.resume === 'function' && m.resume())
  }

  _mergeLayers(layers) {
    layers = layers.filter((l) => l).map((l) => {
      return isImageData(l) ? formatRGBAPixels(l, this.width, this.height) : l
    })
    
    return layers ? Utils.mergeFrames(layers) : null;
  }

  _render(inputData) {
    if (!this.canvas) {
      // this should only happen in a weird loading state
      this.renderOnNextTickData = inputData
      this.shouldRenderOnTick = true
    }
    const layers = this._renderModules()
    if (inputData) 
      layers.push(inputData)
    
    layers.push(this.imageData)
    const data = this._mergeLayers(layers)
    if (data) this.emit('update', data)
  }

  _renderBuffer() {
    this._render(this.renderOnNextTickData)
    this.shouldRenderOnTick = false
    this.renderOnNextTickData = null
  }

  render(inputData) {
    this.shouldRenderOnTick = true
    this.renderOnNextTickData = inputData
  }

  play() {
    const tick = this.tick.bind(this);
    const loopInterval = this.loopInterval;
    if (this.ticker) this.ticker.stop();
    this.ticker = ticker(tick, loopInterval)
  }

  add(module) {
    // check to make sure is type of module
    this.modules.push(module)
  }

  tick(i, clock) {
    this.emit('tick')

    if (this.shouldRenderOnTick) {
      this._renderBuffer()
    } else if (this.loop) {
      this.loop(i, clock) 
      if (this.shouldAutoRender) this._render()
    }
  }

  stop() {
    this.stopped = true
    this._stopAllModules()
    if (this.ticker) this.ticker.stop();
  }

  resume() {
    this.stopped = false
    this._resumeAllModules();
    if (this.ticker) this.ticker.start()
  }

  useLoop(loop, interval = this.loopInterval) {
    this.loop = loop;
    this.loopInterval = interval;
  }

  useShader(shader, uniform, update, fps = 30) {
    let loopFn
    if (update) {
      loopFn = (i, clock) => {
        const uniform = this.three.uniforms;
        update(uniform, clock)
      }
    } else {
      loopFn = this.three.updateShaderDefault.bind(this.three);
    }
    this.three.createShader(shader, uniform)
    this.loop = loopFn;
    this.loopInterval = fps;
  }

  async useImage(image) {
    try {
      await this.pixi.createImage(image)
    } catch (e) {
      console.error('Error creating image', e)
    }
  }
 
  get width() {
    return this.canvas.width;
  }

  get height() {
    return this.canvas.height;
  }

  get imageData() {
    // For some reason sometime canvas is null here. How do we want to handle that?
    return this.canvas?.toBuffer('raw')
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

  get user() {
    if (!this._user) {
      this._user = new UserInputModule();
      this.add(this._user)
    }
    return this._user;
  }
}

function createScene(options) {
  return new Scene(options)
}

export { Scene as default, createScene }