
// glsl
export const glslComplexLibrary = `
vec2 cmul(vec2 a, vec2 b) { return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x); }
vec2 cdiv(vec2 a, vec2 b) {
  float d = b.x*b.x + b.y*b.y;
  return vec2((a.x*b.x + a.y*b.y)/d, (a.y*b.x - a.x*b.y)/d);
}
vec2 cinv(vec2 z) {
  float d = z.x*z.x + z.y*z.y;
  return vec2(z.x/d, -z.y/d);
}
vec2 cexp(vec2 z) { float e = exp(z.x); return vec2(e*cos(z.y), e*sin(z.y)); }
vec2 cln(vec2 z) { return vec2(log(length(z)), atan(z.y, z.x)); }
vec2 cpow(vec2 a, vec2 b) { return cexp(cmul(b, cln(a))); }
vec2 csin(vec2 z) { return vec2(sin(z.x)*cosh(z.y), cos(z.x)*sinh(z.y)); }
vec2 ccos(vec2 z) { return vec2(cos(z.x)*cosh(z.y), -sin(z.x)*sinh(z.y)); }
vec2 cmod(vec2 z) {return vec2(mod(z.x, 1.0), mod(z.y, 1.0)); }

// Mod lattice spanned by b1 and b2
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

vec2 ctan(vec2 z) {
  float sx = sin(z.x), cx = cos(z.x);
  float shy = sinh(z.y), chy = cosh(z.y);
  float denom = cx*cx + shy*shy;
  return vec2(sx*cx / denom, shy*chy / denom);
}

vec2 ccot(vec2 z) {
  float sx = sin(z.x), cx = cos(z.x);
  float shy = sinh(z.y), chy = cosh(z.y);
  float denom = sx*sx + shy*shy;
  return vec2(sx*cx / denom, -shy*chy / denom);
}

vec2 csec(vec2 z) {
  float cx = cos(z.x), sx = sin(z.x);
  float chy = cosh(z.y), shy = sinh(z.y);
  float denom = cx*cx + shy*shy;
  return vec2(cx*chy / denom, sx*shy / denom);
}

vec2 ccsc(vec2 z) {
  float sx = sin(z.x), cx = cos(z.x);
  float chy = cosh(z.y), shy = sinh(z.y);
  float denom = sx*sx + shy*shy;
  return vec2(sx*chy / denom, -cx*shy / denom);
}

// csc^2(z/w), for weierstrass p
vec2 ccsc2_piz_over_w(vec2 z, vec2 w) {
  float wd = w.x*w.x + w.y*w.y;
  float u = PI * (z.x*w.x + z.y*w.y) / wd;
  float v = PI * (z.y*w.x - z.x*w.y) / wd;

  float a = sin(u) * cosh(v);
  float b = cos(u) * sinh(v);

  float sqRe = a*a - b*b;
  float sqIm = 2.0*a*b;

  float d = sqRe*sqRe + sqIm*sqIm;
  return vec2(sqRe/d, -sqIm/d);
}

vec2 weierstrass_p_aux(vec2 z, vec2 b1, vec2 b2) {
  // Formula taken from Whittaker and Watson 1990, p. 434

  // Higher n, more accuracy

  vec2 twoB1 = 2.0 * b1;
  vec2 res = vec2(- 1.0 / 3.0, 0);
  for (int n = -3; n < 0; n++) {
    res += ccsc2_piz_over_w(z - float(n) * b2, b1) + ccsc2_piz_over_w(float(n) * b2, b1);
  }

  res += ccsc2_piz_over_w(z, b1);

  for (int n = 1; n <= 3; n++) {
    res += ccsc2_piz_over_w(z - float(n) * b2, b1) + ccsc2_piz_over_w(float(n) * b2, b1);
  }

  vec2 pi_2b12 = (PI) * cinv(b1);
  pi_2b12 = cmul(pi_2b12, pi_2b12);

  return cmul(pi_2b12, res);
}

// Variable z, periods b1 b2
vec2 wp(vec2 z, vec2 b1, vec2 b2) {
  return weierstrass_p_aux(cmod(z, b1, b2), b1, b2);
}
`;