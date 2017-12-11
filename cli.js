var minimist = require('minimist');
var usage = "## Options\n\n    --type=<elapsed-line|elapsed-total|absolute>        [default: elapsed-line]\n    -t <elapsed-line|elapsed-total|absolute>\n\n      Type of timestamp to display.\n        elapsed-line: Number of seconds that displayed line was the last line.\n        elapsed-total: Number of seconds since the start of the process.\n        absolute: An absolute timestamp in UTC.\n\n    --format=\"format\"                                   [default: \"H:i:s.u O\"]\n    -f \"format\"\n\n      Format the absolute timestamp, using PHP date format strings. If the type\n      is elapsed-line or elapsed-total, this option is ignored.\n\n    --ignore-blank                                      [default: false]\n    --quiet\n    -q\n    -i\n\n      Do not prepend a timestamp to blank lines; just pass them through. When\n      this option is active, blank lines will not trigger an update of elapsed\n      time. Therefore, if a lot of blank lines appear, the prior timestamp will\n      display the total time between that line and the next non-blank line\n      (if the type is elapsed-time was selected).\n\n\t--real-time=<number|false>                          [default: 500]\n\t-r                                                  [non-tty default: false]\n\n\t  Time increment to use when updating timestamp for the current line, in\n\t  milliseconds. Pass `false` to this option to disable realtime entirely,\n\t  if you need an extra performance boost or you find it distracting. When\n\t  realtime is disabled, the log will always appear one line \"behind\" the\n\t  original piped output, since it can't display the line until it's\n\t  finished timing it.\n\n    --high=seconds\n    -h seconds\n\n      High threshold. If the elapsed time for a line is equal to or higher than\n      this value in seconds, then the timestamp will be colored bright red.\n      This works for all timestamp types, including elapsed-total and absolute,\n      where the elapsed line time is not actually displayed.\n\n    --medium=seconds\n    -m seconds\n\n      Medium threshold. Works just like the high threshold described above, but\n      colors the timestamp bright yellow instead. Can be used in conjunction\n      with a high threshold for three levels.\n\n### Notes\n - If a `high` and/or a `medium` threshold are specified, then all timestamps not\nmeeting that threshold will be colored bright green.\n - If you pipe the output of `gnomon` into another command or a file (that is,\n not a tty) then the `real-time` option will be disabled by default and each line\n will appear only after it has been timed. You can force realtime by sending a\n `--real-time=<ms>` argument explicitly, but the ANSI codes would probably\n interfere with whatever you were trying to do. The sane default is to omit fancy\n stuff, like colors and escape sequences, when logging text directly to a file.\n\n\n## License\n\ngnomon uses the MIT license.\n\n";
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
