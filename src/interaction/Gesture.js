import MotionEmitter from "./Motion.js";
import appRoot from 'app-root-path';
import path from 'path';

const file = path.join(appRoot.path, './scripts/gesture.py')
const model = path.join(appRoot.path, './resources/models/gesture_recognizer.task')

export default class GestureEmitter {

  constructor() {
  
    const script = {
      channel: 'ipc:///tmp/gesture-data',
      file,
      args: ['--port', '1', '--width', `${display.width}`, '--height', `${display.height}`, '--hands', 1, '--model', model]
    }


    return new MotionEmitter(script)
  }
}

