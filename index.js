var dateutil = require('dateutil');
var chalk = require('chalk');
var through = require('through');
var termwidth = require('window-size').width;

module.exports = function(opts) {
  var fmt = opts.format || 'H:i:s.u O';
  var nullString = '';
  var newline = '\n';
  var space = ' ';
  var sAbbr = 's';
  var places = 4;
  var maxDurLen = 6 + places; // up to 9999.9999s
  var spacePads = [space,'  ','   '];
  var start = process.hrtime();
  var elapsed = start;
  var elapsedTotal = start;
  var last = start;
  var bar = chalk.reset.inverse(' ');
  var spacedBar = space + bar + space;
  var blank = Array(maxDurLen + 1).join(space) + spacedBar;
  var maxLineLength = termwidth - chalk.stripColor(blank).length;
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
    if (chalk.stripColor(line).length > maxLineLength) {
      return stamp + line.slice(0, maxLineLength) + newline +
        stampLine(blank, line.slice(maxLineLength));
    }
    return stamp + line + newline;
  }

  var stampers = {
    'elapsed-line': function() {
      return formatDuration(elapsed);
    },
    'elapsed-total': function() {
      return formatDuration(elapsedTotal);
    },
    'absolute': function() {
      return dateutil.format(new Date(), fmt);
    }
  };

  var createStampTime = stampers[opts.type] || stampers['elapsed-line'];

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
      function fmt(s) {
        return colorStamp(s) + spacedBar;
      }
      // hack to detect the length of the timestamp and then optimize
      blank = Array(s.length + 1).join(space) + spacedBar;
      maxLineLength = termwidth - chalk.stripColor(blank).length;
      formatStamp = fmt;
      return fmt(s);
    }
    : function(s) {
      return padFor(s) + colorStamp(s) + spacedBar;
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
      ? function (l) { l ? write(this, l) : this.queue(blank + newline); }
      : function (l) { write(this, l); };

    return through(onData, function end () { feed(this); });
};
