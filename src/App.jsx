import { useState } from 'react'
import Canvas from './Canvas'
import './App.css'
import Input from "./Input";
import { parseLatex } from './Parsing';
import * as math from "mathjs";
import { complexColourNA } from './Color';

const defaultF = z => z;

function App() {
  const [f, setF] = useState(() => defaultF);

  function handleChange(latex) {
    const fn = parseLatex(latex);
    if (fn !== null) {
      setF(() => fn);
    } else {
      console.log("invalid expression")
    }
  }

   let canvasWidth = Math.round(window.innerWidth * 0.8 * 0.25);
   let canvasHeight = Math.round(window.innerHeight*0.25);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div className="sidebar">
        {/* sidebar */}
        <Input onChange={handleChange} />
      </div>
      <div style={{ flex: 1 }}>
        {/* graph */}
        <Canvas width={canvasWidth} height={canvasHeight} colorFunction={(x, y) => complexColourNA(f(math.complex(x - 200, y - 200)))} />
      </div>
    </div>
  );
}

export default App
