import Scene from '../src/Scene.js';
// import { createBitmapText } from '../src/views/Text.js';
// import { marqueeContainer } from '../src/views/CardView.js';
// import { Container, Graphics, Text } from '@pixi/node'
// import { createImage } from '../src/views/Image.js';
import CardView from '../src/views/CardView.js';
import ProgressBar from '../src/views/ProgressBar.js';

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

const note = async function(props) {
  props = { ...defaults, ...props };
  const { text, fontName } = props; 
  const scene = new Scene();

  const containerStyle  = {
    justifyContent: "space-between", 
    flexDirection: "row",
    flexWrap: "wrap",
    width: '84'
};
  let container;
  let card;
  let progress;
  scene.once('loaded', async () => {
    // let textView  = await createBitmapText({text: 'hello'});
    // let textView2 =  await createBitmapText({text: 'dude'});
    // let textView3 =  await createBitmapText({text: 'now'});
    // let image = await createImage('https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228')
    // image.width = 20
    // image.height = 20

    // container = new Container();
    // container.flex = true;
    // container.addChild(textView)  
    // container.addChild(textView2)
    // container.addChild(textView3)
    // container.addChild(image)
    // container.layout.fromConfig(containerStyle)


    // scene.add(container)
    // scene.render(); 

    card = new CardView({
      title: 'hello buddy',
      description: 'world',
      image: 'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228'
    })
    progress = new ProgressBar(40)
    card.bodyView.addChild(progress)
    scene.add(card)
    await card.getChildren();
    
    scene.render()
  })

  scene.useLoop((i) => {
    progress.progress = i / 100
  }, 50)

  return scene;
}



export { note as scene, schema }
