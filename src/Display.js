import { Display } from 'flipdisc'
import logger from './Logger.js'

// import { display as config } from '../config/config.js'

let display = null
let config = null
let size = null

class MyDisplay extends Display {
  static configure(layout, devices, options) {
    config = { layout, devices, options }
  }

  static size() {
    if (!size) {
      size = { 
        width: this.sharedInstance().width, 
        height: this.sharedInstance().height }
    }
    return size
  }

  static sharedInstance() {
    if (!config) {
      logger.error('Display: must call configure before using sharedInstance()');
    }

    const { layout, devices, options } = config
    if (!display) {
      try {
        display = new Display(layout, devices, options)
      } catch (e) {
        logger.info('Could not connect to display. Continuing in development mode.', e)
        display = new MockDisplay(layout, devices, options)
      }
    }
    return display
  }
}


class MockDisplay {

  constructor(layout, devices, options) {
    this.layout = layout
    this.devices = devices
    this.options = options
    this.width = layout.width
    this.height = layout.height
  }

  async send(data) {}

  info() {
    return { width: this.width, height: this.height }
  }
}

export default MyDisplay