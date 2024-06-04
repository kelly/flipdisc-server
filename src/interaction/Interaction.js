import EventEmitter from 'events';
import { spawn } from 'child_process'
import zmq from 'zeromq'
import fs from 'fs';
import logger from '../Logger.js';

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

  destroy() {
    this.isDestroying = true;
    this.removeAllListeners();
    this._destroyProcess();
    process.removeAllListeners()
  }

  _run(script) {
    process.removeAllListeners()
  
    if (!fs.existsSync(script.file) && script.file) {
      throw new Error('Script file does not exist');
    }

    const args =  (script.file) ? [script.file, ...script.args] : script.args;

    this.process = spawn(script.command || 'python', args);
    this.process
      .once('error', (err) => {
        logger.error(`Failed to start child process: ${err}`);
      })
      .once('exit', (code) => {
        if (code !== 0 && this.maxRestarts-- > 0 && !this.isDestroying) {
          logger.error(`Child process exited with code ${code}. Restarting...`);
          this._run(script);
        }
      });
    
    process.once('exit', () => this.process.kill());
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
  
  _destroyProcess() {
    this.process.removeAllListeners();
    this.process?.kill();
    this.process = null;
  }
}