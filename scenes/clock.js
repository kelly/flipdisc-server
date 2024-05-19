import Scene from '../src/Scene.js';
import createTask from '../src/Task.js';
import { TextView } from '../src/views/index.js';

const schema = {
  title: 'Clock',
  description: 'A simple clock widget that displays the current time.'
}

const task = createTask(() => {
  return {
    options: {},
  }
}, 'every 15 seconds')


const clock = function() {

  const padded = (n) => {
    return n < 10 ? `0${n}` : n;
  }
  
  const scene = new Scene();
  const userPrefers12HourFormat = true;
  const textStyle = {
    fontName: 'Futura',
    fontSize: 28,
  }
  // scene.loadFonts();

  let textView;
  scene.once('loaded', () => {
    textView = new TextView('00:00', textStyle)
    scene.add(textView)
  })

  scene.useLoop(i => {
    const date = new Date();
    const hours = date.getHours();
    const minutes = padded(date.getMinutes());
    let time;

    // Check user's preference for time format
    if (userPrefers12HourFormat) {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const twelveHour = hours % 12 || 12;
      time = `${twelveHour}:${minutes} ${ampm}`;
    } else {
      time = `${hours}:${minutes}`;
    }

    textView.text = time;

  }, 1/6) 

  return scene;
}

export { clock as scene, schema, task }