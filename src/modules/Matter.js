import Matter from 'matter-js';
import Display from '../Display.js';

var { Engine, Render, Bodies, Composite, World } = Matter;

const defaultOptions = {
  hasWalls: false,
  tickRate: 4,
}

export default class MatterModule {

  constructor(canvas, options = {}) {
    this.options = { ...defaultOptions, ...options }
    this.canvas = canvas;

    this.load()
  }

  _initMatter() {
    this.engine = Engine.create();
    this.renderer = Render.create({
      canvas: this.canvas,
      engine: this.engine,
      options: {
        width: this.width,
        height: this.height,
        wireframes: false,
        showAngleIndicator: false,
        showVelocityIndicator: false,
      }
    });
  }

  _setupDefaultBodies() {
    if (this.options.hasWalls) 
      this.addWalls()
  }

  addWalls() {
    const { width, height } = Display.size()
    const wallOptions = {
      isStatic: true
    };

    const thickness = 1
    const walls = [
      Bodies.rectangle(0, height + thickness, width, thickness, wallOptions),  // bottom
      Bodies.rectangle(-thickness, height / 2, thickness, height, wallOptions), // left
      Bodies.rectangle(width + thickness, height / 2, thickness, height, wallOptions), // right
    ]

    this.add(walls)
  }

  async load() {
    if (this.isLoaded) return

    this._initMatter()
    this._setupDefaultBodies();

    Render.run(this.renderer);
  }

  add(bodies) {
    return Composite.add(this.engine.world, bodies)
  }

  remove(bodies) {
    return Composite.remove(this.engine.world, bodies)
  }

  render(data) {
    Engine.update(this.engine, this.options.tickRate); 
  }

  get isLoaded() {
    return this.engine !== undefined
  }

  destroy() {
    Render.stop(this.renderer);
    this.engine = null;
    this.renderer = null;
  }

}