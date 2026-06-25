import { useState } from 'react'
import Canvas from './Canvas'
import './App.css'
import Input from "./Input";

function App() {
  function handleChange(latex) {
    console.log(latex); // whatever the user typed
  }

  return <Input onChange={handleChange} />;
}

export default App
