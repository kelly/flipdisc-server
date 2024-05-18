import { createEmptyImageData } from '../../utils/Image.js';
import Display from '../Display.js';
import Module from './Module.js';

export default class UserInputModule extends Module {

  constructor() {
    super()
    this.touches = [];
    const { width, height } = Display.size()
    this.imageData = createEmptyImageData(width, height)
  }

  load() {}

  add(point, size, isEnd) {
    if (!this.isEnd) this.fillPointsBetweenLastPoint(point, size)
    this.isEnd = isEnd
    if (!this.touchExists(point)) {
      this.touches.push({
        point,
        size
      });
    }
  }

  touchExists(point) {
    return this.touches.some((touch) => {
      return touch.point[0] === point[0] && touch.point[1] === point[1]
    })
  }

  fillPointsBetweenLastPoint(point, size) {
    const last = this.touches[this.touches.length - 1]
    if (!last) return
    const lastPoint = last.point
    const colDiff = point[0] - lastPoint[0]
    const rowDiff = point[1] - lastPoint[1]

    const colDirection = colDiff > 0 ? 1 : -1
    const rowDirection = rowDiff > 0 ? 1 : -1

    let col = lastPoint[0]
    let row = lastPoint[1]

    while (col !== point[0] || row !== point[1]) {
      if (col !== point[0]) col += colDirection
      if (row !== point[1]) row += rowDirection


      this.touches.push({
        point: [col, row],
        size
      })
    }
  }

  updateImageForTouch(touch) {
    // const { point, size } = touch
    // const row = parseInt(point[1])
    // const col = parseInt(point[0])

    // this.imageData[col][row] = 1

    const { point, size } = touch
    const row = parseInt(point[1])
    const col = parseInt(point[0])

    const halfSize = Math.floor(size / 2)
    const startRow = row - halfSize
    const startCol = col - halfSize

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const col = startCol + i
        const row = startRow + j
        if (col >= 0 && col < this.imageData.length && row >= 0 && row < this.imageData[0].length) {
          this.imageData[col][row] = 1
        }
      }
    }
  }

  clear() {
    const { width, height } = Display.size()
    this.touches = []
    this.imageData = createEmptyImageData(width, height)
    this.isEnd = false
  }

  render() {
    this.touches.forEach((touch) => {
      this.updateImageForTouch(touch)
    })
    return this.imageData;
  }

  destroy() {
    this.touches = null;
    this.imageData = null;
  }

}