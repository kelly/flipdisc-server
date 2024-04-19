import Scene from '../src/Scene.js';
import Matter from "matter-js";

const title = "Matter";
const description = "A simple matter.js widget that displays a bouncing ball.";

const matter = function() {
  const scene = new Scene()
  const bodies = [];
  const { Bodies } = Matter;
  const maxBodies = 50;
  const ballOptions = {
    restitution: 0.8,
    friction: 0.5,
    render: {
      fillStyle: "white",
    }
  };
  
  var boundAngle = Math.PI / 12;
  
  var boxA = Bodies.circle(5, 0, 5, { ...ballOptions, mass: 5 });
  var boxB = Bodies.circle(10, 0, 5, { ...ballOptions, mass: 5 });
  
  scene.on('loaded', () => {
    scene.matter.add([boxA, boxB]);
  })
  scene.loop = (i) => {
    const size = parseInt(Math.random() * 5) + 1;
    if (i % 5 === 0) {
      const circle = Bodies.circle(0, 0, size, { ...ballOptions, mass: 0.1 });
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

export { matter as scene, title, description }