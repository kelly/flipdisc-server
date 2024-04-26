import { Display } from 'flipdisc'

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

    }

    const { layout, devices, options } = config
    if (!display) {
      display = new MyDisplay(layout, devices, options)
    }
    return display
  }
}

export default MyDisplay