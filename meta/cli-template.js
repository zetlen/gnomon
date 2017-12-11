var minimist = require('minimist');
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
].join('\n  ') + usage;
var cli = minimist(process.argv, {
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
  console.log(intro);
  process.exit(1);
}
if (cli.realTime === 'false') cli.realTime = false;
if (process.stdout.isTTY && !cli.hasOwnProperty('realTime')) {
  cli.realTime = true;
}
if (cli.realTime && typeof cli.realTime !== 'number') cli.realTime = 500;
var split = require('split');
var gnomon = require('./');
process.stdin.pipe(split())
.pipe(gnomon(cli))
.pipe(process.stdout);
process.stdout.on('error', process.exit);
