const chalk = require('chalk');

class consoleLogger {
  constructor () {
    this.count = 0;
  }

	log (message, emoji, prefix) {
    this.count += 1;
    let emojiUnicode = emoji ? String.fromCodePoint(parseInt(emoji, 16)) : '';
    console.log(`${chalk.dim(`[${prefix || this.count}]`)} ${emojiUnicode} `, chalk.blue(message));
  }
}

const logger = new consoleLogger();

module.exports = logger;