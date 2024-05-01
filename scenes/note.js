import Scene from '../src/Scene.js';

const defaults = {
  text: 'hello world',
  fontName: 'cg',
}

const schema = {
  title: 'Note',
  description: 'A simple note widget that displays text.',
  properties: {
    text: {
      type: 'string',
      default: defaults.text,
    },
    fontName: {
      type: 'enum',
      default: defaults.fontName,
      values: ['cg', 'tb-8', 'tom-thumb']
    }
  }
}

const note = async function(options) {
  const { text, fontName } = options; 
  const scene = new Scene();
  scene.loadFonts();
  scene.once('loaded', () => {
    
    scene.pixi.setText(text, 0, 0, {
      fontName
    })
    scene.render();
  })

  return scene;
}

export { note as scene, schema }