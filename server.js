
import { Display, createServer } from './index.js'
import { layout, devices, options } from './config/config.js'

Display.configure(layout, devices, options)
const app = createServer()