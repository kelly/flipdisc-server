
import EventEmitter from 'events';
import { spawn } from 'child_process'
import zmq from 'zeromq'
import fs from 'fs';

export default class InteractionEmitter extends EventEmitter {
  constructor(script, options = {}) {
    super();
    this.maxRestarts = 5;
    this.script = script;
  }

  load() {
    this._run(this.script);
    this._subscribe(this.script.channel);
  }

  _run(script) {
    if (!fs.existsSync(script.file) && script.file) {
      throw new Error('Script file does not exist');
    }

    const args =  (script.file) ? [script.file, ...script.args] : script.args;

    this.process = spawn(script.command || 'python', args);
    this.process.on('error', (err) => {
      console.error(`Failed to start child process: ${err}`);
    })
    this.process.on('exit', (code, signal) => {
      if (code !== 0 && this.maxRestarts-- > 0 && !this.isDestroying) {
        console.error(`Child process exited with code ${code}, restarting...`);
        this._run(script);
      }
    });
    process.on('exit', () => this.process.kill());
  }

  async _subscribe(channel) {
    const sock = new zmq.Subscriber
    sock.connect(channel);
    sock.subscribe('')

    for await (const [msg] of sock) {
      // either json or string
      let json = msg.toString();
      try {
        json = JSON.parse(msg);
      } catch (e) {}
      this.emit('update', json)
    }
  }

  destroy() {
    this.isDestroying = true;
    this.removeAllListeners();
    this.process.removeAllListeners();
    process.removeAllListeners()
    this.process?.kill();
    this.process = null;
  }
}