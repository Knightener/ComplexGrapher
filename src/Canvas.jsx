import { useRef, useEffect } from "react";
import { createProgram } from "./webglUtils";
import { vertexShaderSource, buildFragmentShaderSource } from "./shaders";

function Canvas({ width, height, glslExpression, zoom, offsetX, offsetY }) {
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

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1,  -1, 1,
      -1, 1,   1, -1,   1, 1,
    ]), gl.STATIC_DRAW);
  }, []);

  useEffect(() => {
    const gl = glRef.current;
    if (!gl || !glslExpression) return;

    const program = createProgram(gl, vertexShaderSource, buildFragmentShaderSource(glslExpression));
    if (!program) return;
    programRef.current = program;
    gl.useProgram(program);

    const positionLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    draw.current();
  }, [glslExpression]);

  draw.current = () => {
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program) return;

    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), width, height);
    gl.uniform1f(gl.getUniformLocation(program, "u_zoom"), zoom);
    gl.uniform2f(gl.getUniformLocation(program, "u_offset"), offsetX, -offsetY);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => { draw.current(); }, 100);
    return () => clearTimeout(timeoutId);
  }, [width, height]);

  useEffect(() => {
    draw.current();
  }, [zoom, offsetX, offsetY]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />;
}

export default Canvas;