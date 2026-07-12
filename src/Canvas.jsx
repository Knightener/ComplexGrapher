import { useRef, useEffect } from "react";
import { compileShader, createProgram } from "./webglUtils";
import { vertexShaderSource, buildFragmentShaderSource } from "./shaders";

function Canvas({ width, height, colorFunction }) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const programRef = useRef(null);
  const draw = useRef(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }
    glRef.current = gl;

    const program = createProgram(gl, vertexShaderSource, buildFragmentShaderSource());
    if (!program) return;
    programRef.current = program;
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1,  -1, 1,
      -1, 1,   1, -1,   1, 1,
    ]), gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
  }, []);

  draw.current = () => {
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program) return;

    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), width, height);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => { draw.current(); }, 100);
    return () => clearTimeout(timeoutId);
  }, [width, height]);

  useEffect(() => {
    draw.current();
  }, [colorFunction]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />;
}

export default Canvas;