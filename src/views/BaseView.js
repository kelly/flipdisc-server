import { Container } from '@pixi/node';
import Display from '../Display.js';
import DitherFilter from './filters/DitherFilter.js';
import { initializeLayout } from 'pixi-flex-layout';
import { PixiPlugin } from 'gsap/dist/PixiPlugin.js';

export default class BaseView extends Container {
  constructor(...props) {
    super();
    this.flex = true;
    this.isLoading = true;
    this.ready = this.initialize(...props ).then(() => {
      this.isLoading = false;
    });
  }

  async setLayout(style) {
    await this.ensureChildrenLoaded()
    this.layout.fromConfig(style);
  }

  async ensureLoaded() {
    await this.ready;
  }

  async ensureChildrenLoaded() {
    const childPromises = this.children.map(child => child.ready ? child.ready : Promise.resolve());
    await Promise.all(childPromises);
  }

  async addChildReady(...children) {
    await this.ensureLoaded() &&  await this.ensureChildrenLoaded();
    super.addChild(...children);
  }

  async getChildren() {
    await this.ensureChildrenLoaded();
    return this.children;
  }

  static baseSize() {
    return Display.size()
  }

  static registerPIXI(PIXI, gsap) {
    initializeLayout(PIXI.DisplayObject.prototype, PIXI.Container.prototype);
    gsap.registerPlugin(PixiPlugin);
    PixiPlugin.registerPIXI({
      DisplayObject: PIXI.DisplayObject,
      Graphics: PIXI.Graphics,
    })
  }

  dither() {
    const d = DitherFilter()
    this.filters = [...this.filters, d];
  }

  async initialize(...props) {
    // Initialization logic here. Override in subclasses if needed.
    // Access props using the props parameter
  }
}