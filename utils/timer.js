export function createTimer(callback, minutes, autoStart = true) {
  const interval = minutes * 60000; // ms
  let remaining = interval
  let timeoutId = null;
  let startTime = null;
  let running = false;

  const start = function() {
    if (!running) {
      running = true;
      startTime = Date.now();
      timeoutId = setTimeout(() => {
        callback();
        clear();
        running = false;
      }, remaining);
    }
  }

  const pause = function() {
    if (running) {
      clearTimeout(timeoutId);
      remaining -= Date.now() - startTime;
      running = false;
    }
  }

  const resume = function() {
    if (!running) {
      start();
    }
  }
  
  const clear = function() {
    clearTimeout(timeoutId);
    remaining = interval 
    running = false;
  }

  const getTimeRemaining = function() {
    let r = remaining;
    if (running) {
      r -= Date.now() - startTime;
    }
    return r;
  }

  if (autoStart) start(); 
  
  return {
    getTimeRemaining,
    start,
    pause,
    resume,
    clear
  }
}