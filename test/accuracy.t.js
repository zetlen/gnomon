var tap = require('tap');
var toPromise = require('./utils/stream-to-promise');
var timer = require('./utils/timer');
var gnomon = require('../');

tap.test('Timer accuracy', function(t) {
  return toPromise(timer.emit(20).pipe(gnomon()).pipe(timer.measure())).then(function (results) {
    console.log(results);
    t.ok(results.every(function(timing) { return timing.good; }));
  });
});
