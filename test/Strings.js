const test = require('ava').test
const should = require('chai').should()
const run = require('./run')

//////////////////////////////////////////////////////////////////////////

test('h', t => {
  run(`h.`).should.equal('Hello, World!')
})

test('a', t => {
  run(`a.`).should.equal('abcdefghijklmnopqrstuvwxyz')
})

test('N', t => {
  run(`N.`).should.equal('\n')
})

test('u', t => {
  run(`"hello"u.`).should.equal('HELLO')
  run(`'hu.`).should.equal('H')
  run(`69u.`).should.equal('I')
  run(`'Pu.`).should.equal('P')
})

test('l', t => {
  run(`"HELLO"l.`).should.equal('hello')
  run(`'Kl.`).should.equal('k')
  run(`49l.`).should.equal('i')
  run(`'ll.`).should.equal('l')
})

test('n', t => {
  run(`FFn.`).should.equal('FF')
})
