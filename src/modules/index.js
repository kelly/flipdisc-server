import Module from './Module.js'
import MatterModule from './Matter.js';
import PixiModule from './Pixi.js';
import ThreeModule from './Three.js';
import UserInputModule from './UserInput.js';
import EventEmitter from 'events'

const isModule = (m) => (m instanceof Module || m instanceof EventEmitter)

export {
  isModule,
  Module,
  MatterModule,
  PixiModule,
  ThreeModule,
  UserInputModule
}