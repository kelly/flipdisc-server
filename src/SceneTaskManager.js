import workerpool  from 'workerpool';
import later from '@breejs/later';
import SceneManager from './SceneManager.js';

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
    const { props, duration, wait = true } = result;
    if (result) {
      if (wait) {
        sceneManager.queue.add({ 
          id: task.id, 
          props,
          duration,
        });
      } else {
        sceneManager.play(item)
      }
    }
  }

  scheduleTask(task) {
    const interval = later.parse.text(task.frequency);
    task.timer = later.setInterval(() => {
      try {
        this.exec(task)
      } catch (e) {
        console.warn('error executing task', e)
      }
    }, interval);
  }

  cancelTask(task) {
    clearInterval(task.timer);
  }

}
