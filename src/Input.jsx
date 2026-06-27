import { useEffect, useRef } from "react";

// Function input box
export default function Input({ onChange }) {
    const containerRef = useRef(null);
    const mqField = useRef(null);

    useEffect(() => {
        const MQ = window.MathQuill.getInterface(2);
        mqField.current = MQ.MathField(containerRef.current, {
            handlers: {
                edit: () => {
                    onChange(mqField.current.latex());
                }
            }
        });

        const height = containerRef.current.offsetHeight;
        containerRef.current.style.fontSize = `${height * 0.6}px`;
    }, []);

    return (<div ref={containerRef} className="mq-box" />)
}