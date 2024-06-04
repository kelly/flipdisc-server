import { Application, Assets, utils, DisplayObject, Container, Graphics } from '@pixi/node';
import Display from '../Display.js';
import Module from './Module.js';
import BaseView from '../views/BaseView.js';
import { initializeLayout, layoutSetRenderer, removeLayoutRenderer } from 'pixi-flex-layout';
import { gsap } from 'gsap';
import { PixiPlugin } from 'gsap/dist/PixiPlugin.js';

const init = () => {
  Assets.init()
  initializeLayout(DisplayObject.prototype, Container.prototype);
  gsap.registerPlugin(PixiPlugin);
  PixiPlugin.registerPIXI({
    DisplayObject: DisplayObject,
    Graphics: Graphics,
  })
}

init();

export default class PixiModule extends Module {
  constructor() {
    super();
    this.textView = null;
  }

  async loadAsset(url) {
    return await Assets.load(url)
  }

  get app() {
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
    this.getAllChildren().then(() => {
      removeLayoutRenderer(this.renderer);
      this.destroyAllChildren()
      PixiModule.removeAllTextures();
      Assets.reset();
      this.textView = null;
      this.app.destroy();
    })
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

