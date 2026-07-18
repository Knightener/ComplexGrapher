
export let definedFunctions = new Map();
export let definedConstants = new Map();

const BUILTIN_FUNCTIONS = new Set(["exp", "sin", "cos"]);


export function nodeToJS(node) {
  if (node.type === "OperatorNode") {
    if (node.op === "*") return `${nodeToJS(node.args[0])}.mul(${nodeToJS(node.args[1])})`;
    if (node.op === "+") return `${nodeToJS(node.args[0])}.add(${nodeToJS(node.args[1])})`;
    if (node.op === "-" && node.args.length === 2) return `${nodeToJS(node.args[0])}.sub(${nodeToJS(node.args[1])})`;
    if (node.op === "-" && node.args.length === 1) return `${nodeToJS(node.args[0])}.scale(-1)`;
    if (node.op === "/") return `${nodeToJS(node.args[0])}.div(${nodeToJS(node.args[1])})`;
    if (node.op === "^") return `${nodeToJS(node.args[0])}.pow(${nodeToJS(node.args[1])})`;
  }
  if (node.type === "FunctionNode") {
    if (node.fn.name === "exp") return `${nodeToJS(node.args[0])}.exp()`;
    if (node.fn.name === "sin") return `${nodeToJS(node.args[0])}.sin()`;
    if (node.fn.name === "cos") return `${nodeToJS(node.args[0])}.cos()`;

    // user defined functions
    if (definedFunctions.has(node.fn.name)) {
      const args = node.args.map(a => nodeToJS(a)).join(", ");
      return `funcs.get("${node.fn.name}")(${args})`;
    }

    throw new Error(`undefined function: ${name}`);
  }
  if (node.type === "SymbolNode") return node.name;
  if (node.type === "ConstantNode") return `new Complex(${node.value})`;
  if (node.type === "ParenthesisNode") return `(${nodeToJS(node.content)})`;

  throw new Error(`unsupported node type: ${node.type}`);
}

export function nodeToGLSL(node, deps = null) {
  if (node.type === "OperatorNode") {
    if (node.op === "*") return `cmul(${nodeToGLSL(node.args[0], deps)}, ${nodeToGLSL(node.args[1], deps)})`;
    if (node.op === "+") return `(${nodeToGLSL(node.args[0], deps)} + ${nodeToGLSL(node.args[1], deps)})`;
    if (node.op === "-" && node.args.length === 2) return `(${nodeToGLSL(node.args[0], deps)} - ${nodeToGLSL(node.args[1], deps)})`;
    if (node.op === "-" && node.args.length === 1) return `(-1.0 * ${nodeToGLSL(node.args[0], deps)})`;
    if (node.op === "/") return `cdiv(${nodeToGLSL(node.args[0], deps)}, ${nodeToGLSL(node.args[1], deps)})`;
    if (node.op === "^") return `cpow(${nodeToGLSL(node.args[0], deps)}, ${nodeToGLSL(node.args[1], deps)})`;
  }
  if (node.type === "FunctionNode") {
    if (node.fn.name === "exp") return `cexp(${nodeToGLSL(node.args[0], deps)})`;
    if (node.fn.name === "sin") return `csin(${nodeToGLSL(node.args[0], deps)})`;
    if (node.fn.name === "cos") return `ccos(${nodeToGLSL(node.args[0], deps)})`;

    // adding new function to dependencies list
    if (deps) deps.add(node.fn.name);
    const args = node.args.map(a => nodeToGLSL(a, deps)).join(", ");
    return `${node.fn.name}(${args})`;
  }
  if (node.type === "SymbolNode") return node.name;
  if (node.type === "ConstantNode") return `vec2(${node.value.toFixed(8)}, 0.0)`;
  if (node.type === "ParenthesisNode") return `(${nodeToGLSL(node.content, deps)})`;

  throw new Error(`unsupported node type: ${node.type}`);
}

// Takes a list of objects containing a name and dependencies and returns the topsort, the cyclic refs, invalid functions and undefined functions.
// Invalid functions are those that depend on undefined functions. 
export function topoSortFunctions(entries) {
  const names = new Set(entries.map(e => e.name));
  const byName = new Map(entries.map(e => [e.name, e]));

  const order = [];
  const visited = new Set();
  const visiting = new Set();
  const cyclic = new Set();
  const undefinedRefs = new Set();

  function visit(name) {
    if (visited.has(name)) return;
    if (visiting.has(name)) { cyclic.add(name); return; }
    visiting.add(name);
    for (const dep of byName.get(name).deps) {
      if (!names.has(dep)) { undefinedRefs.add(dep); continue; }
      visit(dep);
      if (cyclic.has(dep)) cyclic.add(name);
    }
    visiting.delete(name);
    visited.add(name);
    if (!cyclic.has(name)) order.push(name);
  }

  for (const name of names) visit(name);
  return { order, cyclic, undefinedRefs };
}

export function buildDefinedFunctionsGLSL() {
  let source = "";
  for (const [name, entry] of definedFunctions.entries()) {
    console.log("entry:", name, entry);
    const { paramNames, body } = entry;
    const params = paramNames.map(p => `vec2 ${p}`).join(", ");
    source += `vec2 ${name}(${params}) {\n  return ${body};\n}\n\n`;
  }
  return source;
}