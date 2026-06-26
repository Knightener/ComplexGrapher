import * as math from "mathjs";


export function parseLatex(latex) {
    let parsed = latex.replaceAll("\\left(","(").replaceAll("\\right)",")")
    return replaceFractions(parsed)
}

// fixes the fraction
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

// returns the content inside the brace at start
function extractBraceContent(str, start) {
  let depth = 0;
  let i = start;
  while (i < str.length) {
    if (str[i] === "{") depth++;
    if (str[i] === "}") depth--;
    if (depth === 0) return str.slice(start + 1, i);
    i++;
  }
  return null;
}