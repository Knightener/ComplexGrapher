import { buildDefinedFunctionsGLSL, buildDefinedConstantsGLSL } from './ExpressionTreeTraversal';
import { glslComplexLibrary } from './glslComplexLibrary';

export const vertexShaderSource = `#version 300 es
  in vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

export function buildFragmentShaderSource(expression) {
  return `#version 300 es
    #define PI 3.14159265358979323846
    #define E  2.71828182845904523536

    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_zoom;
    uniform vec2 u_offset;
    out vec4 outColor;

    ${glslComplexLibrary}

    vec2 i = vec2(0.0, 1.0);
    vec2 pi = vec2(PI, 0.0);
    vec2 tau = vec2(2.0 * PI, 0.0);
    vec2 e = vec2(E, 0.0);

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
      initConstants();
      vec2 z = (gl_FragCoord.xy - u_resolution / 2.0 - u_offset) / u_zoom;
      vec2 result = ${expression};

      float r = length(result);

      if (isnan(r) || isinf(r)) {
        outColor = vec4(1.0, 1.0, 1.0, 1.0);
        return;
      }

      float theta = atan(result.y, result.x);
      float hue = (theta + PI) / (2.0 * PI);
      float lightness = r / (r + 1.0);
      outColor = vec4(hsl2rgb(vec3(hue, 1.0, lightness)), 1.0);
    }
  `;
}