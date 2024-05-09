
const defaults = { 
  duration: '15 minutes',
  shouldLoop: true
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
    if (item.id === undefined) return;
    if (item.duration === undefined) {
      item.duration = this.defaultDuration;
    }
    this.getItem(item) ? this.update(item) : this.items.push(item);
    return item;
  }

  getItem(item) { 
    return this.items.find(i => i.id === item.id)
  }

  update(item) {
    const idx = this.items.findIndex(i => i.id === item.id)
    if (idx !== -1) 
      item.props = {...this.items[idx].props, ...item.props}
      this.items[idx] = item
  }

  loopQueueIfNeeded(item) {
    // only loop items don't specify a duration
    if (this.shouldLoop && item.duration == this.defaultDuration) {
      this.add(item)
    }
  }

  sort(ids) {
    this.items = ids.map(id => this.getItem({ id }))
  }

  next() {
    if (!this.hasItems) return;

    const item = this.items.shift();
    this.loopQueueIfNeeded(item); 
    return item;    
  }

  remove(id) {
    this.items = this.items.filter(i => i.id != id)
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

  set settings({ duration, shouldLoop }) {
    this.defaultDuration = duration;
    this.shouldLoop = shouldLoop;
  }

  get settings() {
    return { duration: this.defaultDuration, shouldLoop: this.shouldLoop }
  }

  get hasItems() {
    return this.items.length > 0;
  }

  get itemsArray() {
    return this.items.map(i => i.id)
  }
}
