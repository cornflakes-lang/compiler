const parse = require('./parser')
const compile = require('./compile')
const run = require('eval')

//////////////////////////////////////////////////////////////////////////

const rl = require('readline-sync')
let exit = false

module.exports = function() {
  rl.promptLoop(line => {
    if(line === '') {
      if(exit) {
        process.exit()
      } else {
        console.log('(To exit, enter nothing again)')
        exit = true
        return
      }
    } else {
      exit = false
    }

    try {
      let compiled = compile(parse(line))
      run(compiled, 'out.min.js', {}, true)

      process.stdout.write('\n')
    } catch(e) {
      console.error(e)
    }
  }, {
    prompt: '>>> '
  })
}
