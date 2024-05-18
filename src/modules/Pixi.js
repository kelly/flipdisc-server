import { Application, Assets, BitmapText, TextStyle, Text, Texture, Cache, Sprite, utils, BaseTexture, DisplayObject, Container } from '@pixi/node';
import path from 'path';
import Display from '../Display.js';
import appRoot from 'app-root-path';
import { isValidURL } from '../../utils/general.js';
import Module from './Module.js';
import { initializeLayout, layoutSetRenderer, removeLayoutRenderer } from 'pixi-flex-layout';

const fonts = [
  { path: 'tb-8-2.fnt', size: 6, name: 'tb-8' },
  { path: 'CG-pixel-3x5-mono.fnt', size: 5, name: 'cg' },
  { path: 'tom-thumb.fnt', size: 6, name: 'tom-thumb' }
];

const fontPath = './resources/fonts'
const defaults = {
  fontName: 'cg',
  fontSize: 5,
  fill: 0xFFFFFF,
  wordWrap: true,
  fontWeight: 'bold',
}

Assets.init()
initializeLayout(DisplayObject.prototype, Container.prototype);

export default class PixiModule extends Module {
  constructor() {
    super();
    this.textView = null;

    this.load()
  }

  async load() {
    await Assets.load(this.fontPaths)
  }

  async loadAsset(url) {
    return await Assets.load(url)
  }
  
  static get hasLoadedFonts() {
    return Cache.has(path.join(appRoot.path, fontPath, fonts[0].path))
  }

  get fontPaths() {
    return fonts.map(font => path.join(appRoot.path, fontPath, font.path))
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

  _bitmapFontForName(name) {
    return fonts.find(font => font.name === name)
  }

  _createCenteredSprite(texture) {
    const { width, height } = Display.size()
    const sprite = Sprite.from(texture)
    sprite.anchor.set(0.5);
    sprite.x = width / 2;
    sprite.y = height / 2;

    return sprite;
  }

  _textureFromData(data) {    
    const baseTexture = BaseTexture.from(data)
    return new Texture(baseTexture)
  }

  async createImage(image) {
    const texture  = isValidURL(image) ? await this.loadAsset(image) : this._textureFromData(image)
    const sprite = this._createCenteredSprite(texture)
    this.add(sprite)

    return sprite;
  }

  async createBitmapText(text, options) {
    const { fontName } = options
    const font = this._bitmapFontForName(fontName)
    await Assets.load(this.fontPaths)
    const t = new BitmapText(text, {
      ...options,
      fontFamily: font.name,
      fontName: font.name,
      fontSize: font.size,
    })
    return t;
  }

  autoLayoutView(views, options) {
    const { startX = 0, startY = 0, spacing = 0, direction = 'vertical' } = options;
    let acc = 0;
  
    views.forEach((view) => {
      if (view instanceof DisplayObject) {
        view.calculateBounds();
        const width = view.width;
        const height = view.height;
  
        if (direction === 'horizontal') {
          view.x = startX + acc;
          view.y = startY;
          acc += width + spacing;
        } else if (direction === 'vertical') {
          view.x = startX;
          view.y = startY + acc;
          acc += height + spacing;
        }
      }
    });
  
    return views;
  }

  createMultilineTextView(lines, layoutOptions = {}) { 
    lines = lines.map(line => this.createBitmapText(line.text, line.options));
    return this.autoLayoutView(lines, layoutOptions);
  }

  updateMultilineTextView(lines, text, layoutOptions = {}) {
    lines.forEach((line, index) => {
      line.text = text[index];
    })
    return this.autoLayoutView(lines, layoutOptions)
  }

  createTextView(text, options) {
    const { fontName } = options
    const style = new TextStyle({
      ...options,
      fontFamily: fontName
    })
    const t = new Text(text, style);
    return t;
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

  async setText(options) { 
    const { text } = options;
    options = { ...defaults, ...options };
    
    if (!this.textView) {
      this.textView = this._bitmapFontForName(options.fontName) ?
        await this.createBitmapText(text, options) : 
        this.createTextView(text, options);
      this.add(this.textView)
    }
    this.textView = text;
  }
  
  updateText(text, x, y) {
    const view = this.textView;
    view.text = text;
    
    if (x !== undefined && y !== undefined) {
      view.x = x;
      view.y = y;
    }
    return view;
  }

  async destroyAllChildren() {
    if (this.app.stage.children.length > 0) {
      this.app.stage.children.forEach(child => child.destroy())
    }
  }

  async destroy() {
    Promise.all(this.app.stage.children.map(child => child.ready)).then(() => {
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