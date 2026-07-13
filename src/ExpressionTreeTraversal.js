
export let definedFunctions = new Map();
export let definedConstants = new Map();


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

export function nodeToGLSL(node) {
  if (node.type === "OperatorNode") {
    if (node.op === "*") return `cmul(${nodeToGLSL(node.args[0])}, ${nodeToGLSL(node.args[1])})`;
    if (node.op === "+") return `(${nodeToGLSL(node.args[0])} + ${nodeToGLSL(node.args[1])})`;
    if (node.op === "-" && node.args.length === 2) return `(${nodeToGLSL(node.args[0])} - ${nodeToGLSL(node.args[1])})`;
    if (node.op === "-" && node.args.length === 1) return `(-1.0 * ${nodeToGLSL(node.args[0])})`;
    if (node.op === "/") return `cdiv(${nodeToGLSL(node.args[0])}, ${nodeToGLSL(node.args[1])})`;
    if (node.op === "^") return `cpow(${nodeToGLSL(node.args[0])}, ${nodeToGLSL(node.args[1])})`;
  }
  if (node.type === "FunctionNode") {
    if (node.fn.name === "exp") return `cexp(${nodeToGLSL(node.args[0])})`;
    if (node.fn.name === "sin") return `csin(${nodeToGLSL(node.args[0])})`;
    if (node.fn.name === "cos") return `ccos(${nodeToGLSL(node.args[0])})`;
    
    if (definedFunctions.has(node.fn.name)) {
      const args = node.args.map(a => nodeToGLSL(a)).join(", ");
      return `${node.fn.name}(${args})`;
    }

    throw new Error(`undefined function: ${node.fn.name}`);
  }
  if (node.type === "SymbolNode") return node.name;
  if (node.type === "ConstantNode") return `vec2(${node.value.toFixed(8)}, 0.0)`;
  if (node.type === "ParenthesisNode") return `(${nodeToGLSL(node.content)})`;

  throw new Error(`unsupported node type: ${node.type}`);
}