
const defaults = { 
  duration: '15 minutes',
  shouldLoop: false
}

export default class SceneQueue  {
  constructor(scenes, options = {}) {
    options = { ...defaults, ...options };
    this.items = scenes?.map(scene => ({ id: scene.id })) || [];
    this.shouldLoop = options.shouldLoop;
    this.defaultDuration = options.duration;
  }

  addScene(scene) {
    this.items.push({
      id: scene.id
    });
  }

  add(item) {
    if (!item.id) return;
    this.getItem(item) ? this.update(item) : this.items.push(item);
    return item;
  }

  getItem(item) { 
    return this.items.find(i => i.id === item.id)
  }

  update(item) {
    const idx = this.items.findIndex(i => i.id === item.id)
    if (idx !== -1) 
      this.items[idx] = item
  }

  loopQueueIfNeeded(item) {
    // only loop items don't specify a duration
    if (this.shouldLoop && item.duration == this.defaultDuration) {
      this.add(item)
    }
  }

  next() {
    if (!this.hasItems) return;

    const item = this.items.shift();
    this.loopQueueIfNeeded(item); 
    return item;    
  }

  clear() {
    this.items = [];
  }

  previous() {
    if (!this.hasItems) return;

    const item = this.items.pop();
    this.loopQueueIfNeeded(item);
    return item;
  }

  itemInQueue(item) { 
    return this.items.find(i => i.id === item.id)
  }

  destroy() {
    this.clear()
  }

  get hasItems() {
    return this.items.length > 0;
  }
}
