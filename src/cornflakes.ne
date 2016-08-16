@{%

function removeNull(obj) {
  const isArray = obj instanceof Array

  for(let k in obj) {
    if(obj[k] === null) isArray ? obj.splice(k, 1) : delete obj[k]
    else if(typeof obj[k] == "object") removeNull(obj[k])
    if(isArray && obj.length == k) removeNull(obj)
  }

  return obj
}

const builtins = require('./grammarbuiltins')

%}

@builtin "string.ne"
@builtin "whitespace.ne"

main    -> _ program:* _    {% d => new builtins.CFFunction(d[1] || [], 0, []) %}
program -> string           {% d => d[0] %}
         | num              {% d => d[0] %}
         | variable         {% d => d[0] %}
         | "{" main "}" argsDefinition:? "|" {% d => {
           let body = d[1].body

           if(!d[3]) d[3] = [[0, null], '|']

           let args = d[3][0][0]
           let argnames = (d[3][0][1] || []).map(v => v[0])

           return [builtins.NAMES.FUNCTION, new builtins.CFFunction(body, args, argnames)]
         } %}
         | " " {% d => [null, null] %}

argsDefinition -> varchar:+ {% d => [d[0].length, d[0]] %}

string   -> dqstring        {% d => [builtins.NAMES.STRING, new builtins.CFString(d[0].split('').map(char => new builtins.CFNumber(char.charCodeAt(0).toString('16'))))] %}
          | "'" .           {% d => [builtins.NAMES.STRING, new builtins.CFString([new builtins.CFNumber(d[1].charCodeAt(0).toString('16'))])] %}

variable -> varchar         {% d => [builtins.NAMES.VARIABLE, new builtins.CFVariable(d[0][0])] %}
varchar  -> [^A-F0-9""''\-{}| ]

num      -> longnum           {% (d, l, r) => {
  if(isNaN(parseInt(d[0], 16))) return r
  else return [builtins.NAMES.NUMBER, new builtins.CFNumber(d[0].join(''))]
} %}
longnum -> [A-F0-9]:+ {% d => d[0] %}
