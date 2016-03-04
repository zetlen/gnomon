var argv = require('minimist')(process.argv.slice(2), {
  string: ['format','type'],
  boolean: ['ignore-blank', 'ignoreBlank'],
  alias: {
    'format': 'f',
    'type': 't',
    'ignoreBlank': ['ignore-blank','quiet','q','i'],
    'high': 'h',
    'medium': 'm',
    'realTime': ['real-time', 'r']
  }
});
if (argv.realTime === 'false') argv.realTime = false;
if (process.stdout.isTTY && !argv.hasOwnProperty('realTime')) {
  argv.realTime = true;
}
if (argv.realTime && typeof argv.realTime !== 'number') argv.realTime = 500;
var split = require('split');
var gnomon = require('./');
process.stdin.pipe(split())
.pipe(gnomon(argv))
.pipe(process.stdout);
process.stdout.on('error', process.exit);
