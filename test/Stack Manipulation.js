const test = require('ava').test
const should = require('chai').should()
const run = require('./run')

//////////////////////////////////////////////////////////////////////////

test('o', t => {
  run(`"hello"o`).should.not.equal('hello')
})

test('d', t => {
  run(`"hello"d..`).should.equal('hellohello')
})

test('s', t => {
  run(`'a'b..`).should.equal('ba')
  run(`'a'bs..`).should.equal('ab')
})

test('c', t => {
  run(`"hello"c`).should.not.equal('hello')
})

test('r', t => {
  run(`'a'b'cr`).should.not.equal('cba')
})

test('>', t => {
  run(`'a'b'c>`).should.not.equal('cab')
})

test('<', t => {
  run(`'a'b'c<`).should.not.equal('bca')
})
