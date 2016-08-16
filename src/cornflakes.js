const parse = require('./parser')
const compile = require('./compile')
const uglify = require('uglify-js').minify

//////////////////////////////////////////////////////////////////////////

const readline = require('readline')
const fs = require('fs')

const rl = readline.createInterface({
  input: process.stdin
})

rl.on('line', line => {
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

  process.stdout.write('> ')
})

process.stdout.write('> ')
