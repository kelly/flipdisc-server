import Display from '../Display.js'
const display = Display.sharedInstance()

const getDisplay = async (c) => {
  return c.json(display.info)
}

export {
  getDisplay
}