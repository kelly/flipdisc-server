import fs from 'fs';
import { compressImageData } from '../utils/index.js';

export default class Recording {
  constructor() {
    this.recordings = [];
    this.frameLimit = 150;
    this.filename = '../recording.json'
  }

  create(id) {
    const recording = {
      id: id,
      frames: [],
      lastTime: Date.now()  // Initialize lastTime with the current time
    };
    this.recordings.push(recording);
    return recording;
  }

  record(recordingId, data) {
    const recording = this.get(recordingId) || this.create(recordingId);
    if (recording.frames.length >= this.frameLimit) return;

    const currentTime = Date.now();
    data = compressImageData(data);
    const previousFrame = this.getPreviousFrame(recordingId);

    if (previousFrame && previousFrame.data == data) {
      this.updatePreviousFrameTimeDelta(recordingId, currentTime - recording.lastTime);
      return;
    } else {
      const timeDelta = currentTime - recording.lastTime;
      recording.lastTime = currentTime; 
      recording.frames.push({
        t: timeDelta,
        d: data
      });
    }
  }

  updatePreviousFrameTimeDelta(recordingId, timeDelta) {
    const recording = this.get(recordingId);
    if (recording.frames.length < 1) return;
    recording.frames[recording.frames.length - 1].timeDelta = timeDelta;
  }

  getPreviousFrame(recordingId) {
    const recording = this.get(recordingId);
    if (recording.frames.length < 1) return null;
    return recording.frames[recording.frames.length - 1];
  }

  get(recordingId) {
    return this.recordings.find(rec => rec.id === recordingId);
  }

  save() {
    const json = JSON.stringify(this.recordings);
    fs.writeFile(this.filename, json, 'utf8', (err) => {
      if (err) console.error('An error occurred while writing JSON to file:', err);
    });
  }
}
