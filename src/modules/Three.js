import * as THREE from 'three';
import Display from '../Display.js';
import Module from './Module.js';

const defaultOptions = {

}

const DEFAULT_VERTEX_SHADER = `
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;

const DEFAULT_FRAGMENT_SHADER = `
  uniform vec2 resolution;
  uniform float time;
  void main() {
    vec2 pos = gl_FragCoord.xy / resolution.xy;
    float d = distance(pos, vec2(0.5)) + sin(time) * 0.1;
    float c = 1.0 - smoothstep(0.5, 0.501, d);
    gl_FragColor = vec4(0.0, c, c, 1.0);
  }`;


let width, height, aspect;

export default class ThreeModule extends Module {

  constructor(canvas, options = {}) {
    super();
    this.canvas = canvas;
    this.options = { ...defaultOptions, ...options };

    this.load()
  }

  async add(view) {
    if (ThreeModule.isValidInstance(view)) {
      this.scene.add(view);
    }
  }

  async load() {
    if (this.isLoaded) return
    
    const canvas = this.canvas;
    const size = Display.size();
    width = size.width;
    height = size.height;
    aspect = width / height;

    this.scene = new THREE.Scene();

    const light = new THREE.DirectionalLight(0xFFFFFF, 3);
    light.position.set(0.5, 0.5, 1);
    this.add(light);

    this.camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 10);
    this.scene.add(this.camera);
    this.camera.position.set(0, 0, 1);
    this.camera.lookAt(this.scene.position);
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      canvas,
    })
  }

  createShader(shader, uniform) {
    const defaultUniform = {
      time: { type: 'f', value: 0.0 },
      resolution: { type: 'v2', value: new THREE.Vector2(width, height) },
    };

    this.uniforms = uniform || defaultUniform
    this.createShaderPlane(shader);
  }

  createShaderPlane(shader) {
    const material = new THREE.ShaderMaterial({
      vertexShader: DEFAULT_VERTEX_SHADER,
      fragmentShader: shader || DEFAULT_FRAGMENT_SHADER,
      uniforms: this.uniforms
    });

    const geometry = new THREE.PlaneGeometry(width, height);
    const plane = new THREE.Mesh(geometry, material);
    
    this.add(plane);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  updateShaderDefault(i, clock) {
    if (this.uniforms.time || this.uniforms.iTime) {
      this.uniforms.time.value = clock.getElapsedTime();
    }
    if (this.uniforms.iTimeDelta) {
      this.uniforms.iTimeDelta.value = clock.getDelta();
    }
    if (this.uniforms.resolution || this.uniforms.iResolution) {
      this.uniforms.resolution.value = new THREE.Vector2(width, height);
    }
  }

  get isLoaded() {
    return this.renderer !== undefined
  }

  static isValidInstance(view) {
    return view instanceof THREE.Object3D
  }

  destroy() {
    this.renderer = null;
  }

}