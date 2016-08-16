const fs = require('fs')
const serialize = require('serialize-javascript')

//////////////////////////////////////////////////////////////////////////

const builtins = require('./builtins')
const b = require('./grammarbuiltins')

Object.values = obj => Object.keys(obj).map(k => obj[k])

//////////////////////////////////////////////////////////////////////////

module.exports = function(main) {
  // global context
  let ctx = {
    parent: undefined,
    path: [],
    variables: builtins,
    stack: []
  }

  let res = ''

  res += `
try {
  var isNode = typeof module === 'object' && typeof module.exports === 'object';
  var root = isNode ? global : window;

  var F = function(p, fn) {
    this.g = {
      parent: p,
      variables: {},
      stack: []
    };

    this.fn = fn;
  };

  F.prototype.push = function(k) { this.g.stack.push(k); };
  F.prototype.pop = function(k) { return this.g.stack.pop(k); };
  F.prototype.call = function(ctx, args) {
    this.g.parent = ctx;
    this.g.stack  = [];

    var callWith = [ctx, isNode];
    for(var i = 0; i < this.fn.length - 2; i++) {
      callWith.push(args[i] || builtins[','].call(this.g, isNode, []));
    }
    var res = this.fn.apply(this, callWith);
    if(ctx && res)
      ctx.stack.push(res);
  }

  var builtinlocals = {}
  if(isNode) {
    builtinlocals.prompt = require('readline-sync').prompt;
  }

  // rotateArray "stolen" from https://github.com/CMTegner/rotate-array/blob/master/index.js
  builtinlocals.rotateArray = function(array, num) {
    num = (num || 0) % array.length;
    if (num < 0) {
      num += array.length;
    }
    var removed = array.splice(0, num);
    array.push.apply(array, removed);
    return array;
  };
`

  res += `
  var builtins;
  new F(undefined, function(isNode, _) {
    this.g.variables = ${serialize(builtins)};
    builtins = ${serialize(builtins)};` + /* we want the value of this.g.variables but don't want to keep a reference to it, and this is the fastest way. */ `
    for(var builtin in this.g.variables) {
      if(!(this.g.variables.hasOwnProperty(builtin))) continue;
      this.g.variables[builtin] = new F({}, this.g.variables[builtin]);
    }
    var lastCommand = null;
`

  res = compile('    ', res, {
    body: [
      [
        b.NAMES.FUNCTION,
        main
      ]
    ]
  }, ctx, [])
  // TODO when we implement user-defined functions: check to see that the last stack item isn't a function
  var oPath = improveFindReturn(find('.', ctx, []))
  res += `
    this.pop().call(this.g, []);

    if(!(lastCommand == ${ parsePath(['this.g', ...oPath]) } || this.g.stack[this.g.stack.length - 1] instanceof F )) {
      ${ compileCallToPath(oPath, ctx) }
    }\n`

  res += `  }).call(undefined, []);
} catch(e) {
  if(e !== 'terminate') {
    throw e;
  }
}`

  return res
}

function compile(indent, res, fn, ctx) {

  function dfnVar(name, path) {
    evalPath(path).variables[name] = true
    res += indent + `${parsePath(['this.g', ...path, 'variables', name])} = undefined;\n`
  }

  ////////////////////////////////////////////////////////////////////////

  fn.body.forEach(([type, v]) => {
    if(type === b.NAMES.STRING) {
      res += indent + 'this.push(['
      res += v.value.map(char => serialize(char.value)).join(', ')
      res += ']);\n'
    }

    if(type === b.NAMES.NUMBER) {
      res += indent + 'this.push('
      res += serialize(v.value)
      res += ');\n'
    }

    if(type === b.NAMES.VARIABLE) {
      res += indent + compileCallToVar(v.name, ctx) + '\n'
    }

    if(type === b.NAMES.FUNCTION) {
      res += indent + 'this.push(new F(' + parsePath(['this.g', ...(ctx.path)]) + ', function() {\n'
      res = compile(indent + '  ', res, v, {
        parent: ctx,
        variables: {},
        stack: []
      }, [], ctx)

      res += indent + '  return this.pop();\n'
      res += indent + '}));\n'
    }
  })

  return res
}


// A path is an array of strings describing how to navigate from the variable `ctx` to get somewhere. For example, `ctx.variables.a.stack[0]` as a path would be `['variables', 'a', 'stack', 0]`.
// find takes one of these as it's second argument and returns one, parsePath returns a string representation of a path and evalPath evaluates a path and returns the value after travelling that path.

function find(what, origin, path, recursions) {
  recursions = recursions || 0
  let evaledPath = evalPath(origin, path)

  if(Object.keys(evaledPath.variables).indexOf(what) > -1)
    return { path: [...path, 'variables', what], recursions }
  if(!evaledPath.parent)
    return { path: null, recursions }

  return find(what, evaledPath.parent, evaledPath.parent.path, recursions + 1)
}
function improveFindReturn(find) {
  return (new Array(find.recursions).fill('parent')).concat(find.path)
}
function compileCallToPath(path, ctx) {
  let fn = evalPath(ctx, path)

  let pops = 'this.pop(),'.repeat(fn.length - 2)
  pops = '[' + pops.slice(0, pops.length - 1) + ']'

  return `${ parsePath(['this.g', ...path]) }.call(this.g, ${pops}); lastCommand = ${ parsePath(['this.g', ...path]) };`
}
function compileCallToVar(v, ctx) {
  let where = find(v, ctx, ctx.path)
  
  if(where.path === null) {
    throw 'Variable ' + v + ' is undefined'
  } else {
    return compileCallToPath(improveFindReturn(where), ctx)
  }
}

function parsePath(path) {
  path = path || []

  let res = path[0]
  path.slice(1).forEach(v => res += '[' + serialize(v) + ']')

  return res
}

function evalPath(origin, path) {
  path = path || []

  let res = origin
  path.forEach(v => {
    res = res[v]
  })

  return res
}
