const make = require('nearley-make')
const fs = require('fs')
const path = require('path')

//////////////////////////////////////////////////////////////////////////

const grammar = fs.readFileSync(
  path.join(__dirname, '/', 'cornflakes.ne'),
  'utf-8')

module.exports = function parse(string) {
  const parser = make(grammar, { require })
  const asts = parser.feed(string).results

  if(asts.length > 1) {
    console.warn('Ambiguous grammar:')
    console.dir(asts, { depth: null })
  }

  return asts[0]
}
