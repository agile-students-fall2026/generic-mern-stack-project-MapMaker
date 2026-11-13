import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { searchMaps, getDisplayImage } from './mapCatalog.js'
import addAuthRoutes from './auth.js'

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../front-end/dist')

export function createApp() {
  const app = express()
  const maps = []
  let nextId = 1

  app.use(express.json({ limit: '100kb' }))

  app.get('/api/health', (req, res) => res.json({ ok: true, message: 'MapMaker backend is running' }))
  addAuthRoutes(app)
  app.get('/api/maps', (req, res) => res.json(maps))

  app.post('/api/maps', (req, res) => {
    const name = String(req.body?.name || '').trim().slice(0, 80)
    if (!name) return res.status(400).json({ error: 'Enter a map name.' })
    const number = nextId++
    const map = { number, id: String(number), name, title: name,
      asset: req.body.asset || null, image: req.body.asset?.thumbnail || null }
    maps.unshift(map)
    res.status(201).json(map)
  })

  app.get('/api/maps/:id', (req, res) => {
    const map = maps.find((item) => item.id === req.params.id)
    return map ? res.json(map) : res.status(404).json({ error: 'Map not found.' })
  })

  function updateMap(req, res) {
    const map = maps.find((item) => item.id === req.params.id)
    if (!map) return res.status(404).json({ error: 'Map not found.' })
    const fields = ['title', 'subtitle', 'styleId', 'imageStyle', 'selectedCountries', 'legendLabels']
    for (const field of fields) {
      if (req.body?.[field] !== undefined) map[field] = req.body[field]
    }
    if (typeof req.body?.name === 'string') map.title = req.body.name.slice(0, 80)
    if (typeof map.title === 'string') map.name = map.title
    res.json(map)
  }
  app.patch('/api/maps/:id', updateMap)
  app.post('/api/maps/:id', updateMap)

  app.post('/api/search', async (req, res) => {
    const query = req.body?.query
    if (typeof query !== 'string' || !query.trim() || query.length > 140) {
      return res.status(400).json({ error: 'Enter a search of up to 140 characters.' })
    }
    res.json(await searchMaps(query, req.body?.cursor || null))
  })

  app.post('/api/map-image', async (req, res) => {
    const pageId = req.body?.pageId
    if (!Number.isSafeInteger(pageId) || pageId <= 0) {
      return res.status(400).json({ error: 'Invalid map image.' })
    }
    res.json({ url: await getDisplayImage({ pageId }) })
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
