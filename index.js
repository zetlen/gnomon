var dateutil = require('dateutil');
var chalk = require('chalk');
var through = require('through');

module.exports = function(opts) {
  var fmt = opts.format || 'H:i:s.u O';
  var nullString = '';
  var newline = '\n';
  var space = ' ';
  var sAbbr = 's';
  var places = 4;
  var maxDurLen = 5 + places; // four digits of seconds, decimal place, places
  var spacePads = [space,'  ','   '];
  var start = process.hrtime();
  var elapsed = start;
  var elapsedTotal = start;
  var last = start;
  var leftBar = chalk.dim('[');
  var rightBar = chalk.dim(']');
  var nanoPow = Math.pow(10,9);
  function durationToSeconds(dur) {
    return dur[0] + dur[1] / nanoPow;
  }
  function tick() {
    elapsed = process.hrtime(last);
    elapsedTotal = process.hrtime(start);
    last = process.hrtime();
  }
  function formatDuration(dur) {
    return durationToSeconds(dur).toFixed(places) + sAbbr;
  }
  function padFor(s) {
    var l = s.length;
    return l < maxDurLen ? spacePads[maxDurLen - 1 - l] : nullString;
  }
  function stampLine(stamp, line) {
    return stamp + line + newline;
  }

  var createStampTime = ({
    'elapsed-line': function() {
      return formatDuration(elapsed);
    },
    'elapsed-total': function() {
      return formatDuration(elapsedTotal);
    },
    'absolute': function() {
      return dateutil.format(new Date(), fmt);
    }
  })[opts.type || 'elapsed-line'];

  var colorStamp;
  var high = opts.high;
  var medium = opts.medium;
  if (medium && high) {
    colorStamp = function() {
      var seconds = durationToSeconds(elapsed);
      if (seconds >= high) {
        return chalk.reset.red(createStampTime());
      }
      if (seconds >= medium) {
        return chalk.reset.yellow(createStampTime());
      }
      return chalk.reset.green(createStampTime());
    };
  } else if (medium) {
    colorStamp = function() {
      if (durationToSeconds(elapsed) >= medium) {
        return chalk.reset.yellow(createStampTime());
      }
      return chalk.reset.green(createStampTime());
    }
  } else if (high) {
    colorStamp  = function() {
      if (durationToSeconds(elapsed) >= high) {
        return chalk.reset.red(createStampTime());
      }
      return chalk.reset.green(createStampTime());
    }
  } else {
    colorStamp = function() {
      return chalk.reset(createStampTime());
    }
  }

  var formatStamp = (opts.type === 'absolute')
    ? function(s) {
      return space + leftBar + colorStamp(s) + rightBar + space;
    }
    : function(s) {
      return space + padFor(s) + leftBar + colorStamp(s) + rightBar + space;
    };

  var lastLine = false;

  var feed = function(stream) {
    stream.queue(
      stampLine(
        formatStamp(createStampTime()),
        lastLine
      )
    );
  }

  var write = function (stream, data) {
    tick();
    if (lastLine !== false) feed(stream);
    lastLine = data;
  }

  var onData = (opts.ignoreBlank)
    ? function (data) { data ? write(this, data) : this.queue('\n'); }
    : function (data) { write(this, data); };

  return through(onData, function end () { feed(this); });
};
