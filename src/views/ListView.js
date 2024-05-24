import BaseView from "./BaseView.js";
import ImageView from "./ImageView.js";
import SimpleCellView from './SimpleCellView.js';
import { gsap } from 'gsap';


export default class ListView extends BaseView {
  async initialize(items = [], itemFormat, options = {}) {
    this.items = items;
    this.itemFormat = itemFormat;
    this.cellView = options.cellClass || SimpleCellView
    this.hasSeperator = options.hasSeperator || true;
    this.cellPadding = options.cellPadding || 1;
    this.title = options.title || null;
    if (this.title) await this.createTitleView();
    this.createAllCells();
    this.setLayout({
      flexDirection: 'column',
      justifyContent: 'flex-start',
    });
  }

  async createTitleView() {
    const height = 12
    this.titleView = new ImageView(this.title);
    this.titleView.fitHeight(height)
    
    this.titleView.x = 0;
    this.titleView.y = 0;
    this.titleView.setLayout({
      flexDirection: 'row',
      justifyContent: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0
    });
    await this.titleView.ready;
    this.addChild(this.titleView);
  }

  async createAllCells() {
    this.listContainer = new BaseView();
    this.listContainer.setLayout({
      flexDirection: 'column',
      justifyContent: 'flex-start',
      gap: this.cellPadding,
      paddingAll: 0,
    });
    this.listContainer.addChild(...this.items.map(item => new this.cellView(item, this.itemFormat)))
    await this.listContainer.getChildren();
    this.addChild(this.listContainer);
  }

  positionOfCell(idx) {
    const cell = this.listContainer.children[idx];
    const globalPosition = cell.getGlobalPosition();
    return this.listContainer.toLocal(globalPosition);
  }

  async addItem(item) {
    this.items.push(item);
    this.addChild(item);
  }

  async removeItem(item) {
    this.items = this.items.filter(i => i !== item);
    this.removeChild(item);
  }

  async removeAllItems() {
    this.items.forEach(item => this.removeChild(item));
    this.items = [];
  }

  scrollTo(idx) {
    const y = this.positionOfCell(idx).y;
    gsap.to(this, {
      pixi: { 
        y: -y}, 
        duration: 1 
      }
    );
  }
} 