var crypto = require('crypto');
process.stdout.write(
  'Writing to stdout at random intervals...\n'
);
var nanoPow = Math.pow(10,9);
var last = (new Date()).getTime();
var times = 20;
function randomTime() {
  crypto.randomBytes(nanoPow/100, function(e, b) {
    if (e) throw e;
    last = (new Date()).getTime() - last;
    var seconds = last / 1000;
    process.stdout.write('above line took about ' + seconds.toFixed(4) + ' seconds\n');
    last = (new Date()).getTime();
    if (times--) setTimeout(randomTime, b.readUInt8(0) * 2);
  });
}
randomTime();
process.stdout.on('error', process.exit);
