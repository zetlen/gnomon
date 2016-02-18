var dateutil = require('dateutil');
var chalk = require('chalk');
var through = require('through');

module.exports = function(opts) {
  var fmt = opts.format || 'H:i:s.u O';
  var zeroPads = ['0','00','000'];
  var start = (new Date()).getTime();
  var last = start;
  var now = start;
  var elapsed = 0;
  function tick() {
    now = (new Date()).getTime();
    elapsed = now - last;
    last = now;
  }
  function formatDuration(duration) {
    var s = (duration / 1000).toFixed(3);
    var l = s.length;
    var pad = l < 8 ? zeroPads[7 - l] : '';
    return pad + s;
  }
  function formatStamp(stamp) {
    return '[' + stamp + ']';
  }
  function stampLine(stamp, line) {
    return stamp + ' ' + line + '\n';
  }

  var createStampTime = ({
    'elapsed-line': function() {
      return formatStamp(formatDuration(elapsed));
    },
    'elapsed-total': function() {
      return formatStamp(formatDuration(now - start));
    },
    'absolute': function() {
      return formatStamp(dateutil.format(new Date(), fmt));
    }
  })[opts.type || 'elapsed-line'];

  var createStamp;
  if (opts.medium && opts.high) {
    createStamp = function() {
      if (elapsed >= opts.high) {
        return chalk.reset.red(createStampTime());
      }
      if (elapsed >= opts.medium) {
        return chalk.reset.yellow(createStampTime());
      }
      return chalk.reset.green(createStampTime());
    };
  } else if (opts.medium) {
    createStamp = function() {
      if (elapsed >= opts.medium) {
        return chalk.reset.yellow(createStampTime());
      }
      return chalk.reset.green(createStampTime());
    }
  } else if (opts.high) {
    createStamp = function() {
      if (elapsed >= opts.high) {
        return chalk.reset.red(createStampTime());
      }
      return chalk.reset.green(createStampTime());
    }
  } else {
    createStamp = function() {
      return chalk.reset(createStampTime());
    }
  }

  var lastLine = false;

  var feed = function(stream) {
    stream.queue(stampLine(createStamp(), lastLine));
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
