import InteractionEmitter from "./Interaction.js";
import appRoot from 'app-root-path';
import path from 'path';
import Display from '../Display.js';

const file = path.join(appRoot.path, './scripts/segmentation.py')
const defaultModel = path.join(appRoot.path, './resources/models/selfie_segmenter_landscape.tflite')

export default function SegmentationEmitter({device = '/dev/video0', port, model}) {
  const { width, height } = Display.size()
  if (!model) model = defaultModel

  const script = {
    channel: 'ipc:///tmp/segmentation-data',
    file,
    args: ['--width', `${width}`, '--height', `${height}`, '--model', model]
  }
  if (port) script.args.push('--port', port)
  if (device) script.args.push('--device', device)

  return new InteractionEmitter(script)
}
