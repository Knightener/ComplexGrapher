
export let definedFunctions = new Map();
export let definedConstants = new Map();

// test
definedFunctions.set("g", z => z.exp());

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