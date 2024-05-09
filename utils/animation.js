// Import the raf function from the RAF library
import * as THREE from 'three';
import raf from 'raf';

const defaults = {
  fps: 30,
  autoClear: true,
  autoStart: true
}


export function ticker(animationFunction, fps = defaults.fps) {
  const interval = 1000 / fps; 
  let isPlaying = false;
  let i = 0;
  let startTime;
  let animationId;
  let clock = new THREE.Clock();

  function animate(timestamp) {
    if (!startTime) {
      startTime = timestamp;
    }

    // const elapsedTime = timestamp - startTime;

    animationFunction(i++, clock);

    const nextFrameTime = startTime + (i * interval);
    const delay = Math.max(0, nextFrameTime - timestamp);

    animationId = setTimeout(() => {
      animationId = raf(animate);
    }, delay);
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
      clearTimeout(animationId);
    }
  }

  start();

  return {
    start,
    stop,
    isPlaying
  };
}