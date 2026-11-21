import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { cleanMapQuery, searchMaps } from './map-editor/mapCatalog'
import MapPreview from './map-editor/MapPreview'
import './MapSearch.css'
import BackArrow from './BackArrow'

const EXAMPLES = ['North America', 'South America', 'Europe', 'Asia', 'Africa', 'Oceania']

export default function MapSearch({ onChooseMap, onCreateMap }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const [input, setInput] = useState(query)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selecting, setSelecting] = useState(false)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    Promise.resolve().then(() => {
      if (controller.signal.aborted) return
      setInput(query)
      setLoading(true)
      return searchMaps(query, controller.signal)
    }).then((data) => {
      if (!data || controller.signal.aborted) return
      setResults(data.results)
      setError('')
    }).catch((err) => {
      if (!controller.signal.aborted) setError(err.message)
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => controller.abort()
  }, [query, refresh])

  function search(event) {
    event.preventDefault()
    const value = cleanMapQuery(input)
    if (value === query) setRefresh((n) => n + 1)
    else setParams(value ? { q: value } : {})
  }

  async function openMap(template) {
    setSelecting(true)
    try {
      const map = await onChooseMap(template)
      navigate('/Map-Editor', { state: { map } })
    } catch (err) {
      setError(err.message)
      setSelecting(false)
    }
  }

  async function blankMap() {
    setSelecting(true)
    try {
      const map = await onCreateMap('Untitled Map')
      navigate('/Map-Editor', { state: { map } })
    } catch (err) {
      setError(err.message)
      setSelecting(false)
    }
  }

  return (
    <main className="map-search">
      <BackArrow/>
      <button onClick={() => navigate('/menu', { state: { backgroundLocation: location } })}>Menu</button>
      <h1>Choose a map</h1>
      <form className="map-search-form" onSubmit={search}>
        <input aria-label="Search maps" value={input} placeholder="Search sample maps" onChange={(event) => setInput(event.target.value)} />
        <button type="submit">Search</button>
      </form>
      <div className="map-search-examples">
        {EXAMPLES.map((example) => (
          <button key={example} onClick={() => {
            setInput(example)
            if (query === example) setRefresh((n) => n + 1)
            else setParams({ q: example })
          }}>{example}</button>
        ))}
      </div>
      <p className="map-search-hint">Choose an editable sample map, or start from a blank world map.</p>
      <button disabled={selecting} onClick={blankMap}>Start with blank world map</button>

      {loading && <p role="status">Loading maps...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && !results.length && <p>No sample maps match. Try a region above or start with a blank map.</p>}
      <div className="map-search-results">
        {results.map((template) => (
          <article className="map-search-card" key={template.id}>
            <div className="map-search-preview">
              <MapPreview styleId={template.styleId} selectedCountries={template.selectedCountries} />
            </div>
            <h2>{template.title}</h2>
            <p>{template.description}</p>
            <div className="map-search-actions">
              <button disabled={selecting} onClick={() => openMap(template)}>Use this map</button>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
