
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from './api'
import './Home.css'

function Home({ onCreateMap }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [description, setDescription] = useState("")
  const [error, setError] = useState('')
  const [examples, setExamples] = useState([])

  useEffect(() => {
    api('/examples').then(setExamples).catch((err) => setError(err.message))
  }, [])

  function createMap(event) {
    event.preventDefault()
    navigate('/search?q=' + encodeURIComponent(description.trim()))
  }

  async function blankMap() {
    try {
      const map = await onCreateMap('Untitled Map')
      navigate('/Map-Editor', { state: { map } })
    } catch (err) { setError(err.message) }
  }

  return (
    <div className="home">
      <header>
        <img
          className="logo"
          src="https://cdn-icons-png.flaticon.com/512/4746/4746231.png"
          alt="MapMaker logo"
        />
        <button onClick={() => navigate("/menu", {
          state: { backgroundLocation: location }
        })}>
          Menu
        </button>
      </header>

      <h1>Describe Your Map</h1>

      <form className="prompt-box" onSubmit={createMap}>
        <textarea
          placeholder="Search sample maps..."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <button className="generate-button" type="submit">
          Find Map
        </button>
      </form>

      <button className="blank-button" onClick={blankMap}>
        Start From A Blank Map
      </button>
      {error && <p role="alert">{error}</p>}

      <h3>Examples</h3>

      {examples.map((example) => (
        <button
          className="example"
          key={example}
          onClick={() => setDescription(example)}
        >
          {example}
        </button>
      ))}
    </div>
  )
}

export default Home
