
// glsl
export const glslComplexLibrary = `
vec2 cmul(vec2 a, vec2 b) { return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x); }
vec2 cdiv(vec2 a, vec2 b) {
  float d = b.x*b.x + b.y*b.y;
  return vec2((a.x*b.x + a.y*b.y)/d, (a.y*b.x - a.x*b.y)/d);
}
vec2 cexp(vec2 z) { float e = exp(z.x); return vec2(e*cos(z.y), e*sin(z.y)); }
vec2 cln(vec2 z) { return vec2(log(length(z)), atan(z.y, z.x)); }
vec2 cpow(vec2 a, vec2 b) { return cexp(cmul(b, cln(a))); }
vec2 csin(vec2 z) { return vec2(sin(z.x)*cosh(z.y), cos(z.x)*sinh(z.y)); }
vec2 ccos(vec2 z) { return vec2(cos(z.x)*cosh(z.y), -sin(z.x)*sinh(z.y)); }
vec2 cmod(vec2 z) {return vec2(mod(z.x, 1.0), mod(z.y, 1.0)); }
// Mod lattice
vec2 cmod(vec2 z, vec2 b1, vec2 b2) {

// ([b1,b2]^-1 * z)
float det = b1.x * b2.y - b2.x * b1.y;
float x = (b2.y * z.x - b2.x * z.y) / det;
float y = (b1.x * z.y - b1.y * z.x) / det;

x = mod(x , 1.0);
y = mod(y, 1.0);

float tempX = x;

x = b1.x * x + b2.x * y;
y = b1.y * tempX + b2.y * y;

return vec2(x, y); 
}
`;