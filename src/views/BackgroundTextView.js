import BaseView from './BaseView.js';
import TextView from './TextView.js';
import { GlowFilter } from '@pixi/filter-glow';

export default class BackgroundTextView extends BaseView {
  async initialize(text) {
    this._text = text;
    this.background = new BaseView();

    const glowFilter = new GlowFilter({
      distance: 15,
      outerStrength: 2,
      innerStrength: 1,
      color: 0xffff00,
      quality: 0.5,
    });

    this.background.setLayout({
      position: 'absolute',
      top: 0,
      left: 0,
      width: BaseView.baseSize().width,
      height: BaseView.baseSize().height,
    })
    this.textView = new TextView(text, {
      fontName: 'Futura',
      fontSize: 16,
      color: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 4,
    });
    this.setLayout({
      position: 'relative',
      width: BaseView.baseSize().width,
      height: BaseView.baseSize().height,
      flexDirection: 'column',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
    })

    this.addChild(this.background, this.textView);
    this.background.filters = [glowFilter]
    this.background.dither()
  }

  set text(text) {
    this._text = text;
    this.textView.text = text;
  }

}