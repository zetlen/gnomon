var fs = require('fs');
var path = require('path');
var local = path.join.bind(path, __dirname);
var up = path.resolve.bind(path, __dirname, '..');
var docExt = '.md';
console.log('Reading docs from ./docs...');
var docs = fs.readdirSync(__dirname)
  .filter(function(file) {
    return fs.statSync(local(file)).isFile() &&
      path.extname(file) === docExt;
  })
  .reduce(function(out, name) {
    out[path.basename(name, docExt)] = fs.readFileSync(local(name), 'utf8') + '\n\n';
    return out;
  }, {});

console.log('Assembling README and CLI help...');
var readme = docs.intro + docs.usage + docs.installation + docs.license;
var printUsage = docs.usage + '\n' + docs.license;
var cliSource = fs.readFileSync(local('cli-template.js'), 'utf8');

console.log('Writing README...');
fs.writeFileSync(up('README.md'), readme, 'utf8');
console.log('Writing CLI help...');
fs.writeFileSync(
    up('cli.js'),
    cliSource.replace(/__USAGE__/, JSON.stringify(printUsage))
);
console.log('Done.');