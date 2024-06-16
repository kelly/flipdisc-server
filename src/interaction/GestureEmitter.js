import MotionEmitter from "./Motion.js";
import path from 'path';
import Display from '../Display.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = path.join(__dirname, '../../scripts/gesture.py')
const defaultModel = path.join(__dirname, '../../resources/models/gesture_recognizer.task')

export default function GestureEmitter({device, port, model}) {
  const { width, height } = Display.size()
  if (!model) model = defaultModel

  const script = {
    channel: 'ipc:///tmp/gesture-data',
    file,
    args: ['--width', `${width}`, '--height', `${height}`, '--hands', 1, '--model', model]
  }

  if (port !== undefined) script.args.push('--port', port)
  if (device !== undefined) script.args.push('--device', device)

  return new MotionEmitter(script)
}

