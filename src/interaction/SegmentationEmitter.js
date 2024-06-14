import InteractionEmitter from "./Interaction.js";
import path from 'path';
import Display from '../Display.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = path.join(__dirname, '../../scripts/segmentation.py');
const defaultModel = path.join(__dirname, '../../resources/models/selfie_segmenter_landscape.tflite')

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
