import { Container, Assets, BitmapText, TextStyle, Text } from '@pixi/node';
import BaseView from './BaseView.js';
import path from 'path';
import appRoot from 'app-root-path';

const fonts = [
  { path: 'tb-8-2.fnt', size: 6, name: 'tb-8' },
  { path: 'CG-pixel-3x5-mono.fnt', size: 5, name: 'cg' },
  { path: 'tom-thumb.fnt', size: 6, name: 'tom-thumb' }
];

const fontPath = './resources/fonts';

const defaults = {
  fontName: 'cg',
  fontSize: 5,
  fill: 0xFFFFFF,
  fontWeight: 'bold',
};

function bitmapFontForName(name) { return fonts.find(font => font.name === name) }
function fontPaths() { return fonts.map(font => path.join(appRoot.path, fontPath, font.path))}

export default class TextView extends BaseView {

  async initialize(text, options = {}) {
    this.options = { ...defaults, ...options };
    this.options.maxWidth = this.options.maxWidth || BaseView.baseSize().width;
    this._text = text || '';
    this.fontName = this.options.fontName;
    const isBitmapFont = bitmapFontForName(this.fontName) !== undefined;
    this.t = (isBitmapFont) ? await this.createBitmapText() : this.createText();
    this.addChild(this.t);
  }

  createText() {
    const style = new TextStyle({
      ...this.options,
      fontFamily: this.fontName,
    });

    const t = new Text(this._text, style);
    t.x = this.options.x || 0;
    t.y = this.options.y || 0;
    return t;
  }

  async createBitmapText() {
    const font = bitmapFontForName(this.fontName);
    await Assets.load(fontPaths());

    const t = new BitmapText(this._text, {
      ...this.options,
      fontFamily: font.name,
      fontName: font.name,
      fontSize: font.size,
    });

    t.x = this.options.x || 0;
    t.y = this.options.y || 0;
    t.flex = true;

    const bounds = t.getBounds();
    const lines = bounds.height / font.size;
    this.layout.minHeight = lines * font.size;
    this.layout.minWidth = bounds.width;

    return t;
  }

  set text(value) {
    this._text = value;
    this.ensureChildrenLoaded().then(() => {
      if (this.t) {
        this.t.text = this._text;
      }
    })
  }
}
