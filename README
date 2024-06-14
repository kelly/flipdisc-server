# Flipdisc Server

A canvas rendering REST server for flipdisc displays.

- [Github](http://www.github.com/kelly/flipserver)
- [NPM](https://www.npmjs.com/package/flipserver)

### Install

```bash
$ pip install pyzmq opencv-python mediapipe
$ npm install flipdisc-server
```

### Start Server

```js

import { createServer } from 'flipdisc-server' 

const server = createServer({
  dir: './scenes'
})

// add your scenes to ./scene

```

### Simple Scene 

```js
import { createScene, 
          ImageView } from 'flipdisc-server'

const schema = {
  title: 'Image',
  properties: {
    url: {
      type: 'string',
      default: 'image.png',
    },
  }
}

const image = function(opts) {
  const scene = createScene()
  scene.once('loaded', () => {
    const img = new ImageView(opts.url)
    scene.add(img)
  })

  return scene;
}

// must return scene and schema, optionally a task
export { image as scene, schema }
```



### Matter, Pixi, Three

```js

  const scene = createScene()

  // easy access to pixi, three, matter
  scene.pixi.add(new PIXI.Graphics())
  scene.three.add(new THREE.Mesh())
  scene.matter.add(new Matter.Body())

  // you can also do:
  scene.add(new Matter.Body(), new THREE.Mesh())
  // it'll automatically add to the correct engine
  // scene.remove() works in the same manner.

  // or directly access canvas
  scene.ctx.fillRect(0, 0, 100, 100)
  
```

### Custom Views

```js

import { ImageView, TextView, 
         CardView, ListView } from 'flipdisc-server'

  const text = new TextView('Hello World')
  const image = new ImageView('http://image.png')

  scene.add(text, image)

```


### Rendering

```js

  // force render
  scene.render()
  // shouldn't have to do this unless you're 
  // doing something custom

  // render loop
  const fps = 50
  scene.useLoop((i, clock) => {
    // update scene
  }, fps)

```

### Shaders

```js

  const shader = `
    precision mediump float;
    uniform float time;
    uniform vec2 resolution;
    void main() {
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      gl_FragColor = vec4(uv, 0.0, 1.0);
    }
  `

  const scene = createScene()
  scene.useShader(shader)

```

### Interaction

```js
import { PoseEmitter, 
        VoiceEmitter, 
        GestureEmitter } from 'flipdisc-server'

  const pose = new PoseEmitter()

  const voice = new VoiceEmitter({
    trigger: 'hey flippy'
  })

  const gesture = new GestureEmitter()

  pose.on('update', (data) => {
    console.log(data)
  })

  voice.on('trigger', (data) => {
    console.log(data)
  })

  gesture.on('update', (data) => {
    console.log(data)
  })

```

### Tasks

```js

const task = createTask(async () => {
  const api = await import(`./spotify/api.js`);
  const current = await api.getCurrentlyPlaying();
  if (current?.is_playing) {
    return {
      props: {
        playing: current,
      },
      wait: false
    }
  }
}, 'every 10 minutes')


```

### API Routes

```
GET /api/playing
Retrieves the currently playing item.

GET /api/display
Retrieves the display settings.

GET /api/queue
Retrieves the current queue.

GET /api/queue/settings
Retrieves the queue settings.

GET /api/scenes/:id
Retrieves a specific scene by ID.

GET /api/scenes
Retrieves all scenes.

POST /api/scenes/next
Moves to the next scene.

POST /api/scenes/previous
Moves to the previous scene.

POST /api/playing
Sets the currently playing item.

POST /api/playing/pause
Pauses the currently playing item.

POST /api/playing/resume
Resumes the currently playing item.

POST /api/playing/toggle
Toggles the play/pause state of the currently playing item.

POST /api/playing/user/clear
Clears user input

POST /api/queue/settings
Updates the queue settings.

POST /api/queue
Adds an item to the queue.

POST /api/queue/sort
Sorts the queue.

POST /api/queue/next
Moves to the next item in the queue.

POST /api/queue/previous
Moves to the previous item in the queue.

DELETE /api/queue/:id
Deletes an item from the queue by ID.
```