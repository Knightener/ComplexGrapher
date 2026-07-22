
import { create, all } from 'mathjs';
import Complex from './Complex'
import { definedFunctions, nodeToGLSL, nodeToJS } from './ExpressionTreeTraversal';

const math = create(all);

const SPECIAL = ["sin", "cos", "tan", "sqrt", "log", "exp", "abs", "pi", "tau"];

const SPECIAL_CHAR = '!'

/* Parses a latex expression into a lambda (e.g. f(x,y) = x + y returns a lambda of two variables representing x + y)
Invalid expression returns null.*/
export function parseLatexToJS(latex) {
    if (latex.includes("^{ }")) {
        return null
    }
    try {
        latex = parseLatexParentheses(latex)
        const varNames = getVariableNames(latex);
        const right = latex.split("=")[1].trim();

        // empty function
        if (right === "") {
            return null;
        }

        const mathJSExpression = parseLatexToMathJS(right);

        const generatedCode = nodeToJS(math.parse(mathJSExpression))
        const params = varNames.join(", ").replaceAll("{", "").replaceAll("}", "");
        const fn = new Function("Complex", "funcs", `return function(${params}) {return ${generatedCode};}`);
        return { name: getFunctionName(latex), function: fn(Complex, definedFunctions) };
    } catch {
        return null;
    }
}

export function parseLatexToGLSL(latex) {
    if (latex.includes("^{ }")) return null;
    try {
        latex = parseLatexParentheses(latex);
        const eqIndex = latex.indexOf("=");
        if (eqIndex === -1) return null;
        const left = latex.slice(0, eqIndex);

        let name, variables;
        if (left.includes("(")) {
            variables = getVariableNames(latex).map(v => v.replaceAll("{", "").replaceAll("}", ""));
            name = getFunctionName(latex);
        } else {
            name = left.replaceAll("{", "").replaceAll("}", "").trim();
            if (!name) return null;
            variables = [];
        }

        const right = latex.slice(eqIndex + 1).trim();
        if (right === "") return null;

        const mathJSExpression = parseLatexToMathJS(right);
        const deps = new Set();
        const fn = nodeToGLSL(math.parse(mathJSExpression), deps, variables);

        return { name, function: fn, paramNames: variables, deps: [...deps] };
    } catch {
        return null;
    }
}
// Assumes parentheses already handled
function parseLatexToMathJS(latex) {
    let parsed = replaceFractions(latex)

    parsed = parsed
        // Multiplications
        .replaceAll("\\cdot", "*")
        // Remaining slashes (e.g, functions, spaces)
        .replaceAll("\\", "")
        // Remaining spaces
        .replaceAll(" ", "")
    parsed = addMultiplications(parsed)

    // Remaining curly brackets (e.g, powers)
    return parsed.replaceAll("{", "(").replaceAll("}", ")")
}

function parseLatexParentheses(latex) {
    return latex.replaceAll("\\left(", "(").replaceAll("\\right)", ")")
}

// Replaces latex fractions with regular fractions (/frac{x}{y} -> x/y)
function replaceFractions(latex) {
    while (latex.includes("\\frac")) {
        const fracIndex = latex.indexOf("\\frac");
        const openBrace1 = latex.indexOf("{", fracIndex);
        const numerator = extractBraceContent(latex, openBrace1);
        const openBrace2 = openBrace1 + numerator.length + 2;
        const denominator = extractBraceContent(latex, openBrace2);
        const full = latex.slice(fracIndex, openBrace2 + denominator.length + 2);
        latex = latex.replace(full, `((${numerator})/(${denominator}))`);
    }
    return latex;
}

// Returns the content inside the brace at start
function extractBraceContent(string, start) {
    let depth = 0;
    let i = start;
    while (i < string.length) {
        if (string[i] === "{") depth++;
        if (string[i] === "}") depth--;
        if (depth === 0) return string.slice(start + 1, i);
        i++;
    }
    return null;
}

// Surrounds function/constant strings with the special character
function protectSpecial(string) {
    for (const special of SPECIAL) {
        string = string.replaceAll(special, SPECIAL_CHAR + special + SPECIAL_CHAR);
    }
    return string
}

// Removes the special character
function removeSpecial(string) {
    return string.replaceAll(SPECIAL_CHAR, "")
}

function protectSubscripts(string) {
    return string.replace(/[a-zA-Z]+_\{[a-zA-Z0-9]+\}/g, match =>
        SPECIAL_CHAR + match + SPECIAL_CHAR
    );
}

// runs after protectSpecial and protectSubscripts
function protectVariables(string) {
    let active = true;
    let result = ""
    for (let i = 0; i < string.length; i++) {
        if (string[i] == SPECIAL_CHAR) {
            active = !active;
        }
        if (active && /[a-zA-Z]/.test(string[i])) {
            result = result + SPECIAL_CHAR + string[i] + SPECIAL_CHAR;
        } else {
            result = result + string[i]
        }
    }
    return result;
}

// Adds multiplications between alphanumeric characters and before specials
function addMultiplications(string) {
    string = protectSpecial(string)
    string = protectSubscripts(string)
    string = protectVariables(string)

    string = string.replaceAll(SPECIAL_CHAR + SPECIAL_CHAR, SPECIAL_CHAR + '*' + SPECIAL_CHAR);
    string = string.replace(/_\{(\w+)\}/g, "_$1")
    return removeSpecial(string)
}

// Returns the variable names of the latex expression (e.g. f(x,y) = x + y returns [x,y])
function getVariableNames(latex) {
    let varList = latex.slice(latex.indexOf("(") + 1, latex.indexOf(")"))
    return varList.split(",")
}

function getFunctionName(latex) {
    return latex.slice(0, latex.indexOf("(")).replaceAll("{", "").replaceAll("}", "");
}