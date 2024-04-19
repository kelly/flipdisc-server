import * as THREE from 'three';

const tickerDefaults = {
  interval: 10,
  autoClear: true,
  autoStart: true
}

export function ticker(animationFunction, interval = tickerDefaults.interval) {
  let tickerInterval = null;
  let clock = new THREE.Clock();
  let isPlaying = false;
  let i = 0;

  function start() {
    if (isPlaying) return;
    isPlaying = true;
    tickerInterval = setInterval(() => {
      animationFunction(i++, clock);
    }, interval);
}

  function stop() {
    if (!isPlaying) return;
    isPlaying = false;
    clearInterval(tickerInterval);
  }

  start();

  return {
    start,
    stop,
    isPlaying
  };
}



