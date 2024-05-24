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
    this._options = { ...defaults, ...options };
    this._options.maxWidth = this._options.maxWidth || BaseView.baseSize().width;
    this._text = text || '';
    this.fontName = this.options.fontName;
    this.isBitmapFont = bitmapFontForName(this.fontName) !== undefined;
    this.t = (this.isBitmapFont) ? await this.createBitmapText() : this.createText();
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
    this.font = bitmapFontForName(this.fontName);
    await Assets.load(fontPaths());

    const t = new BitmapText(this._text, {
      ...this.options,
      fontFamily: this.font.name,
      fontName: this.font.name,
      fontSize: this.font.size,
    });

    t.x = this.options.x || 0;
    t.y = this.options.y || 0;
    t.flex = true;

    this.updateLayoutForText(t);
    return t;
  }

  updateLayoutForText(t) {
    if (!this.isBitmapFont) return;
    t = t || this.t;
    const bounds = t.getBounds();
    const lines = bounds.height / this.font.size;
    this.layout.minHeight = lines * this.font.size;
    this.layout.minWidth = bounds.width;
  }

  marquee(direction = 'left', delay = 1000, speed = 1) {
    const bounds = this.t.getBounds();
    const distance = bounds.width - this.options.maxWidth;
    const duration = distance / speed;

    if (direction === 'left') {
      this.t.x = this.options.maxWidth;
      this.t.vx = -speed;
    } else {
      this.t.x = -bounds.width;
      this.t.vx = speed;
    }

    this.t.vy = 0;
    this.t.delay = delay;
    this.t.duration = duration;
    this.t.direction = direction;
    this.t.animate = true;
  }


  get options() {
    return this._options;
  }


  set options(value) {
    this._options = value;
    if (this.t) {
      this.t.style = new TextStyle({ ...this.options, fontFamily: this.fontName });
    }
  }


  set text(value) {
    this._text = value;
    this.ensureChildrenLoaded().then(() => {
      if (this.t) {
        this.t.text = this._text;
      }
      this.updateLayoutForText();
    })
  }
}
