import { isImageData, formatRGBAPixels } from '../utils/image.js';
import { EventEmitter } from 'events';
import Display from './Display.js';
import { ticker } from '../utils/animation.js';
import { Utils } from 'flipdisc'

let display;

class Renderer extends EventEmitter {

  constructor() {
    super();
    this.timer = null;
    this.shouldAutoRender = true;
    this.lastRenderData = null;
    display = Display.sharedInstance();

    this.start()
  }

  _renderModules() {
    return this.scene.modules.map((m) => m.render ? m.render() : null).filter((l) => l) || []
  }

  _resumeAllModules() {
    this.scene.modules.forEach((m) => m.resume === 'function' && m.resume())
  }

  _stopAllModules() {
    this.scene.modules.forEach((m) => m.stop === 'function' && m.stop())
  }

  setScene(scene) {
    this.scene = scene;
  }

  _mergeLayers(layers) {
    layers = layers.filter((l) => l).map((l) => {
      return isImageData(l) ? formatRGBAPixels(l, this.scene.width, this.scene.height) : l
    })
    
    return layers ? Utils.mergeFrames(layers) : null;
  }

  _render(inputData) {
    this._preRender()

    const data =  this._mergeLayers([...this.moduleImageData, inputData, this.scene.imageData])

    if (this._isNewImageData(data)) {
      display.send(data)
      this.emit('render', data)
      this.lastRenderData = data
    }
  }

  _preRender(inputData) {
    if (!this.scene.canvas) {
      this.scene.renderOnNextTickData = inputData
      this.scene.shouldRenderOnTick = true
    }
  }

  _renderBuffer() {
    this._render(this.scene.renderBuffer)
    console.log('render buffer')
    this.scene.shouldRenderOnTick = false
    this.scene.renderBuffer = null
  }

  tick(i, clock) {
    if (!this.scene) return

    if (this.scene.loop && !this.stopped) {
      this.scene.loop(i, clock) 
    }

    if (this.scene.shouldRenderOnTick) {
      this._renderBuffer()
    } else if (this.shouldAutoRender) {
      this._render()
    }
  }

  start(fps) {
    this.ticker = ticker(this.tick.bind(this), fps)
    this.ticker.start(fps)
  }

  stop() {
    this.stopped = true
    this._stopAllModules()
    this.ticker.stop();
  }

  resume() {
    this.stopped = false
    this._resumeAllModules();
    this.ticker.start()
  }

  get moduleImageData() {
    return this._renderModules()
  }

  _isNewImageData(data) {
    if (!this.lastRenderData) return true
    return !Utils.areArraysEqual(data, this.lastRenderData)
  }
}

const createRenderer = () => {
  return new Renderer();
}

export {
  Renderer,
  createRenderer
}