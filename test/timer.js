var crypto = require('crypto');
process.stdout.write(
  'Writing to stdout at random intervals...\n'
);
var nanoPow = Math.pow(10,9);
var last = process.hrtime();
function randomTime() {
  crypto.randomBytes(nanoPow/100, function(e, b) {
    if (e) throw e;
    last = process.hrtime(last);
    var seconds = last[0] + last[1] / nanoPow;
    process.stdout.write('above line took about ' + seconds.toFixed(4) + ' seconds\n');
    last = process.hrtime();
    setTimeout(randomTime, b.readUInt8(0) * 2);
  });
}
randomTime();
