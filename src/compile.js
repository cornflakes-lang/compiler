const fs = require('fs')
const serialize = require('serialize-javascript')

//////////////////////////////////////////////////////////////////////////

const builtins = require('./builtins')
const b = require('./grammarbuiltins')
const noop = () => {}

Object.values = obj => Object.keys(obj).map(k => obj[k])

//////////////////////////////////////////////////////////////////////////

module.exports = function(main, silent) {
  if(silent) {
    console = { log: noop, dir: noop, error: noop, info: noop }
    process.stdout.write = noop
  }

  process.stdout.write('AST TREE | ')
  console.dir(main, { depth: null })

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

  F.constructor = F;

  function F(p, fn) {
    this.g = {
      parent: p,
      variables: {},
      path: [],
      stack: []
    };

    this.fn = fn;
  };

  F.prototype.push = function pushF(k) { this.g.stack.push(k); };
  F.prototype.pop = function popF(k) { return this.g.stack.pop(k); };
  F.prototype.call = function callF(ctx, args, doPush) {
    this.g.parent = ctx;
    this.g.stack  = [];

    var callWith = [ctx, isNode];
    for(var i = 0; i < this.fn.length - 2; i++) {
      callWith.push(args[i] || builtins[','].call(this.g, [], false));
    }

    var res = this.fn.apply(this, callWith);

    if(ctx && res && (doPush || true)) {
      ctx.stack.push(res);
    }
    return res;
  }

  var builtinlocals = {};
  if(isNode) {
    builtinlocals.prompt = require('readline-sync').prompt;
  }

  // rotateArray "stolen" from https://github.com/CMTegner/rotate-array/blob/master/index.js
  builtinlocals.rotateArray = function rotateArray(array, num) {
    num = (num || 0) % array.length;
    if (num < 0) {
      num += array.length;
    }
    var removed = array.splice(0, num);
    array.push.apply(array, removed);
    return array;
  };

  builtinlocals.string = {
    "cf2js": function cf2js(cf) {
      var ret = '';
      for(var i = 0; i < cf.length; i++) {
        ret += String.fromCharCode(parseInt(cf[i], 16));
      }
      return ret;
    },
    "js2cf": function js2cf(js) {
      var ret = [];
      for(var i = 0; i < js.length; i++) {
        ret.push(js[i].charCodeAt(0).toString(16));
      }
      return ret;
    }
  };
`
  res += `
  var builtins;
  new F(undefined, function(isNode, _) {
    this.g.variables = ${serialize(builtins)};
    builtins = this.g.variables;
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

  function dfnVar(name, value) {
    ctx.variables[name] = true
    return `this.g.variables.${name} = ${typeof value == 'string' ? value : JSON.stringify(value)};\n`
  }

  ////////////////////////////////////////////////////////////////////////

  fn.body.forEach(([type, v]) => {
    if(type === null) return

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
      res += indent + 'this.push(new F(' + parsePath(['this.g', ...(ctx.path)]) + ', function(' + (new Array(v.argnames.length + 2)).fill('_').join(',') + ') {\n'
      v.argnames.forEach(function(v, i) {
        res += indent + '  ' + dfnVar(v, 'arguments[' + (i + 2) + ']');
      })

      res = compile(indent + '  ', res, v, {
        parent: ctx,
        path: [],
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
  pops = '([' + pops.slice(0, pops.length - 1) + ']).reverse()'

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
