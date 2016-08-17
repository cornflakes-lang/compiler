const test = require('ava').test
const should = require('chai').should()
const run = require('./run')

//////////////////////////////////////////////////////////////////////////

test('character', t => {
  run(`'p`).should.equal('p')
})

test('string', t => {
  run(`"kek"`).should.equal('kek')
})

test('hex number', t => {
  run(`2A`).should.equal('*')
  run(`2#A`).should.equal('\n')
})
