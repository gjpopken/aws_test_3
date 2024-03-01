import './App.css'
import { useState } from 'react'

function App() {
  const [file, setFile] = useState(null)

  const handleSubmit = () => {
    if (file) {
      // Creates a new object for storing different media types.
      const formData = new FormData()
      // Creates a new key-value pair. The first 'file' is the key, the other is the value.
      formData.append('file', file)
    }



  }

  return (
    <>
      {/* <p>{file}</p> */}
      <input type="file" accept='audio/*,video/*,image/*' capture='user' onChange={(e) => setFile(e.target.value)} />
      <button onClick={handleSubmit}>Submit</button>
    </>
  )
}

export default App
