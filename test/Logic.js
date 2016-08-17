const test = require('ava').test
const should = require('chai').should()
const run = require('./run')

//////////////////////////////////////////////////////////////////////////

test('x', t => {
  run('{"hoi".}x').should.equal('hoi')
})

test('?', t => {
  run('1{"wow".}?').should.equal('wow')
  run('"kek"{"wow".}?').should.equal('wow')
  run('0{"wow".}?').should.not.equal('wow')
})

test('e', t => {
  run('1{"if".}{"else".}e').should.equal('if')
  run('FFF{"if".}{"else".}e').should.equal('if')
  run('0{"if".}{"else".}e').should.equal('else')
})

test('=', t => {
  run(`'a'a=`).should.equal('\u0001')
  run(`'a'b=`).should.equal('\u0000')
})

test('!', t => {
  run(`1!`).should.equal('\u0000')
  run(`0!`).should.equal('\u0001')
})

test('q', t => {
  run(`q"hoi"`).should.not.equal('hoi')
})
