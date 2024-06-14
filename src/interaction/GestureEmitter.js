import MotionEmitter from "./Motion.js";
import appRoot from 'app-root-path';
import path from 'path';
import Display from '../Display.js';

const file = path.join(appRoot.path, './scripts/gesture.py')
const defaultModel = path.join(appRoot.path, './resources/models/gesture_recognizer.task')

export default function GestureEmitter({device = '/dev/video0', port, model}) {
  const { width, height } = Display.size()
  if (!model) model = defaultModel

  const script = {
    channel: 'ipc:///tmp/gesture-data',
    file,
    args: ['--width', `${width}`, '--height', `${height}`, '--hands', 1, '--model', model]
  }
  if (port) script.args.push('--port', port)
  if (device) script.args.push('--device', device)

  return new MotionEmitter(script)
}

