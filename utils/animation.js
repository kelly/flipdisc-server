import * as THREE from 'three';
import raf from 'raf';

const defaults = {
  fps: 30,
  autoClear: true,
  autoStart: true
};

export function ticker(animationFunction, fps = defaults.fps) {
  let interval = 1000 / fps; 
  let isPlaying = false;
  let i = 0;
  let startTime;
  let animationId;
  let clock = new THREE.Clock();

  function animate(timestamp) {
    if (!startTime) {
      startTime = timestamp;
    }

    const elapsedTime = timestamp - startTime;
    const nextFrameTime = startTime + (i * interval);

    if (elapsedTime >= i * interval) {
      animationFunction(i++, clock);
    }

    const delay = nextFrameTime - performance.now();

    animationId = raf(() => {
      if (delay > 0) {
        animate(performance.now() + delay);
      } else {
        animate(performance.now());
      }
    });
  }

  function start() {
    if (!isPlaying) {
      clock.start();
      isPlaying = true;
      startTime = null;
      i = 0;
      animate(performance.now());
    }
  }

  function stop() {
    if (isPlaying) {
      isPlaying = false;
      clock.stop();
      raf.cancel(animationId);
    }
  }

  if (defaults.autoStart) {
    start();
  }

  return {
    start,
    stop,
    get isPlaying() {
      return isPlaying;
    }
  };
}