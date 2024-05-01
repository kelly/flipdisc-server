class Task {

  constructor(func, frequency) {
    this.timer = null;
    this.id = null
    this.func = func;
    this.frequency = frequency || 'every 15 minutes'
  }

}

const createTask = (func, frequency) => new Task(func, frequency);

export default createTask;