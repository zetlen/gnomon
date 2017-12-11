var timer = require('../utils/timer');
process.stdout.write(
  'Writing to stdout at random intervals...\n'
);
timer.emit(20).pipe(process.stdout);
process.stdout.on('error', process.exit);
