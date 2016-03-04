var chalk = require('chalk');
var split = require('split');
var through = require('through');
var lastLine = '';
var precision = 0.001;
console.log('Testing timer accuracy...')
process.stdin.pipe(split()).pipe(through(function(line) {
  line = chalk.stripColor(line);
  var calculated, reported;
  var lm = lastLine.match(/(\d+\.\d+).+about/);
  var m = line.match(/about (\d+\.\d+)/);
  if (m && lm) {
    calculated = parseFloat(m[1]);
    reported = parseFloat(lm[1]);
    if (Math.abs(calculated - reported) > precision) {
      console.error(chalk.bold.red(
        reported + ' !~ ' + calculated + ' -- bad'
      ));
      process.exit(1);
    }
    this.queue(chalk.bold.green(
      reported + ' ~ ' + calculated + ' -- ok\n'
    ));
  }
  lastLine = line;
})).pipe(process.stdout);
