import { useEffect, useRef } from "react";

export default function Input({ onChange }) {
    const containerRef = useRef(null);
    const mqField = useRef(null);
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        const MQ = window.MathQuill.getInterface(2);
        mqField.current = MQ.MathField(containerRef.current, {
            autoCommands: "pi theta sqrt",
            handlers: {
                edit: () => {
                    onChangeRef.current(mqField.current.latex());
                }
            }
        });

        const height = containerRef.current.offsetHeight;
        containerRef.current.style.fontSize = `${height * 0.6}px`;
    }, []);

    return (<div ref={containerRef} className="mq-box" />)
}