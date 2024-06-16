import BaseView from './BaseView.js';
import TextView from './TextView.js';
import { Graphics } from '@pixi/graphics';
import { GlowFilter } from '@pixi/filter-glow';
import { gsap } from 'gsap';

export default class BackgroundTextView extends BaseView {
  async initialize(text) {
    this._text = text;

    const width = BaseView.baseSize().width;
    this.background = new BaseView();
    const circle = new Graphics();
    circle.beginFill('#606060', 1)
    circle.drawCircle(width / 2, 0, 30);
    circle.endFill();

    const glowFilter = new GlowFilter({
      distance: 15,
      outerStrength: 2,
      innerStrength: 1,
      color: 0xffff00,
      quality: 0.5,
    });

    this.background.addChild(circle);
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

    gsap.to(circle, {
      pixi: { y: 50, fillColor: "hsl(+=0, -=100%, +=100%)" }, 
        duration: 2 
      }
    );
  }

  set({image, text, options}) {
    this.image = image;
    this.text = text;
    this.options = options;
  }

}