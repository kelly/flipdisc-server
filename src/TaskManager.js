import workerpool  from 'workerpool';
import later from '@breejs/later';
import SceneManager from './SceneManager.js';
import logger from './Logger.js'

let sceneManager;

export default class SceneTaskManager {
  constructor(scenes) {
    this.tasks = [];
    this.pool = workerpool.pool();
    sceneManager = SceneManager.sharedInstance();

    this.addSceneTasks(scenes);
  }

  addSceneTasks(scenes) {
    scenes?.forEach(scene => {
      if (scene.task) {
        this.addTask(scene.task);
      }
    });
  }

  addTasks(tasks) {
    tasks.forEach(task => {
      this.addTask(task);
    });
  }

  addTask(task) {
    this.tasks.push(task);
    this.scheduleTask(task);
  }

  async exec(task) {
    const result = await this.pool.exec(task.func)
    if (!result) return;
    
    const { props, duration, wait = true } = result;
    const item = { id: task.id, props, duration };

    if (sceneManager.playing.id === task.id) return;
    (wait) ? sceneManager.queue.add(item) : sceneManager.play(item)
  }

  scheduleTask(task) {
    const interval = later.parse.text(task.frequency);
    task.timer = later.setInterval(() => {
      try {
        this.exec(task)
      } catch (e) {
        logger.warn(`error executing task id: ${task.id}`)
      }
    }, interval);
  }

  cancelTask(task) {
    clearInterval(task.timer);
  }

}
