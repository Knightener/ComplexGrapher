
import { useState, useRef, useEffect } from "react";

export default function useGraphView(sidebarWidth, pixelScale) {
  const [view, setView] = useState({ zoom: 1, offset: { x: 0, y: 0 } });
  const viewRef = useRef(view);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const canvasWidth = Math.round((window.innerWidth - sidebarWidth) / pixelScale);
  const canvasHeight = Math.round(window.innerHeight / pixelScale);

  function updateView(newView) {
    viewRef.current = newView;
    setView(newView);
  }

  useEffect(() => {
    function handleWheel(e) {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const v = viewRef.current;

      const cursorX = (e.clientX - sidebarWidth) / pixelScale;
      const cursorY = e.clientY / pixelScale;

      // parts of the complex number currently under the cursor
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
  }, [sidebarWidth, canvasWidth, canvasHeight, pixelScale]);

  return { view, canvasWidth, canvasHeight };
}