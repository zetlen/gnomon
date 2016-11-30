var meow = require('meow');
var usage = __USAGE__;
var intro = [
  '',
  '## Usage',
  '',
  'Use UNIX (or DOS) pipes to pipe the stdout of any command through gnomon.',
  '',
  '  npm test | gnomon',
  '',
  'Use command-line options to adjust gnomon\'s behavior.',
  '',
  '  any-command-to-be-timed | gnomon --type=elapsed-total --high=8.0',
  '',
  ''
];
var cli = meow(intro.join('\n') + usage, {
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
if (process.stdin.isTTY) {
  console.error('Error: You must pipe another command\'s output to gnomon with |.');
  console.log(intro.join('\n  '));
  process.exit(1);
}
var flags = cli.flags;
if (flags.realTime === 'false') flags.realTime = false;
if (process.stdout.isTTY && !flags.hasOwnProperty('realTime')) {
  flags.realTime = true;
}
if (flags.realTime && typeof flags.realTime !== 'number') flags.realTime = 500;
var split = require('split');
var gnomon = require('./');
process.stdin.pipe(split())
.pipe(gnomon(flags))
.pipe(process.stdout);
process.stdout.on('error', process.exit);
