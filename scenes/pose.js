import Scene from '../src/Scene.js';
import PoseEmitter from '../src/interaction/Pose.js'

const schema = {
  title: 'Pose',
  description: 'A simple pose widget that displays the current pose.',
}

const pose = function() {
  const scene = new Scene();
  const e = new PoseEmitter()
  scene.add(e)
  e.on('update', data => {
    scene.render(data.image)
  })

  return scene;
}

export { pose as scene, schema }