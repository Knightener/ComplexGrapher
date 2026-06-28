import { useState, useEffect, useRef } from 'react'
import Canvas from './Canvas'
import './App.css'
import Input from "./Input";
import { parseLatex } from './Parsing';
import * as math from "mathjs";
import { complexColourNA } from './Color';

const defaultF = z => z;
const pixelScale = 20;

function App() {
  const [f, setF] = useState(() => defaultF);
  const [view, setView] = useState({ zoom: 100, offset: { x: 0, y: 0 } });
  const viewRef = useRef(view);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Adjused for sidebar
  const canvasWidth = Math.round(window.innerWidth * 0.8 / pixelScale);
  const canvasHeight = Math.round(window.innerHeight / pixelScale);

  function updateView(newView) {
    viewRef.current = newView;
    setView(newView);
  }

  function handleChange(latex) {
    const fn = parseLatex(latex);
    if (fn !== null) {
      setF(() => fn);
    } else {
      console.log("invalid expression");
    }
  }

  useEffect(() => {
    function handleWheel(e) {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const v = viewRef.current;

      const cursorX = (e.clientX - window.innerWidth * 0.2) / pixelScale;
      const cursorY = e.clientY / pixelScale;

      // parts of the number currently under the cursor  
      const complexRe = (cursorX - canvasWidth / 2 - v.offset.x) / v.zoom;
      const complexIm = (cursorY - canvasHeight / 2 - v.offset.y) / v.zoom;

      const newZoom = v.zoom * zoomFactor;
      const newOffsetX = cursorX - canvasWidth / 2 - complexRe * newZoom;
      const newOffsetY = cursorY - canvasHeight / 2 - complexIm * newZoom;

      updateView({ zoom: newZoom, offset: { x: newOffsetX, y: newOffsetY } });
    }

    function handleMouseDown(e) {
      isDragging.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }

    function handleMouseMove(e) {
      if (!isDragging.current) return;
      const v = viewRef.current;
      const dx = (e.clientX - lastMousePos.current.x) / pixelScale;
      const dy = (e.clientY - lastMousePos.current.y) / pixelScale;
      updateView({ ...v, offset: { x: v.offset.x + dx, y: v.offset.y + dy } });
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }

    function handleMouseUp() {
      isDragging.current = false;
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* sidebar */}
      <div className="sidebar">
        <Input onChange={handleChange} />
      </div>
      {/* graph */}
      <div style={{ flex: 1 }}>
        <Canvas
          width={canvasWidth}
          height={canvasHeight}
          colorFunction={(x, y) => complexColourNA(f(math.complex(
            (x - canvasWidth / 2 - view.offset.x) / view.zoom,
            (y - canvasHeight / 2 - view.offset.y) / view.zoom
          )))}
        />
      </div>
    </div>
  );
}

export default App