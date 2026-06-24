import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <h1>AdaLoveLace</h1>
      <p>Mon application de gestion de projet 🚀</p>
      <button
        type="button"
        onClick={() => setCount((count) => count + 1)}
      >
        J'ai cliqué {count} fois
      </button>
    </div>
  )
}

export default App