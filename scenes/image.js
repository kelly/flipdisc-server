import Scene from '../src/Scene.js';
import { Assets, Sprite } from '@pixi/node';

const title = 'Image';
const description = 'displaying an image';

const image = async function() {
  let sprite;

  const path = 'https://upload.wikimedia.org/wikipedia/en/thumb/7/72/IggyPopLustForLife.jpg/220px-IggyPopLustForLife.jpg';
  const texture = await Assets.load(path);

  const scene = new Scene({
    loopInterval: 100,
  });

  scene.on('loaded', () => {
    sprite = Sprite.from(texture);
    scene.pixi.add(sprite);
    sprite.anchor.set(0.5);
    sprite.x = scene.width / 2;
    sprite.y = scene.width / 2;

    scene.render();
  })

  scene.on('unload' , () => {
    Assets.unload(path);
  })

  // scene.loop = (i) => {
  //   sprite.x = i;
  //   sprite.y = i;
  // }

  return scene;
}

export { image as scene, title, description }