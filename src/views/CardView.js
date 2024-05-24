
import BaseView from './BaseView.js';
import ImageView from './ImageView.js';
import TextView  from './TextView.js';

export default class CardView extends BaseView {

  async initialize({image, title, description}) {
    this._image = image;
    this._title = title;
    this._description = description;

    const { width, height } = BaseView.baseSize();
    const padding = 4;
    const imageSize = height - padding * 2;
    const maxWidth = width - imageSize - padding * 2;
    
    this.bodyView = new BaseView();
    this.contentView = new BaseView();
    this.imageView = new ImageView(image);
    this.titleView = new TextView(title, { maxWidth });
    this.descriptionView = new TextView(description, { maxWidth });

    this.bodyView.addChild(this.titleView, this.descriptionView);

    await this.imageView.setSize(imageSize, imageSize)
    this.imageView.border(1)

    const viewStyle = {
      alignContent: 'center',
      flexDirection: 'row',
      width: width,
      height: height,
      paddingAll: 4,
      gap: 2,
    };
    this.setLayout(viewStyle);

    const bodyStyle = {
      justifyContent: 'start',
      flexDirection: 'column',
      gap: 1,
    };
    this.bodyView.setLayout(bodyStyle);

    const contentStyle = {
      justifyContent: 'space-between',
      flexDirection: 'column',
      height: imageSize - padding,
      paddingAll: 2,
    };
    this.contentView.addChild(this.bodyView)
    this.contentView.setLayout(contentStyle);

    this.addChild(this.imageView, this.contentView);
  }

  set({image, title, description}) {
    this.image = image;
    this.title = title;
    this.description = description;
  }

  set title(title) {
    if (title === this._title) return;
    this._title = title
    this.titleView.text = title
  }

  set description(description ) {
    if (description === this._description) return;
    this._description = description
    this.descriptionView.text = description;
  }

  set image(image) {
    if (image === this._image) return;
    this._image = image
    this.imageView.image = image
  }

  get title() {
    return this._title;
  }

  get description() {
    return this._description;
  }

  get image() {
    return this._image;
  }
}