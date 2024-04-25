import * as THREE from 'three';
import Scene from '../src/Scene.js';
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js'


const defaults = {
  blobCount: 5
}

const schema = {
  title: 'Lava',
  description: 'A lava lamp effect using three.js.',
  type: 'object',
  properties: {
    blobCount: {
      type: 'integer',
      title: 'Blob Count',
      default: defaults.blobCount,
      min: 1,
      max: 30
    }
  }
}

let update;

const lava = function(options) {
  options = { ...defaults, ...options };
  const { blobCount } = options;

  const scene = new Scene({
    loopInterval: 30,
  });


  let time = 0;
  let effect = null;

  function createEffect() {
    const resolution = 100;
    const plasticMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xFFF, shininess: 0 }); // Set object color to white
    const effect = new MarchingCubes(resolution, plasticMaterial, true, true, 100000);
    effect.position.set(0, 0, 0);
    effect.scale.set(5, 5, 5);
    effect.enableUvs = false;
    effect.enableColors = false;
    return effect;
  }

  function updateCubes(object, time, numblobs) {
    object.reset();
    const subtract = 12;
    const strength = 1.2 / ((Math.sqrt(numblobs) - 1) / 4 + 1);
    for (let i = 0; i < numblobs; i++) {
      const ballx = Math.sin(i + 1.26 * time * (1.03 + 0.5 * Math.cos(0.21 * i))) * 0.27 + 0.5;
      const bally = Math.abs(Math.cos(i + 1.12 * time * Math.cos(1.22 + 0.1424 * i))) * 0.77; // dip into the floor
      const ballz = Math.cos(i + 1.32 * time * 0.1 * Math.sin((0.92 + 0.53 * i))) * 0.27 + 0.5;

      object.addBall(ballx, bally, ballz, strength, subtract);
    }
    object.update();
  }

  scene.on('loaded', () => {
    effect = createEffect();
    scene.three.add(effect);
  })

  scene.loop = (i, clock) => {
    const delta = clock.getDelta();
    time += delta * 1.0 * 0.5;
    scene.pixi.setText('Kelly', 0, 0, { fontName: 'Futura', fontSize: 28})
    updateCubes(effect, time, blobCount);
  }

  return scene;
}

export { lava as scene, schema }