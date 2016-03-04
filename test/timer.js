var crypto = require('crypto');
process.stdout.write(
  'Writing to stdout at random intervals...\n'
);
var nanoPow = Math.pow(10,9);
function randomTime() {
  var cryptoOffset = process.hrtime();
  crypto.randomBytes(nanoPow/4, function(e, b) {
    if (e) throw e;
    cryptoOffset = process.hrtime(cryptoOffset);
    var cryptoS = cryptoOffset[0] + cryptoOffset[1] / nanoPow;
    process.stdout.write('above line took about ' + cryptoS.toFixed(4) + ' seconds\n');
    randomTime();
  });
}
randomTime();
