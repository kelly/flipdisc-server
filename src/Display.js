import { createDisplay } from 'flipdisc'
import { display as config } from '../config/config.js'

let display = null

class MyDisplay {

  static sharedInstance() {
    const { layout, devices, options } = config
    if (!display) {
      display = createDisplay(layout, devices, options)
    }
    return display
  }
}

export default MyDisplay