import { Application, Assets, utils, DisplayObject, Container, Graphics } from '@pixi/node';
import * as PIXI from '@pixi/node'
import Display from '../Display.js';
import Module from './Module.js';
import BaseView from '../views/BaseView.js';
import { layoutSetRenderer, removeLayoutRenderer } from 'pixi-flex-layout';
import { gsap } from 'gsap';

BaseView.registerPIXI(PIXI, gsap);

export default class PixiModule extends Module {
  constructor() {
    super();
    this.textView = null;
    this._destroyed = false;
  }

  async loadAsset(url) {
    return await Assets.load(url)
  }

  get app() {
    if (this._destroyed) return this._app;

    const { width, height } = Display.size()

    if (!this._app) {
      this._app = new Application({
        width: width,
        height: height,
        transparent: false,
        antialias: false,
        resolution: 1
      });
      layoutSetRenderer(this._app.renderer);
    }
    return this._app;
  }

 
  async add(view) {
    if (view instanceof BaseView) {
      await view.ready; 
    }
    this.stage.addChild(view);
  }

  remove(view) {
    this.stage.removeChild(view);
  }

  get stage() {
    return this.app.stage;
  }

  get renderer() {
    return this.app.renderer;
  }

  async getAllChildren() {
    return Promise.all(this.stage.children.map(child => child.ready))
  }

  async destroyAllChildren() {
    if (this.stage.children.length > 0) {
      this.stage.children.forEach(child => child.destroy())
    }
  }

  async destroy() {
    this._destroyed = true;
    try {
      await this.getAllChildren();
      removeLayoutRenderer(this.renderer);
      this.destroyAllChildren()
      PixiModule.removeAllTextures();
      Assets.reset();
      this.textView = null;
      this._app.destroy();
    } catch (e) {
      this.textView = null;
      try { this._app?.destroy(); } catch (_) {}
    }
    this._app = null;
  }

  render() {
    this.renderer.render(this.stage);
    return this.renderer.extract.pixels();
  }

  static removeAllTextures() {
    for (const key in utils.TextureCache) {
      const texture = utils.TextureCache[key];
      texture.destroy(true);
    }
  }

  static isValidInstance(view) {
    return view instanceof DisplayObject
  }

}

