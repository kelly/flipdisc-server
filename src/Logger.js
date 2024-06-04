import pino from 'pino';
import pretty from 'pino-pretty';

class Logger {
  constructor() {
    if (!Logger.instance) {
      this.isDevelopment = process.env.NODE_ENV === 'development';

      const options = {
        level: 'info',
        prettyPrint: this.isDevelopment ? { colorize: true } : false,
      };

      const stream = this.isDevelopment ? pretty() : undefined;

      this.logger = pino(options, stream);
      Logger.instance = this;
    }

    return Logger.instance;
  }

  log(level, message) {
    this.logger[level](message);
  }

  info(message) {
    this.log('info', message);
  }

  warn(message) {
    this.log('warn', message);
  }

  error(message) {
    this.log('error', message);
  }

  // Add more methods as needed (e.g., debug, warn)
}

const instance = new Logger();
Object.freeze(instance);

export default instance;