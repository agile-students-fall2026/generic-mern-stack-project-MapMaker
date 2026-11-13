import { useCallback, useMemo, useRef, useState } from 'react'
import { EditorContext } from './editorContext'
import { DEFAULT_MAP, getMapFor } from './editorData'
import api from '../api'

export default function EditorProvider({ children }) {
  const [map, setMap] = useState(DEFAULT_MAP)
  const currentId = useRef('demo-world')
  const version = useRef(0)
  const writes = useRef(Promise.resolve())

  const updateMap = useCallback((changes) => {
    setMap((current) => ({ ...current, ...changes }))
    version.current++
    const id = currentId.current
    if (id !== 'demo-world') {
      writes.current = writes.current.then(() => api('/maps/' + id, { method: 'POST', body: changes })).catch(console.error)
    }
  }, [])

  const openMap = useCallback((selectedMap) => {
    if (!selectedMap) return
    const id = String(selectedMap.id ?? selectedMap.number ?? selectedMap.name ?? 'demo-world')
    currentId.current = id
    const loaded = ++version.current
    setMap(getMapFor(selectedMap))
    if (id !== 'demo-world') {
      writes.current.then(() => api('/maps/' + id)).then((saved) => {
        if (currentId.current === id && loaded === version.current) setMap(getMapFor(saved))
      }).catch(console.error)
    }
  }, [])

  const editor = useMemo(() => ({ map, updateMap, openMap }), [map, updateMap, openMap])

  return <EditorContext.Provider value={editor}>{children}</EditorContext.Provider>
}
