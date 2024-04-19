// update event return { image: Array, landmarks: Object }
import MotionEmitter from "./Motion.js";
import Display from '../Display.js';
import appRoot from 'app-root-path';
import path from 'path';

const display = Display.sharedInstance()
const file = path.join(appRoot.path, './scripts/pose.py')
const model = path.join(appRoot.path, './resources/models/pose_landmarker_full.task')

export default class PoseEmitter  {

  constructor() {

    const script = {
      channel: 'ipc:///tmp/pose-data',
      file,
      model: './resources/models/pose_landmarker_full.task',
      args: ['--port', '1', '--width', `${display.width}`, '--height', `${display.height}`, '--model', model]
    }
    
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
}