#!/usr/bin/env node
var dateutil = require('dateutil');
var split = require('split');
var chalk = require('chalk');
var through = require('through');
var argv = require('minimist')(process.argv.slice(2));

var fmt = argv._.length === 0 ? '[H:i:s.u O]' : argv._[0];

var createDate = function() {
  return dateutil.format(new Date(), fmt);
};

var createStamp = (argv.color === false || argv['no-color'])
  ? createDate : function() { return chalk.yellow(createDate()); }

process.stdin.pipe(split())
.pipe(through(function write (data) {
  this.queue(createStamp() + ' ' + data + '\n');;
}))
.pipe(process.stdout);
