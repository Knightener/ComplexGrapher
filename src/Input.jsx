import { useEffect, useRef } from "react";

export default function Input({ onChange }) {
  const containerRef = useRef(null);
  const mqField = useRef(null);

  useEffect(() => {
    if (!window.MathQuill) {
      console.error("MathQuill not loaded");
      return;
    }

    const MQ = window.MathQuill.getInterface(2);
    mqField.current = MQ.MathField(containerRef.current, {
      handlers: {
        edit: () => {
          onChange(mqField.current.latex());
        }
      }
    });
  }, []);

  return <div ref={containerRef} />;
}