import { useState } from 'react'
import Canvas from './Canvas'
import './App.css'
import Input from "./Input";
import { parseLatex } from './Parsing';
import * as math from "mathjs";

const defaultF = (x, y) => x << y;

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
      <Canvas width={400} height={400} colorFunction={f} />
    </>
  );
}

export default App
