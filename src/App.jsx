import './App.css'
import axios from 'axios'
import { useState, useEffect } from 'react'

function App() {
  const [file, setFile] = useState(null)
  const [titleInput, setTitleInput] = useState('')
  const [notesInput, setNotesInput] = useState('')

  // To store the response from GET
  const [uploads, setUploads] = useState([])

  const handleSubmit = () => {
    // Creates a new object for storing different media types.
    const formData = new FormData()
    // Creates a new key-value pair. The first 'file' is the key, the other is the value.
    formData.append('title', titleInput)
    formData.append('notes', notesInput)
    formData.append('user_id', 2)
    formData.append('file', file)
    // console.log(formData);
    // postNewEvidence(formData)
    axios.post('/api/evidence', formData)
      .then(response => {
        console.log('Successful POST');
      }).catch(err => {
        console.log("Error with POST", err);
      })
  }

  const getAllUploads = () => {
    console.log('In getAllUploads()');
    axios.get('/api/evidence')
      .then(response => {
        console.log(response);
        setUploads(response.data)
      }).catch(err => {
        console.log(err);
      })
  }

  // const postNewEvidence = (formData) => {

  // }

  useEffect(() => {
    getAllUploads()
  }, [])



  return (
    <>
      {/* <p>{file}</p> */}
      <p>
        <label htmlFor="titleInput">Enter Title: </label>
        <input type="text" id='titleInput'
          onChange={(e) => setTitleInput(e.target.value)}
          value={titleInput} />
      </p>
      <p>
        <label htmlFor="notesInput">Enter Notes: </label>
        <input type="text" id='notesInput'
          onChange={(e) => setNotesInput(e.target.value)}
          value={notesInput} />
      </p>
      <input type="file" accept='audio/*,video/*,image/*' capture='user'
        onChange={(e) => {setFile(e.target.files[0]);console.log(JSON.stringify(e.target.files));}
        }
      />
      <button onClick={handleSubmit} disabled={!file}>Submit</button>
      {uploads.map(item => {
        return (<div className='card' key={item.id}>
          <img src={item.aws_url} alt={item.title} style={{ width: '200px' }} />
          <h4>{item.title}</h4>
          <p>{item.notes}</p>
          <p>Location: {item.location}</p>
        </div>)
      })}
    </>
  )
}

export default App
