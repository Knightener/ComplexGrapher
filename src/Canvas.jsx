import { useRef, useEffect } from "react";

function Canvas({ width, height, colorFunction }) {
    const canvasRef = useRef(null);
    const draw = useRef(() => {});

    draw.current = () => {
        const canvas = canvasRef.current;
        canvas.width = width;   // buffer resize (and clear) happens here now, only when we actually draw
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        const imageData = ctx.createImageData(width, height);
        const pixels32 = new Uint32Array(imageData.data.buffer);
        try {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    pixels32[y * width + x] = colorFunction(x, y);
                }
            }
        } catch (e) {
            console.error("draw error:", e);
            ctx.clearRect(0, 0, width, height);
        }
        ctx.putImageData(imageData, 0, 0);
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            draw.current();
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [width, height]);

    useEffect(() => {
        draw.current();
    }, [colorFunction]);

    return <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%" }} />
}

export default Canvas