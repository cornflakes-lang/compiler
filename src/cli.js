#!/usr/bin/env node

const meow = require('meow')
const chalk = require('chalk')
const pkg = require('../package.json')
const cli = meow({
  help: `
    Usage: ${chalk.bold.yellow`cornflakes`} ${chalk.bold.red`<file.corn>`}

    Options:
      ${chalk.bold.yellow`--help`}        This page, stupid
      ${chalk.bold.yellow`-o`} ${chalk.bold.red`<file.js>`}  Compile into file.js
      ${chalk.bold.yellow`--long  -l`}    Use long mode (see docs)
      ${chalk.bold.yellow`--version -v`}  Output version number and name, exit
  `,

  version: `
    ${chalk.bold.yellow`cornflakes`} ${chalk.bold.red(pkg.version)} ${chalk.bold.red(pkg.version_name)}
  `,
}, {
  alias: {
    l: 'long',
  },
})

//////////////////////////////////////////////////////////////////////////

const fs = require('fs')
const file = cli.input[0]

if(!file) {
  require('./cornflakes')()
  return
}

fs.readFile(file, 'utf8', (err, program) => {
  const parse = require('./parser')
  const compile = require('./compile')
  const uglify = require('uglify-js').minify
  const run = require('eval')

  if(err) {
    console.log(chalk.bold.red(`Failed to open ${chalk.white(file)} `))
    return
  }

  let parsed = parse(program, cli.flags.long)
  let compiled = compile(parsed)
  let uglified = uglify(compiled, { fromString: true })
  let code = uglified.code

  if(cli.flags.o) {
    fs.writeFile(cli.flags.o, code, 'utf8', err => {
      if(err) {
        console.log(chalk.bold.red(`Failed to write to ${chalk.white(cli.flags.o)} `))
      } else {
        console.log(`${chalk.bold.yellow(file)} -> ${chalk.bold.red(cli.flags.o)}`)
      }
    })
  } else {
    run(code, 'out.min.js', {}, true)
  }
})
