import Scene from '../src/Scene.js';
import { Assets, Sprite } from '@pixi/node';

const defaults = {
  url: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/72/IggyPopLustForLife.jpg/220px-IggyPopLustForLife.jpg',
}

const schema = {
  title: 'Image',
  description: 'displaying an image',
  properties: {
    url: {
      type: 'string',
      default: defaults.url,
    },
  }
}

const image = async function(options) {
  options = { ...defaults, ...options };
  const { url } = options;

  const scene = new Scene({
    loopInterval: 100,
  });

  scene.once('loaded', async () => {
    await scene.useImage(url)
    scene.render();
  })


  // scene.loop = (i) => {
  //   sprite.x = i;
  //   sprite.y = i;
  // }

  return scene;
}

export { image as scene, schema }