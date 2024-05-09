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
  let sprite;
  options = { ...defaults, ...options };
  const { url } = options;
  const texture = await Assets.load(url);

  const scene = new Scene({
    loopInterval: 100,
  });

  scene.once('loaded', () => {
    sprite = Sprite.from(texture);
    scene.pixi.add(sprite);
    sprite.anchor.set(0.5);
    sprite.x = scene.width / 2;
    sprite.y = scene.width / 2;

    scene.render();
  })

  scene.once('unload' , () => {
    texture.destroy(true)
  })

  // scene.loop = (i) => {
  //   sprite.x = i;
  //   sprite.y = i;
  // }

  return scene;
}

export { image as scene, schema }