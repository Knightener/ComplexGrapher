import { buildDefinedFunctionsGLSL } from './ExpressionTreeTraversal';


export const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

export function buildFragmentShaderSource(expression) {
  return `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_zoom;
    uniform vec2 u_offset;

    float sinh(float x) { return (exp(x) - exp(-x)) / 2.0; }
    float cosh(float x) { return (exp(x) + exp(-x)) / 2.0; }
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

    vec3 hsl2rgb(vec3 hsl) {
      float h = hsl.x, s = hsl.y, l = hsl.z;
      float c = (1.0 - abs(2.0 * l - 1.0)) * s;
      float hp = h * 6.0;
      float x = c * (1.0 - abs(mod(hp, 2.0) - 1.0));
      vec3 rgb;
      if (hp < 1.0) rgb = vec3(c, x, 0.0);
      else if (hp < 2.0) rgb = vec3(x, c, 0.0);
      else if (hp < 3.0) rgb = vec3(0.0, c, x);
      else if (hp < 4.0) rgb = vec3(0.0, x, c);
      else if (hp < 5.0) rgb = vec3(x, 0.0, c);
      else rgb = vec3(c, 0.0, x);
      float m = l - c / 2.0;
      return rgb + vec3(m);
    }

    ${buildDefinedFunctionsGLSL()}
    
    void main() {
      vec2 z = (gl_FragCoord.xy - u_resolution / 2.0 - u_offset) / u_zoom;
      vec2 result = ${expression};

      float r = length(result);
      float theta = atan(result.y, result.x);
      float hue = (theta + 3.14159265) / (2.0 * 3.14159265);
      float lightness = r / (r + 1.0);
      gl_FragColor = vec4(hsl2rgb(vec3(hue, 1.0, lightness)), 1.0);
    }
  `;
}