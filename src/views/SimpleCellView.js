import TextView from './TextView.js'
import BaseView from './BaseView.js';
import { Graphics  } from '@pixi/node'

export default class SimpleCellView extends BaseView {
  async initialize(item, format, hasSeperator = true) {
    this._item = item;
    this._format = format;

    if (format.title) {
      this.titleText = new TextView(item[format.title]);
      this.addChild(this.titleText);
      await this.titleText.ready;
    }

    if (format.description) {
      this.bodyText = new TextView(item[format.description]);
      this.addChild(this.bodyText);
      await this.bodyText.ready;
    }

    if (hasSeperator) {
      this.addChild(this.createSeperator());
    }

    this.setLayout({
      justifyContent: 'center',
      flexDirection: 'column',
      height: BaseView.baseSize().height,
    });
  }

  createSeperator() {
    const seperator = new Graphics();
    seperator.beginFill(0xFFFFFF);
    seperator.drawRect(0, 0, this.width, 1);
    seperator.endFill();
    seperator.flex = true;
    seperator.layout.fromConfig({
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
    })
    return seperator;
  }
 
}