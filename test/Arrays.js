const test = require('ava').test
const should = require('chai').should()
const run = require('./run')

//////////////////////////////////////////////////////////////////////////

test('P', t => {
  run(`'p"hel"P.`).should.equal('help')
})

test('O', t => {
  run(`"help"O.`).should.equal('p')
})

test('@', t => {
  run('"help"1@.').should.equal('e')
})