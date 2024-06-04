import MotionEmitter from "./Motion.js";
import appRoot from 'app-root-path';
import path from 'path';
import Display from '../Display.js';

const file = path.join(appRoot.path, './scripts/gesture.py')
const model = path.join(appRoot.path, './resources/models/gesture_recognizer.task')

export default function GestureEmitter() {
  const { width, height } = Display.size()

  const script = {
    channel: 'ipc:///tmp/gesture-data',
    file,
    args: ['--port', '1', '--width', `${width}`, '--height', `${height}`, '--hands', 1, '--model', model]
  }

  return new MotionEmitter(script)
}

