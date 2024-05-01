import workerpool  from 'workerpool';
import later from '@breejs/later';
import SceneManager from './SceneManager.js';
import SceneTask from './SceneTask.js';

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
    console.log('executing task', task.id, task.func)
    const result = await this.pool.exec(task.func)
    const { options, duration, wait = true } = result;
    if (result) {
      console.log(result)
      if (wait) {
        sceneManager.addQueueItem({ 
          id: task.id, 
          options,
          duration,
        });
      } else {
        sceneManager.setPlayingFromQueue(item, true)
      }
    }
  }

  scheduleTask(task) {
    const interval = later.parse.text(task.frequency);
    task.timer = later.setInterval(() => {
      this.exec(task)
    }, interval);
  }

  cancelTask(task) {
    clearInterval(task.timer);
  }

}
