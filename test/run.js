module.exports = function run(code, stdin) {
  const path = require('path')
  const parse = require(path.join(__dirname, '../', 'src/', 'parser.js'))
  const compile = require(path.join(__dirname, '../', 'src/', 'compile.js'))
  const exec = require('eval')

  let out = ''
  const write = function(str) {
    out += str
  }

  try {
    exec(compile(parse(code), true), 'run()', {
      process: {
        stdout: { write }
      },
      console: {
        log: () => {},
        dir: () => {},
        warn: () => {},
        error: () => {},
        info: () => {}
      },
      module: { exports: {} },
      require: function(m) {
        if(m === 'readline-sync') {
          // fake stdin ;)
          return { prompt: () => stdin }
        } else {
          return require(m)
        }
      }
    }, false)
  } catch(e) {
    return e.message
  }

  return out
}
