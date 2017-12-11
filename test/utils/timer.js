var chalk = require('chalk');
var crypto = require('crypto');
var through2 = require('through2');
var Readable = require('stream').Readable;
var nanoPow = Math.pow(10,7);

module.exports = {
  emit: function (times, coefficient) {
    var last = (new Date()).getTime();
    var c = coefficient || 2;
    var next;
    var reading = false;
    var active = false;
    var rs;
    function randomTime(first) {
      if (first) console.log('first randomTime call');
      if (times-- === 0) {
        active = false;
        rs.push(null);
        rs.emit('end');
        return;
      }
      crypto.randomBytes(nanoPow, function(e, b) {
        if (e) return rs.emit('error', e);
        last = (new Date()).getTime() - last;
        var seconds = last / 1000;
        console.log({ active, reading, flowing: rs._readableState.flowing });
        if (
          active &&
            reading &&
              rs.push('above line took about ' + seconds.toFixed(4) + ' seconds\n', 'utf8')
        ) {
          console.log('randomTime schedule');
          next = setTimeout(randomTime, b.readUInt8(0) * c);
        } else {
          clearTimeout(next);
          reading = false;
        }
        last = (new Date()).getTime();
      });
    }
    rs = new Readable({
      read: function () {
        active = true;
        console.log('read called');
        if (times === 0) {
          active = false;
          rs.push(null);
          rs.emit('end');
          return;
        }
        if (!reading) {
          console.log('with reading false');
          reading = true;
          randomTime(true);
        }
      }
    });
    return rs;
  },
  measure: function (precision) {
    var tolerance = precision || 0.005;
    var lastLine = '';
    return through2.obj(function (incoming, enc, callback) {
      var line = chalk.stripColor(incoming);
      var lm = lastLine.match(/(\d+\.\d+).+about/);
      var m = line.match(/about (\d+\.\d+)/);
      var calculated, reported, margin, good;
      if (m && lm) {
        calculated = parseFloat(m[1]);
        reported = parseFloat(lm[1]);
        margin = Math.abs(calculated - reported);
        good = margin <= tolerance;
        this.push({
          calculated: calculated,
          reported: reported,
          tolerance: tolerance,
          margin: margin,
          good: good
        });
      }
      lastLine = line;
      callback();
    });
  }
};
