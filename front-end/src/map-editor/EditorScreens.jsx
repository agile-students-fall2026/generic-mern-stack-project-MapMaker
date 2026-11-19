import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import MapPreview from './MapPreview'
import MapImage from './MapImage'
import { STYLES, IMAGE_STYLES } from './editorData'
import { useEditor } from './editorContext'
import api from '../api'
import './EditorScreens.css'

export function EditorHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <header className="mm-header">
      <button className="mm-logo" onClick={() => navigate('/home')}>Logo</button>
      <button onClick={() => navigate('/menu', {
        state: { backgroundLocation: location }
      })}>
        Menu
      </button>
    </header>
  )
}

function EditorPanel({ title, map, children }) {
  return (
    <div className="mm-shell">
      <main className="mm-content">
        <EditorHeader />
        <h1 className="mm-map-title">{map.title || 'Untitled map'}</h1>
        <div className="mm-map-image">
          {map.asset ? <MapImage asset={map.asset} filter={IMAGE_STYLES.find((s) => s.id === map.imageStyle)?.filter} />
            : <MapPreview styleId={map.styleId} selectedCountries={map.selectedCountries} />}
        </div>
        <section className="mm-panel" aria-label={title}>
          <h2>{title}</h2>
          {children}
        </section>
      </main>
    </div>
  )
}

export function StylePage() {
  const navigate = useNavigate()
  const { map, updateMap } = useEditor()
  const [styleId, setStyleId] = useState(map.styleId)
  const [imageStyle, setImageStyle] = useState(map.imageStyle)
  const options = map.asset ? IMAGE_STYLES : STYLES
  return (
    <EditorPanel title="Style" map={{ ...map, styleId, imageStyle }}>
      <div className="mm-style-grid">
        {options.map((style) => (
          <button key={style.id} className={(map.asset ? imageStyle : styleId) === style.id ? 'selected' : ''}
            aria-pressed={(map.asset ? imageStyle : styleId) === style.id}
            onClick={() => map.asset ? setImageStyle(style.id) : setStyleId(style.id)}>
            {map.asset ? <MapImage asset={map.asset} filter={style.filter} />
              : <MapPreview compact styleId={style.id} selectedCountries={map.selectedCountries} />}
            {style.name}{(map.asset ? imageStyle : styleId) === style.id ? ' (Selected)' : ''}
          </button>
        ))}
      </div>
      <div className="mm-actions">
        <button onClick={() => navigate('/Map-Editor')}>Cancel</button>
        <button onClick={() => { updateMap(map.asset ? { imageStyle } : { styleId }); navigate('/Map-Editor') }}>Apply Style</button>
      </div>
    </EditorPanel>
  )
}

export function EditTextPage({ onRenameMap }) {
  const navigate = useNavigate()
  const { map, updateMap } = useEditor()
  const [draft, setDraft] = useState({
    title: map.title,
    subtitle: map.subtitle,
    legendLabels: [...map.legendLabels],
  })
  const [error, setError] = useState('')

  function save(event) {
    event.preventDefault()
    if (!draft.title.trim() || draft.legendLabels.some((label) => !label.trim())) {
      setError('Please complete the title and both legend labels.')
      return
    }
    updateMap({ ...draft, title: draft.title.trim(), legendLabels: draft.legendLabels.map((label) => label.trim()) })
    onRenameMap?.(Number(map.id), draft.title.trim())
    navigate('/Map-Editor')
  }

  return (
    <EditorPanel title="Edit text" map={{ ...map, ...draft }}>
      <form className="mm-edit-form" onSubmit={save}>
        <label htmlFor="mm-title">Title</label>
        <input id="mm-title" required maxLength={80} value={draft.title}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
        <label htmlFor="mm-subtitle">Subtitle (optional)</label>
        <input id="mm-subtitle" maxLength={160} value={draft.subtitle}
          onChange={(event) => setDraft({ ...draft, subtitle: event.target.value })} />
        {draft.legendLabels.map((label, index) => (
          <div key={index}>
            <label htmlFor={`mm-legend-${index}`}>Legend label {index + 1}</label>
            <input id={`mm-legend-${index}`} required maxLength={48} value={label}
              onChange={(event) => setDraft({ ...draft, legendLabels: draft.legendLabels.map((item, i) => i === index ? event.target.value : item) })} />
          </div>
        ))}
        {error && <p role="alert" className="mm-error">{error}</p>}
        <div className="mm-actions">
          <button type="button" onClick={() => navigate('/Map-Editor')}>Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </EditorPanel>
  )
}

export function SourcesPage() {
  const navigate = useNavigate()
  const { map } = useEditor()
  const [result, setResult] = useState({ id: null, source: null, error: '' })

  useEffect(() => {
    if (map.id === 'demo-world') return
    const controller = new AbortController()
    api('/maps/' + encodeURIComponent(map.id) + '/sources', { signal: controller.signal })
      .then((source) => {
        if (!controller.signal.aborted) setResult({ id: map.id, source, error: '' })
      })
      .catch((error) => {
        if (!controller.signal.aborted) setResult({ id: map.id, source: null, error: error.message })
      })
    return () => controller.abort()
  }, [map.id])

  const current = result.id === map.id ? result : null
  return (
    <EditorPanel title="Sources" map={map}>
      {map.id === 'demo-world' ? <p>Open a saved map to view its sources.</p>
        : !current ? <p role="status">Loading sources...</p>
          : current.error ? <p role="alert">{current.error}</p>
            : <>
              <h3>{current.source.title}</h3>
              {current.source.description && <p>{current.source.description}</p>}
              {current.source.provider && <p>Collection: {current.source.provider}</p>}
              {current.source.creator && <p>Creator: {current.source.creator}</p>}
              {current.source.license && <p>License: {current.source.license}</p>}
              {current.source.licenseUrl && <p><a href={current.source.licenseUrl} target="_blank" rel="noopener noreferrer">License terms</a></p>}
              <a href={current.source.url} target="_blank" rel="noopener noreferrer">
                {map.asset ? 'Original file and full attribution' : 'View original map data'}
              </a>
            </>}
      <div className="mm-actions"><button onClick={() => navigate('/Map-Editor')}>Close</button></div>
    </EditorPanel>
  )
}
