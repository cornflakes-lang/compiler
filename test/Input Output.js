const test = require('ava').test
const should = require('chai').should()
const run = require('./run')

//////////////////////////////////////////////////////////////////////////

test(',', t => {
  run(`,`, `hoi`).should.equal('hoi')
})

test(', (implicit)', t => {
  run(`.`, `hi`).should.equal('hi')
})

test('.', t => {
  run(`"foo".`).should.equal('foo')
})

test('. (implicit)', t => {
  run(`"bar"`).should.equal('bar')
})

test('$', t => {
  run(`2A$`).should.equal(`[\n  "2A"\n]*`)
})
