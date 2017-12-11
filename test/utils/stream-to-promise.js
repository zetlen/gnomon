module.exports = stream => new Promise((yay, boo) => {
  const out = [];
  stream.on('data', c => out.push(c));
  stream.on('end', () => yay(out));
  stream.on('error', e => boo(new Error(
`Error in stream after ${out.length} successful data events: ${e.message}
${e.stack} 
Data so far:
${out.map(v => JSON.stringify(v + '\n\n'))}
    `
  )));
});
