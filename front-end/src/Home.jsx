
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './Home.css'

const EXAMPLES = [
  "Countries That Drive On The Left",
  "Members of the EU in 1995"
]

function Home({ onCreateMap }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [description, setDescription] = useState("")
  const [error, setError] = useState('')

  function createMap(event) {
    event.preventDefault()
    navigate('/search?q=' + encodeURIComponent(description.trim() || 'world'))
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
          placeholder="Make me a map of..."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <button className="generate-button" type="submit">
          Generate
        </button>
      </form>

      <button className="blank-button" onClick={blankMap}>
        Start From A Blank Map
      </button>
      {error && <p role="alert">{error}</p>}

      <h3>Examples</h3>

      {EXAMPLES.map((example) => (
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
