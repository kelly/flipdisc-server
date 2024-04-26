import Display from '../Display.js'

const getDisplay = async (c) => {
  const display = Display.sharedInstance()
  return c.json(display.info)
}

export {
  getDisplay
}