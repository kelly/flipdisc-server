import InteractionManager from './Interaction.js';
import appRoot from 'app-root-path';
import path from 'path';

const model = path.join(appRoot.path, './resources/models/ggml-small.en.bin')
const voiceDefaultOptions = {
  triggerWord: 'flip'
}

class VoiceInteractionManager {
  // args: ['-m', '../resources/models/ggml-small.en.bin', '-t', '6', '--step', '0', '--length', '30000', '-vth', '0.6']

  constructor(options) {
    options = { ...voiceDefaultOptions, ...options }
    const script = {
      channel: 'ipc:///tmp/voice-data',
      command: './scripts/stream',
      args: ['-m', model]
    }
    this.triggerWord = options.triggerWord;

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
      if (data.toLowerCase().includes(this.triggerWord)) {
        this.triggerBuffer = data;
      }
    })
  }

  _hasPause(data) {
    return data.includes('[') || data.includes('(');
  }
}

export default VoiceInteractionManager;