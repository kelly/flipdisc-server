
import * as Motion from '../../utils/motion.js'
import InteractionEmitter from './Interaction.js'
import Display from '../Display.js';

const defaultMotionOptions = {
  motionTriggers: null
}

export default class MotionEmitter extends InteractionEmitter {

  constructor(script, options = {}) {
    super(script)

    this.options = { ...defaultMotionOptions, ...options }
    this.history = []
    this._addMoveEvent() 
  }

  // using es6 create an object of only filtered properties
  _filter(obj, keys) {
    return Object.keys(obj)
      .filter(key => keys.includes(key))
      .reduce((acc, key) => {
        acc[key] = obj[key];
        return acc;
      }, {})
  }

  _avgLandmarks(obj, prop) {
    return Object.values(obj).map(l => l[prop]).reduce((a, b) => a + b) / Object.keys(obj).length;
  }

  _center(landmarks) {
    if (!landmarks) return;
    return { x: this._avgLandmarks(landmarks, 'x'), y: this._avgLandmarks(landmarks, 'y')}
  }

  _filteredHistory(index) {
    // return each index of the 2d array history 
    return this.history.map(data => data[index])
  }

  _move(data) {
    const landmarks = data.landmarks[0] || data.landmarks
    const triggers = this.options.motionTriggers

    if (!landmarks || Object.keys(landmarks) == 0) return;
    let mData;
    
    if (triggers) {
      mData = triggers.map((t, idx) => {
        const filteredLandmarks = this._filter(landmarks, t)
        return this._moveOne(filteredLandmarks, this._filteredHistory(idx))
      });
    } else {
      const gesture = data.gestures ? data.gestures[0] : null
      mData = this._moveOne(landmarks, this.history, gesture)
    }

    return mData;
  }

  _cleanHistory() {
    if (this.history.length > 10) {
      this.history.shift()
    }
  }

  _moveOne(landmarks, history, gesture) {
    const { width, height } = Display.size()
    const position = this._center(landmarks)
    const screenPosition = { x: position.x * width, y: position.y * height }
    const timestamp = Date.now()
    const angle = Motion.avgAngle(position, history)
    const velocity = Motion.avgVelocity(position, history)
    const screenVelocity = velocity * width

    return { position, screenPosition, screenVelocity, angle, velocity, gesture, timestamp }
  }

  _addMoveEvent() {
    this.on('update', (data) => {
      const mData = this._move(data)
      if (mData) {
        this.emit('move', mData)
        this.history.push(mData)
        this._cleanHistory()
      }
    })
  }
}