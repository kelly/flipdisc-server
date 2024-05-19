import Scene from '../src/Scene.js';
import { ImageView } from '../src/views/index.js'

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
  const scene = new Scene();

  scene.once('loaded', async () => {
    const imageView = new ImageView(url)
    imageView.fitWidth()
    scene.add(imageView)
    await imageView.ready;
    scene.render();
  })

  return scene;
}

export { image as scene, schema }