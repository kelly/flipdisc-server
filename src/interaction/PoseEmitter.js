// update event return { image: Array, landmarks: Object }
import MotionEmitter from "./Motion.js";
import Display from '../Display.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = path.join(__dirname, '../../scripts/pose.py')
const defaultModel = path.join(__dirname, '../../resources/models/pose_landmarker_full.task')

export default function PoseEmitter({device = '/dev/video0', port, model})  {
  const { width, height } = Display.size()
  if (!model) model = defaultModel

  const script = {
    channel: 'ipc:///tmp/pose-data',
    file,
    model: './resources/models/pose_landmarker_full.task',
    args: ['--width', `${width}`, '--height', `${height}`, '--model', model]
  }

  if (port) script.args.push('--port', port)
  if (device) script.args.push('--device', device)
  
  const motionTriggers = [
    ['left_wrist',
    'left_pinky',
    'left_index',
    'left_thumb'],
    ['right_wrist', 
    'right_pinky',
    'right_index',
    'right_thumb']
  ]

  return new MotionEmitter(script, { motionTriggers })
}