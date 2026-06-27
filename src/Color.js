
import * as math from "mathjs"
// Returns the ABGR value as an int. h: 0-360, s:0-1, l:0-1
function hslToABGR(h, s, l) {
    h = h % 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r, g, b;

    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return (255 << 24) |
        (Math.round((b + m) * 255) << 16) |
        (Math.round((g + m) * 255) << 8) |
        Math.round((r + m) * 255);
}

// Converts a complex number to a colour based on the norm and argument (|z| = 0 -> black, |z| = 1 -> gray, |z| = infty -> white, arg(z) -> hue z)
export function complexColourNA(z) {

    const norm = math.norm(z);
    if (isNaN(norm) || !isFinite(norm)) {
        return 0xFFFFFFFF
    }
    // math.arg(z) returns  a value between -pi and pi
    const hue = ((math.arg(z) * 180 / Math.PI) + 360);
    return hslToABGR(hue, 1, norm / (norm + 1));
}

