import { useRef, useEffect } from "react";

// Draws a square based on colorFunction, which takes two ints and returns an ABGR value.
function Canvas({ width, height, colorFunction }) {
    const canvasRef = useRef(null);

    useEffect(() => {

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const imageData = ctx.createImageData(width, height);
        const pixels32 = new Uint32Array(imageData.data.buffer);
        try {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    pixels32[y * width + x] = colorFunction(x, y)
                }
            }
        } catch {
            // Blank canvas on invalid expression
            ctx.clearRect(0, 0, width, height);
        }
        ctx.putImageData(imageData, 0, 0);
    }, [width, height, colorFunction]);

    return <canvas 
    ref={canvasRef} 
    width={width} 
    height={height} 
     style={{ width: "100%", height: "100%" }}/>
}

export default Canvas