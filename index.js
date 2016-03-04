var repeating = require('repeating');
var dateutil = require('dateutil');
var chalk = require('chalk');
var through = require('through');

var termwidth = require('window-size').width;
var newline = require('os').EOL;
var ansi = {
  prefix: '\x1b[',
  up: 'A',
  clearLine: '0G'
};

var nanoPow = Math.pow(10,9);
function durationToSeconds(dur) {
  return dur[0] + dur[1] / nanoPow;
}

var space = ' ';
var sAbbr = 's';
var places = 4;
var maxDisplaySecondsDigits = 4;
function formatDuration(dur) {
  return durationToSeconds(dur).toFixed(places) + sAbbr;
}

var start = process.hrtime();
var elapsedLine = [0,0];
var elapsedTotal = [0,0];
var lap = start;
var last = start;
function tick(resetLine) {
  var now = process.hrtime();
  if (resetLine) {
    lap = now;
    elapsedLine = process.hrtime(last);
  } else {
    elapsedLine = process.hrtime(lap);
  }
  elapsedTotal = process.hrtime(start);
  last = process.hrtime();
}

var nullString = '';
function padFor(s, max) {
  var l = s.length;
  return l < max ? repeating(space, max - l) : nullString;
}

var bar = space + chalk.reset.inverse(' ') + space;
var totalLabel = 'Total';

module.exports = function(opts) {
  opts = opts || {};
  var fmt = opts.format || 'H:i:s.u O';
  var type = opts.type || 'elapsed-line';

  var stampers = {
    'elapsed-line': function() {
      return formatDuration(elapsedLine);
    },
    'elapsed-total': function() {
      return formatDuration(elapsedTotal);
    },
    'absolute': function() {
        return dateutil.format(new Date(), fmt);
    }
  };

  var maxDurLength, blank, maxLineLength;
  if (type === 'absolute') {
    maxDurLength = stampers.absolute().length;
  } else {
    maxDurLength = maxDisplaySecondsDigits + places + 2; // dot and 's'
  }
  maxDurLength = Math.max(maxDurLength, totalLabel.length);
  blank = repeating(space, maxDurLength) + bar;
  maxLineLength = termwidth - chalk.stripColor(blank).length;

  function stampLine(stamp, line) {
    var len = line ? chalk.stripColor(line).length : 0;
    if (len > maxLineLength) {
      return stamp + line.slice(0, maxLineLength) + newline +
        stampLine(blank, line.slice(maxLineLength));
    }
    return stamp + line + newline;
  }

  var colorStamp;
  var high = opts.high;
  var medium = opts.medium;
  if (medium && high) {
    colorStamp = function(stamp) {
      var seconds = durationToSeconds(elapsedLine);
      if (seconds >= high) {
        return chalk.reset.red(stamp);
      }
      if (seconds >= medium) {
        return chalk.reset.yellow(stamp);
      }
      return chalk.reset.green(stamp);
    };
  } else if (medium) {
    colorStamp = function(stamp) {
      if (durationToSeconds(elapsedLine) >= medium) {
        return chalk.reset.yellow(stamp);
      }
      return chalk.reset.green(stamp);
    }
  } else if (high) {
    colorStamp  = function(stamp) {
      if (durationToSeconds(elapsedLine) >= high) {
        return chalk.reset.red(stamp);
      }
      return chalk.reset.green(stamp);
    }
  } else {
    colorStamp = function(stamp) {
      return chalk.reset(stamp);
    }
  }

  var createStamp = stampers[type];

  function createFormattedStamp(text, value) {
    var text = createStamp();
    return padFor(text, maxDurLength) + colorStamp(text, value) + bar;
  }

  var lastLine = false;
  var overwrite;
  var autoUpdate;
  function scheduleAutoUpdate(stream) {
    autoUpdate = setTimeout(function() {
      tick(false);
      stream.queue(
        overwrite + stampLine(createFormattedStamp(), lastLine)
      );
      scheduleAutoUpdate(stream);
    }, opts.realTime);
  }
  function setLastLine(line) {
    lastLine = line;
    overwrite = ansi.prefix + (~~(lastLine.length / maxLineLength) + 1) +
      ansi.up + ansi.prefix + ansi.clearLine;
  }

  var feed;
  if (opts.realTime) {
    feed = function(stream, line, last) {
      feed = function(stream, line, last) {
        tick(false);
        stream.queue(
          overwrite + stampLine(createFormattedStamp(), lastLine)
        );
        tick(true);
        if (autoUpdate) clearTimeout(autoUpdate);
        scheduleAutoUpdate(stream);
        setLastLine(line);
        if (!last) stream.queue(stampLine(blank, line));
      };
      stream.queue(stampLine(blank, line));
      setLastLine(line);
      scheduleAutoUpdate(stream);
    }
  } else {
    feed = function(stream, line, last) {
      feed = function(stream, line, last) {
        tick(true);
        if (!last)
          stream.queue(stampLine(createFormattedStamp(), lastLine));
        lastLine = line;
      };
      lastLine = line;
    }
  }

  var onData;
  if (opts.ignoreBlank) {
    onData = function(line) { if (line) feed(this, line); }
  } else {
    onData = function(line) { feed(this, line); }
  }

  return through(onData, function end () {
    feed(this, '', true);
    this.queue(
      stampLine(blank, '') +
      padFor(totalLabel, maxDurLength) + totalLabel + bar +
        formatDuration(elapsedTotal) + newline
    );
    if (autoUpdate) clearTimeout(autoUpdate);
  });

};
