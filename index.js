var dateutil = require('dateutil');
var chalk = require('chalk');
var through = require('through');

module.exports = function(opts) {
  var fmt = opts.format || 'H:i:s.u O';
  var nullString = '';
  var newline = '\n';
  var space = ' ';
  var sAbbr = 's';
  var places = 3;
  var maxDurLen = 5 + places; // four digits of seconds, decimal place, places
  var spacePads = [space,'  ','   '];
  var start = (new Date()).getTime();
  var last = start;
  var now = start;
  var elapsed = 0;
  var leftBar = chalk.dim('[');
  var rightBar = chalk.dim(']');
  function tick() {
    now = (new Date()).getTime();
    elapsed = now - last;
    last = now;
  }
  function formatDuration(duration) {
    return (duration / 1000).toFixed(3) + sAbbr;
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
      return formatDuration(now - start);
    },
    'absolute': function() {
      return dateutil.format(new Date(), fmt);
    }
  })[opts.type || 'elapsed-line'];

  var colorStamp;
  var high = opts.high && opts.high * 1000;
  var medium = opts.medium && opts.medium * 1000;
  if (medium && high) {
    colorStamp = function() {
      if (elapsed >= high) {
        return chalk.reset.red(createStampTime());
      }
      if (elapsed >= medium) {
        return chalk.reset.yellow(createStampTime());
      }
      return chalk.reset.green(createStampTime());
    };
  } else if (medium) {
    colorStamp = function() {
      if (elapsed >= medium) {
        return chalk.reset.yellow(createStampTime());
      }
      return chalk.reset.green(createStampTime());
    }
  } else if (high) {
    colorStamp  = function() {
      if (elapsed >= high) {
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
