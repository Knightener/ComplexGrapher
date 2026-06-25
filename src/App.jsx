import { useState } from 'react'
import Canvas from './Canvas'
import './App.css'

function App() {
  return (
      <div>
      <Canvas width={400} height={400} colorFunction={(x,y)=>(x*y)<<(x^y)} />
    </div>

  )
}

export default App
