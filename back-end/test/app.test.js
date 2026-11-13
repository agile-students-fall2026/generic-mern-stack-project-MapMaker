import { expect } from 'chai'
import { createApp } from '../app.js'

describe('MapMaker Express API', () => {
  let server, base, mapId
  const originalFetch = globalThis.fetch

  before(async () => {
    server = createApp().listen(0, '127.0.0.1')
    await new Promise((resolve) => server.once('listening', resolve))
    base = `http://127.0.0.1:${server.address().port}`
  })

  after(async () => {
    globalThis.fetch = originalFetch
    await new Promise((resolve) => server.close(resolve))
  })

  async function request(path, method = 'GET', body) {
    const response = await originalFetch(base + path, {
      method, headers: { 'Content-Type': 'application/json' },
      body: body && JSON.stringify(body),
    })
    return { status: response.status, data: await response.json() }
  }

  it('reports the API is healthy', async () => {
    expect((await request('/api/health')).data.ok).to.equal(true)
  })

  it('starts with an empty mock map list', async () => {
    expect((await request('/api/maps')).data).to.deep.equal([])
  })

  it('rejects empty map names', async () => {
    expect((await request('/api/maps', 'POST', { name: '  ' })).status).to.equal(400)
  })

  it('creates, retrieves and edits maps', async () => {
    const created = await request('/api/maps', 'POST', { name: '  My first map  ' })
    expect(created.status).to.equal(201)
    mapId = created.data.id
    expect(created.data.name).to.equal('My first map')
    const edited = await request('/api/maps/' + mapId, 'PATCH', {
      title: 'New title', selectedCountries: ['CAN'], styleId: 'forest',
    })
    expect(edited.data.name).to.equal('New title')
    expect(edited.data.selectedCountries).to.deep.equal(['CAN'])
    expect((await request('/api/maps/' + mapId)).data.styleId).to.equal('forest')
    expect((await request('/api/maps/' + mapId, 'POST', { imageStyle: 'warm' })).data.imageStyle).to.equal('warm')
    expect((await request('/api/maps')).data).to.have.length(1)
  })

  it('returns 404 for missing maps and routes', async () => {
    expect((await request('/api/maps/does-not-exist')).status).to.equal(404)
    expect((await request('/api/maps/does-not-exist', 'PATCH', { title: 'X' })).status).to.equal(404)
    expect((await request('/api/no-such-route')).status).to.equal(404)
  })

  it('receives demo login and chat forms', async () => {
    expect((await request('/api/auth/login', 'POST', { email: 'student@example.com', password: 'test' })).status).to.equal(200)
    expect((await request('/api/auth/register', 'POST', { email: 'student@example.com', password: 'test' })).status).to.equal(200)
    expect((await request('/api/auth/login', 'POST', { email: 'student@example.com' })).status).to.equal(400)
    expect((await request('/api/chat', 'POST', { message: 'make it green' })).data.reply).to.include('not connected')
    expect((await request('/api/chat', 'POST', { message: '' })).status).to.equal(400)
  })

  it('validates map search and image requests', async () => {
    expect((await request('/api/search', 'POST', { query: '' })).status).to.equal(400)
    expect((await request('/api/map-image', 'POST', { pageId: 'oops' })).status).to.equal(400)
  })

  it('searches Wikimedia through Express and filters non-map images', async () => {
    globalThis.fetch = async (url, options) => {
      if (!String(url).startsWith('https://commons.wikimedia.org/w/api.php')) return originalFetch(url, options)
      const params = new URL(url).searchParams
      const page = params.has('pageids')
        ? { query: { pages: { 123: { imageinfo: [{ thumburl: 'https://upload.wikimedia.org/map-large.png' }] } } } }
        : { query: { pages: {
          123: { pageid: 123, title: 'File:New York Map.png', categories: [{ title: 'Category:Maps of New York' }],
            imageinfo: [{ mime: 'image/png', thumburl: 'https://upload.wikimedia.org/map.png', descriptionurl: 'https://commons.wikimedia.org/wiki/File:Map.png' }] },
          456: { pageid: 456, title: 'File:New York Park Photo.jpg', categories: [],
            imageinfo: [{ mime: 'image/jpeg', thumburl: 'https://upload.wikimedia.org/photo.jpg' }] },
        } } }
      return new Response(JSON.stringify(page), { status: 200 })
    }
    const result = await request('/api/search', 'POST', { query: 'New York' })
    expect(result.status).to.equal(200)
    expect(result.data.results.map((item) => item.title)).to.deep.equal(['New York Map'])
    expect((await request('/api/map-image', 'POST', { pageId: 123 })).data.url).to.include('map-large.png')
    globalThis.fetch = originalFetch
  })
})
