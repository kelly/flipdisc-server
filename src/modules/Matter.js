import Matter from 'matter-js';

var { Engine, Render, Bodies, Composite } = Matter;

const defaultOptions = {
  hasWalls: true,
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
      this._setupBodiesWalls()
  }

  _setupBodiesWalls() {
    const wallOptions = {
      isStatic: true,
      render: {
        fillStyle: "white"
      }
    };

    const thickness = 1
    const walls = [
      Bodies.rectangle(0, this.height + thickness, this.width, thickness, wallOptions),  // bottom
      Bodies.rectangle(-thickness, this.height / 2, thickness, this.height, wallOptions), // left
      Bodies.rectangle(this.width + thickness, this.height / 2, thickness, this.height, wallOptions), // right
    ]

    this.add(walls)
  }

  async load() {
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

  destroy() {
    Render.stop(this.renderer);
    this.engine = null;
    this.renderer = null;
  }

}