import Scene from '../src/Scene.js';

const schema = {
  title: 'Clock',
  description: 'A simple clock widget that displays the current time.'
}

const clock = function() {
  const scene = new Scene({
    loopInterval: 100,
  });

  // scene.loadFonts();
  scene.loop = function(i) {
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const time = `${hours}:${minutes}`;
    this.pixi.setText(i, 0, 0, { fontName: 'Futura', fontSize: 28})
  }

  return scene;
}

export { clock as scene, schema }