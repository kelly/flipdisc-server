import EventEmitter from 'events';
import { createCanvas } from 'node-canvas-webgl';
import Display from './Display.js';
import { ticker } from '../utils/animation.js';
import { PixiModule, ThreeModule, MatterModule, UserInputModule, Module } from './modules/index.js';
import  * as modules from './modules/index.js';
import { Utils } from 'flipdisc';
import { isImageData, formatRGBAPixels } from '../utils/Image.js';



const defaultOptions = {
  shouldAutoRender: true,
  loopFps: 30
};

class Scene extends EventEmitter {
  constructor(options = {}) {
    super();
    const { width, height } = Display.size();
    this.options = { ...defaultOptions, ...options };
    this.loopFps = this.options.loopFps;
    this.shouldAutoRender = this.options.shouldAutoRender;
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

  _renderModules() {
    return this.modules.map((m) => (m.render ? m.render() : null)).filter((l) => l) || [];
  }

  _stopAllModules() {
    this.modules.forEach((m) => typeof m.stop === 'function' && m.stop());
  }

  _resumeAllModules() {
    this.modules.forEach((m) => typeof m.resume === 'function' && m.resume());
  }

  _mergeLayers(layers) {
    layers = layers.filter((l) => l).map((l) => (isImageData(l) ? formatRGBAPixels(l, this.width, this.height) : l));
    return layers ? Utils.mergeFrames(layers) : null;
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

  render(inputData) {
    this.shouldRenderOnTick = true;
    this.renderBuffer = inputData;
  }

  _renderIfNeeded() {
    if (this.shouldRenderOnTick) 
      return this._renderBuffer();

    if (this.shouldAutoRender && this.loops.length > 0) 
      this._render();
  }

  play() {
    const tick = this.tick.bind(this);
    this.ticker?.stop();
    this.ticker = ticker(tick, 1000 / this.loopFps);
  }

  addModule(module) {
    if (module instanceof Module || module instanceof EventEmitter) {
      return this.modules.push(module);
    }
  }

  add(view) {
    return this.moduleForView(view)?.add(view);
  }

  remove(view) {
    return this.moduleForView(view)?.remove(view);
  }

  tick(i, clock) {
    const now = Date.now();
    this.loops.forEach(loop => {
      if (now - loop.lastExecution >= 1000 / loop.fps) {
        loop.fn(i, clock);
        loop.lastExecution = now;
      }
    });
    this._renderIfNeeded()
  }

  stop() {
    this.stopped = true;
    this._stopAllModules();
    this.ticker?.stop();
  }

  resume() {
    this.stopped = false;
    this._resumeAllModules();
    this.ticker?.start();
  }

  useLoop(fn, fps = this.loopFps) {
    this.loops.push({ fn, fps, lastExecution: 0 });
  }

  useShader(shader, uniform, update, fps = 50) {
    const loopFn = update
      ? (i, clock) => {
          const uniform = this.three.uniforms;
          update(uniform, clock);
        }
      : this.three.updateShaderDefault.bind(this.three);
    this.three.createShader(shader, uniform);
    this.useLoop(loopFn, fps);
  }

  async useImage(image) {
    try {
      await this.pixi.createImage(image);
    } catch (e) {
      console.error('Error creating image', e);
    }
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
    return !this.loop;
  }

  destroy() {
    this.emit('unload');
    this.stop();
    this.modules.forEach((m) => m.destroy());
    this.removeAllListeners();
    this.ticker = null;
    this.canvas = null;
    this.loop = null;
    this.modules = [];
  }

  moduleForView(v) {
    const module =  Object.values(modules).find((m) => {
      if (typeof m.isValidInstance === 'function') {
        return m.isValidInstance(v)
      }
    });
    return this.findOrCreateModule(module);
  }

  findOrCreateModule(c) {
    let m = this.modules.find((m) => m instanceof c);
    if (!m) {
      m = new c();
      this.addModule(m)
    }
    return m;
  }

  get three() {
    if (!this._three) {
      this._three = new ThreeModule(this.canvas);
      this.addModule(this._three);
    }
    return this._three;
  }

  get pixi() {
;    if (!this._pixi) {
      this._pixi = new PixiModule(this.canvas);
      this.addModule(this._pixi);
    }
    return this._pixi;
  }

  get matter() {
    if (!this._matter) {
      this._matter = new MatterModule(this.canvas);
      this.addModule(this._matter);
    }
    return this._matter;
  }

  get user() {
    if (!this._user) {
      this._user = new UserInputModule();
      this.addModule(this._user);
    }
    return this._user;
  }

  get context() {
    return this.canvas.getContext('2d');
  }

  get moduleImageData() {
    return this._renderModules();
  }

  _isNewImageData(data) {
    if (!this.lastRenderData) return true;
    return !Utils.areArraysEqual(data, this.lastRenderData);
  }
}

function createScene(options) {
  return new Scene(options);
}

export { Scene as default, createScene };