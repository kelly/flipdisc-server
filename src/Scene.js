import EventEmitter from 'events';
import { createCanvas } from 'node-canvas-webgl';
import Display from './Display.js';
import { PixiModule, ThreeModule, MatterModule, UserInputModule, isModule } from './modules/index.js';
import  * as modules from './modules/index.js';
import { Utils } from 'flipdisc';
import { isImageData, formatRGBAPixels } from '../utils/image.js';

const defaultOptions = {
  shouldAutoRender: true,
  fps: 35
};

class Scene extends EventEmitter {
  constructor(options = {}) {
    super();

    const { width, height } = Display.size();
    options = { ...defaultOptions, ...options };
    this.fps = options.fps;
    this.shouldAutoRender = options.shouldAutoRender;
    this.lastRenderData = null;
    this.canvas = createCanvas(width, height);
    this.modules = [];
    this.loops = [];
  }

  async load() {
    const promise = await Promise.all(this.modules.map((m) => m.load()));
    this.emit('loaded');
    return promise;
  }

  render(inputData) {
    this.shouldRenderOnTick = true;
    this.renderBuffer = inputData;
  }

  add(...objs) {
    const addPromises = objs.map(obj => {
      if (isModule(obj)) {
        return this._addModule(obj);
      }
      return this._moduleForView(obj)?.add(obj).then(() => {
        this.shouldRenderOnTick = true;
      });
    });
    
    return Promise.all(addPromises);
  }

  remove(...objs) {
    objs.forEach(obj => {
      if (isModule(obj)) {
        this.modules = this.modules.filter(m => m !== obj);
      } else {
        const module = this._moduleForView(obj);
        if (module) {
          module.remove(obj);
          this.shouldRenderOnTick = true;
        }
      }
    });
  }
  
  finish() {
    this.emit('finished');
  }

  clear() {
    this.context.clearRect(0, 0, this.width, this.height);
  }

  useLoop(fn, fps = this.fps) {
    this.loops.push({ fn, fps, lastExecution: 0 });
  }

  useShader(shader, uniform, update, fps = this.fps) {
    const loopFn = update
      ? (i, clock) => {
          const uniform = this.three.uniforms;
          update(uniform, clock);
        }
      : this.three.updateShaderDefault.bind(this.three);
    this.three.createShader(shader, uniform);
    this.useLoop(loopFn, fps);
  }

  destroy() {
    this.emit('unload');
    this.modules.forEach((m) => m.destroy());
    this.removeAllListeners();
    this.canvas = null;
    this.loops = null;
    this.modules = [];
  }

  _addModule(module) {
    return this.modules.push(module);
  }

  _renderModules() {
    return this.modules.map((m) => (m.render 
      ? m.render() 
      : null)).filter((l) => l) || [];
  }

  _mergeLayers(layers) {
    layers = layers.filter((l) => l)
      .map((l) => (isImageData(l)
      ? formatRGBAPixels(l, this.width, this.height)
      : l));
    return layers.length ? Utils.mergeFrames(layers) : null;
  }

  _render(inputData) {
    if (!this.canvas) return;
    const data = this._mergeLayers([...this.moduleImageData, inputData, this.imageData]);
    if (this._isNewImageData(data)) {
      this.emit('update', data);
      this.lastRenderData = data;
    }
  }

  _renderBuffer() {
    this._render(this.renderBuffer);
    this.shouldRenderOnTick = false;
    this.renderBuffer = null;
  }

  _renderIfNeeded() {
    if (this.shouldRenderOnTick) 
      return this._renderBuffer();

    if (this.shouldAutoRender && this.loops.length > 0) 
      this._render();
  }

  _tick(i, clock) {
    const now = Date.now();
    this.loops.forEach(loop => {
      if (now - loop.lastExecution >= 1000 / loop.fps) {
        loop.fn(i, clock);
        loop.lastExecution = now;
      }
    });
    this._renderIfNeeded()
  }

  _moduleForView(v) {
    const module = Object.values(modules)
      .find((m) => typeof m.isValidInstance === 'function' && m.isValidInstance(v)
    );
    return this._findOrCreateModule(module);
  }

  _findOrCreateModule(c) {
    let m = this.modules.find((m) => m instanceof c);
    if (!m) {
      m = new c(this.canvas);
      this._addModule(m)
    }
    return m;
  }

  get loop() {
    return this._tick.bind(this);
  }

  get three() {
    if (!this._three) {
      this._three = new ThreeModule(this.canvas);
      this._addModule(this._three);
    }
    return this._three;
  }

  get pixi() {
   if (!this._pixi) {
      this._pixi = new PixiModule(this.canvas);
      this._addModule(this._pixi);
    }
    return this._pixi;
  }

  get matter() {
    if (!this._matter) {
      this._matter = new MatterModule(this.canvas);
      this._addModule(this._matter);
    }
    return this._matter;
  }

  get user() {
    if (!this._user) {
      this._user = new UserInputModule();
      this._addModule(this._user);
    }
    return this._user;
  }

  get context() {
    return this.canvas?.getContext('2d');
  }

  get moduleImageData() {
    return this._renderModules();
  }

  get width() {
    return this.canvas.width;
  }

  get height() {
    return this.canvas.height;
  }

  get imageData() {
    return this.canvas?.toBuffer('raw');
  }

  get stage() {
    return this.pixi.stage;
  }

  get isStatic() {
    return this.loops.length === 0;
  }

  _isNewImageData(data) {
    if (Utils.isEmptyArray(data)) return false;
    if (!this.lastRenderData) return true;
    return !Utils.areArraysEqual(data, this.lastRenderData);
  }
}

function createScene(options) {
  return new Scene(options);
}

export { Scene as default, createScene };