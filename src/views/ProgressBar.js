import { Container, Graphics } from '@pixi/node'
import BaseView from './BaseView.js';

class ProgressBar extends BaseView {
    async initialize(width) {
      // Create background
      this.background = new Graphics();
      this.background.lineStyle(1, 0xFFFFFF);
      this.background.drawRect(0, 0, width, 3);
      this.background.endFill();
      this.addChild(this.background);
      
      // Create bar
      this.bar = new Graphics();
      this.bar.beginFill(0xFFFFFF);
      this.bar.drawRect(0, 1, width,2);
      this.bar.endFill();
      this.bar.width = 0; // Start with zero progress
      this.addChild(this.bar);
    }

    updateBar() {
      this.bar.width = this._progress * this.background.width;
    }

    set progress(value) {
      this._progress = Math.max(0, Math.min(1, value)); // Clamp value between 0 and 1
      this.ensureChildrenLoaded().then(() => this.updateBar());
    }

    get progress() {
      return this._progress;
    }
}

export default ProgressBar;