var max = Number(process.argv.pop());
var min = Number(process.argv.pop());
if (isNaN(max) || isNaN(min)) {
  throw "Sorry, need two real number arguments."
}
if (min > max) {
  var ugh = max;
  max = min;
  min = ugh;
}
process.stdout.write(
  'Writing to stdout at random intervals between ' + min / 1000 + ' seconds ' +
    'and ' + max / 1000 + ' seconds. Beginning...\n'
);
var ms = 0;
function randomTime() {
  ms = Math.round(Math.random() * (max - min)) + min;
  process.stdout.write('This line should take about' + ms / 1000 + ' seconds\n');
  setTimeout(randomTime, ms);
}
randomTime();
