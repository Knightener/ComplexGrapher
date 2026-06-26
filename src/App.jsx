import { useState } from 'react'
import Canvas from './Canvas'
import './App.css'
import Input from "./Input";
import { parseLatex } from './Parsing';

function App() {
  function handleChange(latex) {
    console.log(parseLatex(latex));
  }
  return <Input onChange={handleChange} />;
}

export default App
