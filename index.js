var dateutil = require('dateutil');
var chalk = require('chalk');
var through = require('through');
var termwidth = require('window-size').width;
var nullString = '';
var newline = require('os').EOL;
var ansi = {
  prefix: '\x1b[',
  up: 'A',
  clearLine: '0G'
};
var space = ' ';
var sAbbr = 's';
var places = 4;
var maxDurLen = 6 + places; // up to 9999.9999s
var spacePads = Array(20).join(space).split('').map(function(s, i) {
  return Array(i + 1).join(space);
});

module.exports = function(opts) {
  var fmt = opts.format || 'H:i:s.u O';
  var start = process.hrtime();
  var elapsed = start;
  var elapsedTotal = start;
  var last = start;
  var bar = chalk.reset.inverse(' ');
  var spacedBar = space + bar + space;
  var blank = Array(maxDurLen).join(space) + spacedBar;
  var totalLabel = 'Total';
  var totalPrefix = padFor(totalLabel) + totalLabel;
  var maxLineLength = termwidth - chalk.stripColor(blank).length;
  var nanoPow = Math.pow(10,9);
  opts.type = opts.type || 'elapsed-line';
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
    var len = line ? chalk.stripColor(line).length : 0;
    if (len > maxLineLength) {
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
    colorStamp = function(stamp, value) {
      var seconds = durationToSeconds(value || elapsed);
      if (seconds >= high) {
        return chalk.reset.red(stamp);
      }
      if (seconds >= medium) {
        return chalk.reset.yellow(stamp);
      }
      return chalk.reset.green(stamp);
    };
  } else if (medium) {
    colorStamp = function(stamp, value) {
      if (durationToSeconds(value || elapsed) >= medium) {
        return chalk.reset.yellow(stamp);
      }
      return chalk.reset.green(stamp);
    }
  } else if (high) {
    colorStamp  = function(stamp, value) {
      if (durationToSeconds(value || elapsed) >= high) {
        return chalk.reset.red(stamp);
      }
      return chalk.reset.green(stamp);
    }
  } else {
    colorStamp = function(stamp) {
      return chalk.reset(stamp);
    }
  }

  var formatStamp = (opts.type === 'absolute')
    ? function(s, v) {
      function fmt(s, v) {
        return colorStamp(s, v) + spacedBar;
      }
      // hack to detect the length of the timestamp and then optimize
      var blankPad = Array(s.length + 1).join(space);
      blank = blankPad + spacedBar;
      maxLineLength = termwidth - chalk.stripColor(blank).length;
      totalPrefix = blankPad.slice(totalLabel.length) + totalLabel;
      formatStamp = fmt;
      return fmt(s, v);
    }
    : function(s, v) {
      return padFor(s) + colorStamp(s, v) + spacedBar;
    };


    var lastLine = false;
    var overwrite;
    var autoUpdate;
    function scheduleAutoUpdate(stream) {
      autoUpdate = setTimeout(function() {
        var stamp;
        var elapsedLast = process.hrtime(last);
        if (opts.type === 'elapsed-line') {
          stamp = formatStamp(formatDuration(elapsedLast), elapsedLast);
        } else {
          stamp = formatStamp(createStampTime());
        }
        stream.queue(overwrite + stampLine(stamp, lastLine));
        scheduleAutoUpdate(stream);
      }, opts.realTime);
    }
    function setLastLine(line) {
      lastLine = line;
      overwrite = ansi.prefix + (~~(lastLine.length / maxLineLength) + 1) +
        ansi.up + ansi.prefix + ansi.clearLine;
    }

    var feed = opts.realTime
      ? function(stream, line) {
          feed = function(stream, line, last) {
            stream.queue(
              overwrite + stampLine(formatStamp(createStampTime()), lastLine)
            );
            if (autoUpdate) clearTimeout(autoUpdate);
            scheduleAutoUpdate(stream);
            setLastLine(line);
            if (!last) stream.queue(stampLine(blank, line));
          };
          stream.queue(stampLine(blank, line));
          setLastLine(line);
          scheduleAutoUpdate(stream);
      }
      : function(stream, line) {
          feed = function(stream, line, last) {
            if (!last)
              stream.queue(stampLine(formatStamp(createStampTime()), lastLine));
            lastLine = line;
          };
          lastLine = line;
      };

    var onData = (opts.ignoreBlank)
      ? function (line) {
        if (line) {
          tick();
          feed(this, line);
        }
      }
      : function (line) {
        tick();
        feed(this, line || '');
      };

    return through(onData, function end () {
      feed(this, '', true);
      this.queue(totalPrefix + spacedBar + formatDuration(elapsedTotal) + newline);
      if (autoUpdate) clearTimeout(autoUpdate);
    });
};
