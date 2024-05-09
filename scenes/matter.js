import Scene from '../src/Scene.js';
import Matter from "matter-js";

const defaults = {
  maxBodies: 100,
  friction: 0.1,
  restitution: 0.9,
  size: 5,
  hasWalls: false
}

const schema = {
  title: 'Matter',
  description: 'A physics simulation using matter.js.',
  properties: {
    hasWalls: {
      type: 'boolean',
      default: defaults.hasWalls,
    },
    maxBodies: {
      type: 'number',
      default: defaults.maxBodies,
      min: 1,
      max: 1000
    },
    friction: {
      type: 'number',
      default: defaults.friction,
      min: 0,
      max: 1
    },
    restitution: {
      type: 'number',
      default: defaults.restitution,
      min: 0,
      max: 1
    },
    size: {
      type: 'number',
      default: defaults.size,
      min: 1,
      max: 100
    }
  }
}

const matter = function(props) {
  props = { ...defaults, ...props };
  const { maxBodies, friction, restitution, size, hasWalls } = props;

  const scene = new Scene()
  const bodies = [];
  const { Bodies } = Matter;
  const ballprops = {
    restitution,
    friction,
    render: {
      fillStyle: "white",
    }
  };
  
  var boundAngle = Math.PI / 12;
  
  var boxA = Bodies.circle(5, 0, 5, { ...ballprops, mass: 5 });
  var boxB = Bodies.circle(10, 0, 5, { ...ballprops, mass: 5 });
  
  scene.on('loaded', () => {
    scene.matter.add([boxA, boxB]);
    if (hasWalls)
      scene.matter.addWalls()
  })
  
  scene.loop = (i) => {
    const s = parseInt(Math.random() * size) + 1;
    if (i % 5 === 0) {
      const circle = Bodies.circle(0, 0, s, { ...ballprops, mass: 0.1 });
      bodies.push(circle)
      if (bodies.length > maxBodies) { 
        const old = bodies.shift();
        scene.matter.remove(old)
      }
      scene.matter.add(circle)
    }
  }
  return scene;
}

export { matter as scene, schema }