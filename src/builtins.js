module.exports = {
  // every function, builtins and CF functions, pops the amount of arguments it has
  // every function, builtins and CF functions, pushes their returned value to the parent's stack. for builtins, this is the value their JS function returns, and for CF functions the returned value is the last item in their stack after execution.
  // every builtin is passed two extra args before what they've really been passed: their context (parent, path, stack, vars) and whether or not the user is using Node.

  // Input / Output //////////////////////////////////////////////////////

  ',': function input(ctx, isNode) {
    var str = isNode ? builtinlocals.prompt() : window.prompt();
    var res = []

    for(var i = 0; i < str.length; i++) {
      res.push(str.charCodeAt(i).toString(16));
    }

    return res
  },

  '.': function output(ctx, isNode, str) {
    var res = '';
    if(typeof str === 'string') str = [str];

    for(var i = 0; i < str.length; i++) {
      res += String.fromCharCode(parseInt(str[i], 16));
    }

    if(isNode) process.stdout.write(res);
    else {
      var span = document.createElement('span');
      span.innerText = res;
      window.document.body.appendChild(span);
    }
  },

  '$': function dump(ctx, isNode) {
    var stack = JSON.stringify(ctx.stack, null, 2);

    if(isNode) process.stdout.write(stack);
    else {
      var pre = document.createElement('pre');
      pre.innerText = stack;
      window.document.body.appendChild(span);
    }
  },

  // Logic ///////////////////////////////////////////////////////////////

  x: function execute(ctx, isNode, fn) {
    var args = [];
    while(args.length < (fn.fn.length - 2)) {
      args.push(ctx.stack.pop());
    }
    args = args.reverse();
    console.log('ARGS |', args);
    fn.call(this.g, isNode, args);
  },

  '?': function if_(ctx, isNode, bool, fn) {
    if(bool !== '0') fn();
  },

  e: function if_else(ctx, isNode, bool, fn1, fn2) {
    if(bool === '0') fn1();
    else fn2();
  },

  '!': function not(ctx, isNode, bool) {
    return bool === '0' ? '1' : '0';
  },

  q: function quit(ctx, isNode) {
    throw 'terminate';
  },

  '=': function equals(ctx, isNode, a, b) {
    return JSON.stringify(a) === JSON.stringify(b) ? '1' : '0';
  },

  // Arithmetic //////////////////////////////////////////////////////////

  "+": function add(ctx, isNode, a, b) {
    return (parseInt(a, 16) + parseInt(b, 16)).toString(16);
  },

  "-": function subtract(ctx, isNode, a, b) {
    return (parseInt(a, 16) - parseInt(b, 16)).toString(16);
  },

  "*": function multiply(ctx, isNode, a, b) {
    return (parseInt(a, 16) * parseInt(b, 16)).toString(16);
  },

  "/": function divide(ctx, isNode, a, b) {
    return (parseInt(a, 16) / parseInt(b, 16)).toString(16);
  },

  "%": function modulo(ctx, isNode, a, b) {
    return (parseInt(a, 16) % parseInt(b, 16)).toString(16);
  },

  "A": function absolute(ctx, isNode, a) {
    return Math.abs(parseInt(a, 16)).toString(16);
  },

  f: function factorial(ctx, isNode, n) {
    var _n = parseInt(n, 16);
    var _p = 1;

    while(_n > 0) _p *= _n--;

    return _p.toString(16)
  },

  p: function prime(ctx, isNode, n) {
    n = parseInt(n, 16);

    if(n===1) {
      return '0';
    } else if(n === 2) {
      return '1';
    } else {
      for(var x = 2; x < n; x++) {
        if(n % x === 0) {
          return '0';
        }
      }
      return '1';
    }
  },

  '(': function increment(ctx, isNode, n) {
    return (parseInt(n, 16) + 1).toString(16)
  },

  ')': function decrement(ctx, isNode, n) {
    return (parseInt(n, 16) - 1).toString(16)
  },

  ';': function halve(ctx, isNode, n) {
    return (parseInt(n, 16) / 2).toString(16)
  },

  ':': function double(ctx, isNode, n) {
    return (parseInt(n, 16) * 2).toString(16)
  },

  t: function sqrt(ctx, isNode, n) {
    return Math.sqrt(parseInt(n, 16)).toString(16)
  },

  // Stack Manipulation //////////////////////////////////////////////////

  d: function duplicate(ctx, isNode, el) {
    ctx.stack.push(el)
    return el
  },

  s: function swap(ctx, isNode, a, b) {
    ctx.stack.push(a)
    return b
  },

  o: function pop(ctx, isNode, a) {},

  ">": function rotateRight(ctx, isNode) {
    ctx.stack = bultinlocals.rotateArray(ctx.stack, -1);
  },

  "<": function rotateLeft(ctx, isNode) {
    ctx.stack = builtinlocals.rotateArray(ctx.stack, 1);
  },

  r: function reverse(ctx, isNode) {
    ctx.stack = ctx.stack.reverse();
  },

  c: function clear(ctx, isNode) {
    ctx.stack = [];
  },

  // Strings /////////////////////////////////////////////////////////////

  h: function helloworld(ctx, isNode) {
    return ["48", "65", "6c", "6c", "6f", "2c", "20", "57", "6f", "72", "6c", "64", "21"];
  },

  a: function alphabet(ctx, isNode) {
    return ["61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a"];
  },

  u: function uppercase(ctx, isNode, str) {
    if(typeof str === 'string') str = [str]

    for(var i = 0; i < str.length; i++) {
      str[i] = String.fromCharCode(parseInt(str[i], 16)).toUpperCase().charCodeAt(0).toString(16);
    }

    return str
  },

  l: function lowercase(ctx, isNode, str) {
    if(typeof str === 'string') str = [str]

    for(var i = 0; i < str.length; i++) {
      str[i] = String.fromCharCode(parseInt(str[i], 16)).toLowerCase().charCodeAt(0).toString(16);
    }

    return str
  },

  n: function number(ctx, isNode, str) {
    for(var i = 0; i < str.length; i++) {
      str[i] = str[i].charCodeAt(0).toString(16);
    }

    return str;
  },

  N: function newline(ctx, isNode) {
    return ['A'];
  },

  // Arrays //////////////////////////////////////////////////////////////

  P: function pushArr(ctx, isNode, arr, el) {
    arr.push(el);
    return arr;
  },

  O: function popArr(ctx, isNode, arr) {
    return arr.pop();
  }
}
