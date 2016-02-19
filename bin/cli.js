#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2), {
  string: ['format','type'],
  boolean: ['ignore-blank', 'ignoreBlank'],
  alias: {
    'format': 'f',
    'type': 't',
    'ignoreBlank': ['ignore-blank','quiet','q','i'],
    'high': 'h',
    'medium': 'm'
  }
});
var split = require('split');
var gnomon = require('../');
process.stdin.pipe(split())
.pipe(gnomon(argv))
.pipe(process.stdout);
