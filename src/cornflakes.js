const parse = require('./parser')
const compile = require('./compile')
const uglify = require('uglify-js').minify

//////////////////////////////////////////////////////////////////////////

const rl = require('readline-sync')
const fs = require('fs')

rl.promptLoop(line => {
  try {
    let compiled = compile(parse(line))

    // write to files ////////////////////////////////////////////////////

    let code = `/* compiled from \`${line}\` */\n` + compiled
    fs.writeFileSync('out.js', code, 'utf8')

    let uglified = uglify(code, {
      fromString: true
    })

    fs.writeFileSync('out.min.js', uglified.code, 'utf8')

    //////////////////////////////////////////////////////////////////////

    eval(uglified.code, 'out.min.js', {}, true)
    process.stdout.write('\n')
  } catch(e) {
    console.error(e)
  }
}, {
  prompt: '>>> '
})
