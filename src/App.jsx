import { useState, useRef, useEffect } from 'react'
import Canvas from './Canvas'
import './App.css'
import Input from "./Input";
import { parseLatexToGLSL } from './Parsing';
import useGraphView from './useGraphView';
import { definedFunctions, topoSortFunctions } from './ExpressionTreeTraversal';


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
  const parsed = [];
  for (const eq of newEquations) {
    if (!eq.latex.trim()) continue;
    const result = parseLatexToGLSL(eq.latex);
    if (!result) continue;
    parsed.push({ ...result, id: eq.id });
  }

  const { order, cyclic, undefinedRefs } = topoSortFunctions(parsed);
  if (cyclic.size > 0) console.warn("Skipping equations with a circular reference:", [...cyclic]);
  if (undefinedRefs.size > 0) console.warn("Reference to undefined function(s):", [...undefinedRefs]);

  definedFunctions.clear();
  const byName = new Map(parsed.map(p => [p.name, p]));
  let activeGLSLCode = null;

  for (const name of order) {
    const p = byName.get(name);
    definedFunctions.set(name, { paramNames: p.paramNames, body: p.function });
    if (p.id === activeId) activeGLSLCode = p.function;
  }

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