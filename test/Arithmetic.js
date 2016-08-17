const test = require('ava').test
const should = require('chai').should()
const run = require('./run')

//////////////////////////////////////////////////////////////////////////

test('+', t => {
  run(`1#2+`).should.equal('\u0003')
  run(`FF#0+`).should.equal('\u00FF')
})

test('-', t => {
  run(`41#1-`).should.equal('@')
})

test('*', t => {
  run(`1#2*`).should.equal('\u0002')
})

test('/', t => {
  run(`A#2/`).should.equal('\u0005')
})

test('%', t => {
  run(`5#5%`).should.equal('\u0000')
  run(`A#5%`).should.equal('\u0005')
})

test('A', t => {
  run(`0#5-A`).should.equal('\u0005') // abs(0 - 5) = 5
})

test('f', t => {
  run(`5f`).should.equal('x') // 5! = 120
})

test('p', t => {
  run(`Fp`).should.equal('\u0000')
  run(`2p`).should.equal('\u0001')
  run(`EC4BA7p`).should.equal('\u0001') // millionth prime number
})

test('(', t => {
  run(`1(`).should.equal('\u0002')
})

test(')', t => {
  run(`1)`).should.equal('\u0000')
})

test(';', t => {
  run(`2;`).should.equal('\u0001')
  run(`A;`).should.equal('\u0005')
})

test(':', t => {
  run(`2:`).should.equal('\u0004')
  run(`A:`).should.equal('\u0014')
})

test('t', t => {
  run(`100t`).should.equal('\u0010') // sqrt of 256 = 16
})
