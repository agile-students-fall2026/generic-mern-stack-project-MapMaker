import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { searchMaps } from './mapCatalog.js'
import addAuthRoutes from './auth.js'
import addHomeRoutes from './home.js'
import addChatRoutes from './chat.js'

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../front-end/dist')
const styles = ['atlas', 'blush', 'forest', 'slate']
const imageStyles = ['original', 'black-white', 'warm']
const validCountries = (countries) => Array.isArray(countries)
  && countries.every((id) => typeof id === 'string' && /^[A-Z]{3}$/.test(id))

export function createApp() {
  const app = express()
  const maps = []
  let nextId = 1

  app.use(express.json({ limit: '100kb' }))

  app.get('/api/health', (req, res) => res.json({ ok: true, message: 'MapMaker backend is running' }))
  addAuthRoutes(app)
  addHomeRoutes(app)
  addChatRoutes(app)
  app.get('/api/maps', (req, res) => res.json(maps))

  app.post('/api/maps', (req, res) => {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim().slice(0, 80) : ''
    if (!name) return res.status(400).json({ error: 'Enter a map name.' })
    const selected = req.body?.selectedCountries || []
    if (!validCountries(selected)) {
      return res.status(400).json({ error: 'Invalid country selection.' })
    }
    const styleId = styles.includes(req.body?.styleId) ? req.body.styleId : 'atlas'
    const number = nextId++
    const map = { number, id: String(number), name, title: name,
      asset: null, selectedCountries: selected, styleId }
    maps.unshift(map)
    res.status(201).json(map)
  })
  app.get('/api/maps/:id', (req, res) => {
    const map = maps.find((item) => item.id === req.params.id)
    return map ? res.json(map) : res.status(404).json({ error: 'Map not found.' })
  })

  app.get('/api/maps/:id/sources', (req, res) => {
    const map = maps.find((item) => item.id === req.params.id)
    if (!map) return res.status(404).json({ error: 'Map not found.' })
    if (map.asset) return res.json({
      title: map.asset.title, provider: map.asset.provider, creator: map.asset.author,
      license: map.asset.license, licenseUrl: map.asset.licenseUrl, url: map.asset.pageUrl,
    })
    res.json({
      title: 'Natural Earth',
      description: 'World country boundaries from the 1:110m Admin 0 Countries dataset (public domain). Highlighted countries are sample selections or were chosen by the user.',
      url: 'https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/',
    })
  })

  app.post('/api/maps/:id/duplicate', (req, res) => {
    const original = maps.find((item) => item.id === req.params.id)
    if (!original) return res.status(404).json({ error: 'Map not found.' })
    const number = nextId++
    const name = original.name + ' (copy)'
    const map = { ...structuredClone(original), number, id: String(number), name, title: name, collaborators: [] }
    maps.unshift(map)
    res.status(201).json(map)
  })

  app.delete('/api/maps/:id', (req, res) => {
    const index = maps.findIndex((map) => map.id === req.params.id)
    if (index === -1) return res.status(404).json({ error: 'Map not found.' })
    maps.splice(index, 1)
    res.sendStatus(204)
  })

  function updateMap(req, res) {
    const map = maps.find((item) => item.id === req.params.id)
    if (!map) return res.status(404).json({ error: 'Map not found.' })
    const changes = req.body || {}
    const title = changes.title ?? changes.name
    if (title !== undefined && (typeof title !== 'string' || !title.trim() || title.trim().length > 80)) {
      return res.status(400).json({ error: 'Enter a map title of up to 80 characters.' })
    }
    if (changes.subtitle !== undefined && (typeof changes.subtitle !== 'string' || changes.subtitle.length > 160)) {
      return res.status(400).json({ error: 'Invalid subtitle.' })
    }
    if (changes.styleId !== undefined && !styles.includes(changes.styleId)) {
      return res.status(400).json({ error: 'Invalid map style.' })
    }
    if (changes.imageStyle !== undefined && !imageStyles.includes(changes.imageStyle)) {
      return res.status(400).json({ error: 'Invalid image style.' })
    }
    if (changes.selectedCountries !== undefined && !validCountries(changes.selectedCountries)) {
      return res.status(400).json({ error: 'Invalid country selection.' })
    }
    if (changes.legendLabels !== undefined && (!Array.isArray(changes.legendLabels)
      || changes.legendLabels.length !== 2
      || changes.legendLabels.some((label) => typeof label !== 'string' || !label.trim() || label.length > 48))) {
      return res.status(400).json({ error: 'Enter two legend labels of up to 48 characters.' })
    }
    const fields = ['subtitle', 'styleId', 'imageStyle', 'selectedCountries', 'legendLabels']
    for (const field of fields) {
      if (changes[field] !== undefined) map[field] = changes[field]
    }
    if (title !== undefined) map.title = map.name = title.trim()
    res.json(map)
  }
  app.patch('/api/maps/:id', updateMap)
  app.post('/api/maps/:id', updateMap)

  app.post('/api/maps/:id/share', (req, res) => {
    const map = maps.find((item) => item.id === req.params.id)
    if (!map) return res.status(404).json({ error: 'Map not found.' })
    const email = String(req.body?.email || '').trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email.' })
    if (!map.collaborators) map.collaborators = []
    if (!map.collaborators.includes(email)) map.collaborators.push(email)
    res.json(map)
  })

  app.post('/api/search', (req, res) => {
    const query = req.body?.query
    if (typeof query !== 'string' || query.length > 140) {
      return res.status(400).json({ error: 'Enter a search of up to 140 characters.' })
    }
    res.json(searchMaps(query))
  })

  app.post('/api/chat', (req, res) => {
    const message = String(req.body?.message || '').trim()
    if (!message) return res.status(400).json({ error: 'Enter a message.' })
    res.json({ reply: `Demo response: received "${message.slice(0, 180)}". AI is not connected yet.` })
  })

  app.use('/api', (req, res) => res.status(404).json({ error: 'API route not found.' }))
  app.use(express.static(dist))
  app.get('/{*path}', (req, res) => res.sendFile(path.join(dist, 'index.html')))
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err)
    res.status(err.status || 502).json({ error: err.status === 400 ? 'Invalid JSON.' : 'Service temporarily unavailable.' })
  })
  return app
}
