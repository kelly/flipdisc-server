import Scene from '../src/Scene.js';

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
    await scene.useImage(url)
    scene.render();
  })

  return scene;
}

export { image as scene, schema }