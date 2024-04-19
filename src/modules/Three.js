import * as THREE from 'three';
import Display from '../Display.js';

const display = Display.sharedInstance()
const defaultOptions = {

}

export default class ThreeModule {

  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.options = { ...defaultOptions, ...options };

    this.load()
  }

  add(view) {
    this.scene.add(view);
  }

  async load() {
    const canvas = this.canvas;
    this.scene = new THREE.Scene();

    const light = new THREE.DirectionalLight(0xFFFFFF, 3);
    light.position.set(0.5, 0.5, 1);
    this.add(light);

    this.camera = new THREE.PerspectiveCamera(75, display.width / display.height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
    })
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.renderer = null;
  }


}