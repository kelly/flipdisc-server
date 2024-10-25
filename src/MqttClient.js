import mqtt from 'mqtt';
import { topics } from './api/index.js';
import SceneManager from './SceneManager.js';
import SceneTaskManager from './TaskManager.js';

const PLAY_PREFIX = 'play';
const ADD_PREFIX = 'add';

export default async function createMqttClient(url, options = {}) {
  const client = await mqtt.connectAsync(url, options);
  const manager = SceneManager.sharedInstance();

  const handlePause = () => manager.playing.stop();
  const handleResume = () => manager.playing.resume();
  const handleToggle = () => manager.playing.toggle();
  const handleSort = () => manager.queue.sort();
  const handleNext = () => manager.queue.next();
  const handlePrevious = () => manager.queue.previous();

  const actions = {
    'playing/pause': handlePause,
    'playing/resume': handleResume,
    'playing/toggle': handleToggle,
    'queue/sort': handleSort,
    'queue/next': handleNext,
    'queue/previous': handlePrevious,
  };

  const idForName = name => {
    const scene = manager.scenes.find(
      scene => scene.schema.title.toLowerCase() === name.toLowerCase()
    );
    return scene ? scene.schema.id : null;
  };

  const scenes = await manager.loadLocal(options.sceneDir);
  const tasks = new SceneTaskManager(scenes);

  await client.subscribeAsync(topics);

  client.on('message', async (topic, message) => {
    try {
      if (actions[topic]) {
        return actions[topic]();
      }

      const [prefix, idStr] = topic.split('/');
      let id = parseInt(idStr, 10);

      if (isNaN(id)) {
        id = idForName(idStr);
      }

      if (id === null || id === undefined) {
        return;
      }

      if (prefix === PLAY_PREFIX) {
        return await manager.play({ id });
      }

      if (prefix === ADD_PREFIX) {
        return await manager.queue.add({ id });
      }

    } catch (error) {
      console.error(`Error handling topic ${topic}:`, error);
    }
  });

  return client;
}