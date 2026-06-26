import { useState } from 'react'
import Canvas from './Canvas'
import './App.css'
import Input from "./Input";
import { parseLatex } from './Parsing';
import * as math from "mathjs";

function App() {
  function handleChange(latex) {
    console.log(parseLatex(latex)(math.complex(1,1), math.complex(1,-1)));
  }
  return (
    <>
  <Input onChange={handleChange} />
  </>
);
}

export default App
