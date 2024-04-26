import { Application, Assets, BitmapText, TextStyle, Text } from '@pixi/node';
import path from 'path';
import Display from '../Display.js';
import appRoot from 'app-root-path';

const fonts = [
  { 
    path: 'tb-8-2.fnt', 
    size: 8,
    name: 'tb-8' 
  }, {
    path: 'CG-pixel-3x5-mono.fnt',
    size: 5,
    name: 'cg'
  }, {
    path: 'tom-thumb.fnt',
    size: 5,
    name: 'tom-thumb'
  }
]
const fontPath = './resources/fonts'
const defaults = {
  fontName: 'cg',
  fontSize: 5,
  fill: 0xFFFFFF,
  fontWeight: 'bold'
}

export default class PixiModule {
  constructor() {
    this.textView = null;
    this.isFontLoaded = false;
  }

  async load() {
    await Assets.init()
    return Assets.load(this.fontPaths)
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
    }
    return this._app;
  }

  _bitmapFontForName(name) {
    return fonts.find(font => font.name === name)
  }

  _createBitmapText(text, options) {
    const { width, height } = Display.size()
    const { fontName, fill, maxWidth = width } = options
    const font = this._bitmapFontForName(fontName)
    return new BitmapText(text, {
      fontFamily: font.name,
      fontName: font.name,
      fontSize: font.size,
      fill: fill,
      maxWidth: maxWidth,
    });
  }

  _createTextView(text, options) {
    const { fontName, fontSize, fontStyle, fontWeight, fill, maxWidth } = options

    const style = new TextStyle({
      fontFamily: fontName,
      fontSize: fontSize,
      fontStyle: fontStyle,
      fontWeight: fontWeight,
      fill: fill,
      wordWrap: true,
      wordWrapWidth: maxWidth
    })
    return new Text(text, style);
  }

  add(view) {
    this.stage.addChild(view);
  }

  get stage() {
    return this.app.stage;
  }

  get renderer() {
    return this.app.renderer;
  }

  setText(text, x = 0, y = 0, options = {}) { 
    options = { ...defaults, ...options }
    
    let t = this.textView
    if (!t) {
      this.textView = this._bitmapFontForName(options.fontName) ? this._createBitmapText(text, options) : this._createTextView(text, options);
      this.add(this.textView);
    }
    return this.updateText(text, x, y)
  }

  updateText(text, x, y) {
    const view = this.textView;
    view.text = text;
    if (x && y) {
      view.x = x;
      view.y = y; 
    }
    return view;
  }

  destroy() {
    // Assets.unload(this.fontPaths)
    this.textView = null;
    this.isFontLoaded = false;
    this.app.destroy();
  }

  render() {
    this.renderer.render(this.stage);
    return this.renderer.extract.pixels();
  }
}