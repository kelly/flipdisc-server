import Scene from '../src/Scene.js';
import createTask from '../src/SceneTask.js';

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
  // scene.loadFonts();
  scene.useLoop(i => {
    const date = new Date();
    const hours = date.getHours();
    const minutes = padded(date.getMinutes());
    const time = `${hours}:${minutes}`;

    scene.pixi.setText(time, 0, 0, { fontName: 'Futura', fontSize: 28})

  }, 1/6) 

  return scene;
}

export { clock as scene, schema, task }