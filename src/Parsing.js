import * as math from "mathjs";

const SPECIAL = ["sin", "cos", "tan", "sqrt", "log", "exp", "abs", "pi"];

const SPECIAL_CHAR = '!'

export function parseLatex(latex) {
    let parsed = replaceFractions(latex)

    parsed = parsed
    // Left parantheses
    .replaceAll("\\left(", "(")
    // Right parantheses
    .replaceAll("\\right)", ")")
    // Multiplications
    .replaceAll("\\cdot", "*")
    // Remaining slashes (e.g, functions, spaces)
    .replaceAll("\\", "")

    return addMultiplications(parsed)
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
        latex = latex.replace(full, `(${numerator})/(${denominator})`);
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

// Surrounds special strings with the special character
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

// Adds multiplications between alphanumeric characters and before specials
function addMultiplications(string) {
    string = protectSpecial(string)
    let active = true;
    for (let i = 0; i < string.length - 1; i++) {
        if (active) {
            if (isAlphaNumerical(string[i]) && (isAlphaNumerical(string[i + 1]) || string[i + 1] === SPECIAL_CHAR )) {
                string = string.slice(0, i + 1) + '*' + string.slice(i + 1)
                // Accounts for length change
                i++
            }
        }
        if (string[i] === SPECIAL_CHAR) {
            active = !active
        }
    }
    return removeSpecial(string)
}

function isAlphaNumerical(character) {
    return /[a-zA-Z0-9]/.test(character);
}