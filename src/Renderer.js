import * as THREE from 'three';
import raf from 'raf';

export default class Renderer {
  constructor() {
    this.clock = new THREE.Clock();
    this._setDefaults();
  }

  setScene(scene) {
    if (this._isPlaying) this.stop();

    this.animationFunction = scene.loop;
    this.start();
  }

  setFinish(callback, time) {
    this.duration = time;
    this.onFinished = callback;
  }

  start() {
    if (this.isPlaying) return;

    this.clock.start();
    this.clock.elapsedTime = this.elapsedTime || 0;
    this._isPlaying = true;
    this._animate();

  }

  stop() {
    if (!this.isPlaying) return;

    this._isPlaying = false;
    this.clock.stop();
    if (this.animationId) {
      raf.cancel(this.animationId);
      this.animationId = null;
    }
  }

  _setDefaults() {
    this.animationFunction = null;
    this.onFinished = null;
    this.duration = 0;
    this.elapsedTime = 0;
    this.animationId = null;
    this.i = 0;
  }

  clear() {
    this.stop();
    this._setDefaults();
  }

  _animate = () => {
    if (!this._isPlaying || !this.animationFunction) return;

    this.animationFunction(this.i++, this.clock);
    this.elapsedTime = this.clock.getElapsedTime()
    this._clearIfFinished();

    if (this._isPlaying) {
      this.animationId = raf(this._animate);
    }
  };

  _clearIfFinished() {
    if (this.onFinished && this.elapsedTime >= this.duration) {
      const cb = this.onFinished;
      this.clear();
      cb();
    }
  }

  get isPlaying() {
    return this.clock.running
  }

  get timeRemaining() {
    return this.onFinished ? Math.round(this.duration - this.elapsedTime) : 0;
  }

}
