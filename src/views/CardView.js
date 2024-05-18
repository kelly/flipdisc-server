
import { Container } from '@pixi/node';
import BaseView from './BaseView.js';
import ImageView from './ImageView.js';
import TextView  from './TextView.js';
import Display from '../Display.js';

export default class CardView extends BaseView {

  async initialize({image, title, description}) {
    const { width, height } = BaseView.baseSize();
    const padding = 4;
    const imageSize = height - padding * 2;
    const maxWidth = width - imageSize - padding * 2;
    
    this.bodyView = new BaseView();
    this.imageView = new ImageView(image);
    this.titleView = new TextView(title, { maxWidth });
    this.descriptionView = new TextView(description, { maxWidth });

    this.bodyView.addChild(this.titleView, this.descriptionView);

    this.imageView.setWidth(imageSize)
    this.imageView.setHeight(imageSize)

    const viewStyle = {
      alignContent: "center",
      flexDirection: "row",
      width: width,
      height: height,
      paddingAll: 4,
      gap: 2,
    };
    this.setLayout(viewStyle);

    const bodyStyle = {
      justifyContent: "start",
      flexDirection: "column",
      gap: 1,
      padding: 1,
    };

    this.bodyView.setLayout(bodyStyle);
    this.addChild(this.imageView, this.bodyView);
  }

  set title(value) {
    this.titleView.text = value;
  }

  set description(value) {
    this.descriptionView.text = value;
  }

  async setImage(value) {
    await this.imageView.initialize(value);
  }
}