import Scene from '../src/Scene.js';
import { Graphics } from '@pixi/node';

const schema = {
  title: 'Calendar',
  description: 'A simple calendar widget that displays the current time.',
}

const calendar = function() {


  function drawCalendar() {
    const graphics = new Graphics();
    graphics.beginFill(0xFFFFFF);
    
    // draw a rectangle for each day'
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 5; j++) {
        graphics.drawRect(i * 10, j * 8, 8, 6);
      }
    }

    return graphics;
  }

  const scene = new Scene();
  scene.on('loaded', () => {
    const cal = drawCalendar()
    scene.pixi.add(cal);
    scene.render()
  })

  return scene;
}

export { calendar as scene, schema }