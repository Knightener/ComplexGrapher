import { useState, useRef, useEffect } from 'react'
import Canvas from './Canvas'
import './App.css'
import Input from "./Input";
import { parseLatexToGLSL } from './Parsing';
import useGraphView from './useGraphView';
import { definedFunctions } from './ExpressionTreeTraversal';

const pixelScale = 1;

function App() {
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const isResizingSidebar = useRef(false);

  const [equations, setEquations] = useState([{ id: 0, latex: "" }]);
  const [selectedId, setSelectedId] = useState(0);
  const [activeGLSL, setActiveGLSL] = useState(null);
  const nextId = useRef(1);

  const { view, canvasWidth, canvasHeight } = useGraphView(sidebarWidth, pixelScale, isResizingSidebar);

function recompute(newEquations, activeId) {
  definedFunctions.clear();
  let activeGLSLCode = null;

  for (const eq of newEquations) {
    if (!eq.latex.trim()) continue;
    const result = parseLatexToGLSL(eq.latex);
    if (!result) continue;
    definedFunctions.set(result.name, { paramNames: result.paramNames, body: result.function });
    if (eq.id === activeId) activeGLSLCode = result.function;
  }

  console.log("all definedFunctions:", [...definedFunctions.entries()]);
  setActiveGLSL(activeGLSLCode);
}

  function handleEquationChange(id, latex) {
    setEquations(prev => {
      const newEquations = prev.map(eq =>
        eq.id === id ? { ...eq, latex } : eq
      );
      recompute(newEquations, selectedId);
      return newEquations;
    });
  }

  function addEquation() {
    setEquations([...equations, { id: nextId.current++, latex: "" }]);
  }

  function handleResizeMouseDown(e) {
    isResizingSidebar.current = true;
    e.preventDefault();
  }

  useEffect(() => {
    function handleResizeMouseMove(e) {
      if (!isResizingSidebar.current) return;
      setSidebarWidth(Math.min(Math.max(e.clientX, 150), 600));
    }
    function handleResizeMouseUp() {
      isResizingSidebar.current = false;
    }
    window.addEventListener("mousemove", handleResizeMouseMove);
    window.addEventListener("mouseup", handleResizeMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleResizeMouseMove);
      window.removeEventListener("mouseup", handleResizeMouseUp);
    };
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div className="sidebar" style={{ width: sidebarWidth, flexShrink: 0 }}>
        {equations.map(eq => (
          <div key={eq.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Input
              initialValue={eq.latex}
              onChange={(latex) => handleEquationChange(eq.id, latex)}
            />
            <button
              onClick={() => {
                setSelectedId(eq.id);
                recompute(equations, eq.id);
              }}
              style={{
                flex: "0 0 24px",
                width: "24px",
                alignSelf: "stretch",
                background: selectedId === eq.id ? "lime" : "red",
                cursor: "pointer",
                padding: "4px 0px",
                textAlign: "center"
              }}
            />
          </div>
        ))}
        <button onClick={addEquation}>+ add</button>
      </div>

      <div
        onMouseDown={handleResizeMouseDown}
        style={{ width: "6px", cursor: "col-resize", background: "transparent", flexShrink: 0 }}
      />

      <div style={{ flex: 1 }}>
<Canvas
  width={canvasWidth}
  height={canvasHeight}
  glslExpression={activeGLSL}
  zoom={view.zoom}
  offsetX={view.offset.x}
  offsetY={view.offset.y}
/>
      </div>
    </div>
  );
}

export default App