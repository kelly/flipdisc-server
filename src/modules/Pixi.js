import { Application, Assets, utils, DisplayObject, Container } from '@pixi/node';
import Display from '../Display.js';
import Module from './Module.js';
import { initializeLayout, layoutSetRenderer, removeLayoutRenderer } from 'pixi-flex-layout';


Assets.init()
initializeLayout(DisplayObject.prototype, Container.prototype);

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

 
  add(view) {
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
    return Promise.all(this.app.stage.children.map(child => child.ready))
  }

  async destroyAllChildren() {
    if (this.app.stage.children.length > 0) {
      this.app.stage.children.forEach(child => child.destroy())
    }
  }

  async destroy() {
    this.getAllChildren().then(() => {
      removeLayoutRenderer(this.app.renderer);
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