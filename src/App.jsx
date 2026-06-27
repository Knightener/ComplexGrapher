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

  return (
    <>
      <Input onChange={handleChange} />
      <Canvas width={400} height={400} colorFunction={(x,y) => complexColourNA(f(math.complex(x-200,y-200)))} />
    </>
  );
}

export default App
