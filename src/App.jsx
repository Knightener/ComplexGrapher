import { useState, useRef, useMemo, useEffect } from 'react'
import Canvas from './Canvas'
import './App.css'
import Input from "./Input";
import { complexColourNA } from './Color';
import { parseLatex } from './Parsing';
import Complex from './Complex'
import { definedFunctions } from './ExpressionTreeTraversal';
import useGraphView from './useGraphView';

const defaultF = z => z;
const pixelScale = 4;

function App() {
  const [equations, setEquations] = useState([{ id: 0, latex: "" }]);
  const [graphFunction, setGraphFunction] = useState(() => defaultF);
  const [selectedId, setSelectedId] = useState(0);
  const nextId = useRef(1);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const isResizingSidebar = useRef(false);
  const { view, canvasWidth, canvasHeight } =  useGraphView(sidebarWidth, pixelScale, isResizingSidebar);

  const colorFunction = useMemo(() => (x, y) => complexColourNA(graphFunction(new Complex(
    (x - canvasWidth / 2 - view.offset.x) / view.zoom,
    (y - canvasHeight / 2 - view.offset.y) / view.zoom
  ))), [graphFunction, view, canvasWidth, canvasHeight]);

  function recompute(newEquations, activeId) {
    definedFunctions.clear();
    let activeF = defaultF;

    for (const eq of newEquations) {
      if (!eq.latex.trim()) continue;
      const result = parseLatex(eq.latex);
      if (!result) continue;
      definedFunctions.set(result.name, result.function);
      if (eq.id === activeId) activeF = result.function;
    }

    setGraphFunction(() => activeF);
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

  function handleResizeMouseDown(e) {
    isResizingSidebar.current = true;
    isDraggingRef.current = false;
    e.preventDefault();
    e.stopPropagation();
  }

  function addEquation() {
    setEquations([...equations, { id: nextId.current++, latex: "" }]);
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
          colorFunction={colorFunction}
        />
      </div>
    </div>
  );
}

export default App