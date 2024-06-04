import InteractionManager from './Interaction.js';
import appRoot from 'app-root-path';
import path from 'path';
import Module from '../modules/Module.js';

const model = path.join(appRoot.path, './resources/models/ggml-small.en.bin')
const voiceDefaultOptions = {
  trigger: 'flip'
}

class VoiceEmitter extends Module {
  // args: ['-m', '../resources/models/ggml-small.en.bin', '-t', '6', '--step', '0', '--length', '30000', '-vth', '0.6']

  constructor(options) {
    super()
    options = { ...voiceDefaultOptions, ...options }
    const script = {
      channel: 'ipc:///tmp/voice-data',
      command: './scripts/stream',
      args: ['-m', model]
    }
    this.trigger = options.trigger;

    this.manager = new InteractionManager(script)
    this._addTriggerEvent()

    return this.manager;
  }

  _addTriggerEvent(manager) {
    this.manager.on('update', (data) => {
      if (this.triggerBuffer && this._hasPause(data)) {
        this.manager.emit('trigger', this.triggerBuffer)
        this.triggerBuffer = null;
      }
      if (data.toLowerCase().includes(this.trigger)) {
        this.triggerBuffer = data;
      }
    })
  }

  _hasPause(data) {
    return data.includes('[') || data.includes('(');
  }
}

export default VoiceEmitter;