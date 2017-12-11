var split = require('split');
var chalk = require('chalk');
var through = require('through');
var timer = require('../utils/timer');

console.log('Testing timer accuracy...');

process.stdin
  .pipe(split())
  .pipe(timer.measure())
  .pipe(through(function(m) {
    if (m.good) {
      this.queue(chalk.bold.green(
        m.reported + ' ~ ' + m.calculated + ' -- ok\n'
      ));
    } else {
      console.error(chalk.bold.red(
        m.reported + ' !~ ' + m.calculated + ' -- bad'
      ));
      process.exit(1);
    }
  }))
  .pipe(process.stdout);
