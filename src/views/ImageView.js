import { Assets, Texture, BaseTexture, Sprite, Graphics } from '@pixi/node'
import { isValidURL, urlExtension } from '../../utils/general.js'
import { loadImage, createCanvas } from 'node-canvas-webgl'
import BaseView from './BaseView.js'
import { dither } from '../../utils/image.js'

export default class ImageView extends BaseView {

  _createTextureFromData(data) {
    const baseTexture = BaseTexture.from(data);
    return new Texture(baseTexture);
  }

  // TODO: remove this with PIXI 8, you can specify the format
  async _loadCanvasImage(url) {
    const image = await loadImage(url);
    const canvas = createCanvas(image.width, image.height);


    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    let imageData = canvas.toBuffer('raw');

    if (this._dither) {
      imageData = dither(imageData, image.width);
    }

    
    const texture = Texture.fromBuffer(imageData, image.width, image.height);
    return texture;
  }

  async _loadImage(url) {
    const image = urlExtension(url) && !this._dither ? await Assets.load(url) : await this._loadCanvasImage(url);
    return image;
  }

  set image(image) {
    this.setImage(image);
  }

  async setImage(image) {
    this._image = image;      
    await this.load()
  }

  get image() {
    return this._image;
  }

  get aspectRatio() {
    return this.sprite.width / this.sprite.height;
  }

  async setSize(width, height) {
    await this.ensureLoaded();
    this._width = width
    this._height = height
    this.sprite.width = width;
    this.sprite.height = height;
  }

  async fitWidth(width) {
    await this.ensureLoaded();
    width = width || BaseView.baseSize().width
    this.setSize(width, width * this.aspectRatio)
  }

  async fitHeight(height) {
    await this.ensureLoaded();
    height = height || BaseView.baseSize().height
    this.setSize(height * this.aspectRatio, height)
  }

  async border(width = 1, color = 0xFFFFFF) {
    await this.ensureLoaded();
    this.border = new Graphics();
    this.border.lineStyle(width, color);
    this.border.drawRect(0, 0, this.sprite.width, this.sprite.height);
    this.border.endFill();
    this.border.flex = true;
    this.border.layout.fromConfig({ 
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0 });
    this.addChild(this.border);
  }

  async center() {
    await this.ensureLoaded();
    const { width, height } = BaseView.baseSize();
    this.sprite.x = width / 2 - this.sprite.width / 2;
    this.sprite.y = height / 2 - this.sprite.height / 2;
  }

  async load() {
    const texture = isValidURL(this.image) ? 
      await this._loadImage(this.image) : 
      this._createTextureFromData(this.image);

    if (this.sprite) {
      this.sprite.texture = texture;
    } else {
      this.sprite = Sprite.from(texture);
      this.addChild(this.sprite);
    }
  }

  async initialize(image, options = {}) {
    this._image = image;
    this._dither = options.dither || false;
    await this.load();
  }
}