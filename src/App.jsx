import { useState } from 'react'
import PasswordChecker from './Components/PasswordChecker'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <PasswordChecker/>
    </>
  )
}

export default App
