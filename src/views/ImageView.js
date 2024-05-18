import { Assets, Texture, BaseTexture, Sprite, Container } from '@pixi/node'
import { isValidURL, urlExtension } from '../../utils/general.js'
import { loadImage, createCanvas } from 'node-canvas-webgl'
import BaseView from './BaseView.js'

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
    const texture = Texture.fromBuffer(canvas.toBuffer('raw'), image.width, image.height);
    return texture;
  }

  async _loadImage(url) {
    const image = urlExtension(url) ? await Assets.load(url) : await this._loadCanvasImage(url);
    return image;
  }

  async setWidth(value) {
    await this.ensureLoaded();    
    this.sprite.width = value;
  }

  async setHeight(value) {
    await this.ensureLoaded();
    this.sprite.height = value;
  }

  async initialize(asset) {
    const texture = isValidURL(asset) ? 
      await this._loadImage(asset) : 
      this._createTextureFromData(asset);

    this.sprite = Sprite.from(texture);
    this.addChild(this.sprite);

  }
}