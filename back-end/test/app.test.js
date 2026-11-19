import { expect } from 'chai'
import { createApp } from '../app.js'

describe('MapMaker Express API', () => {
  let server, base, mapId

  before(async () => {
    server = createApp().listen(0, '127.0.0.1')
    await new Promise((resolve) => server.once('listening', resolve))
    base = `http://127.0.0.1:${server.address().port}`
  })

  after(async () => {
    await new Promise((resolve) => server.close(resolve))
  })

  async function request(path, method = 'GET', body) {
    const response = await fetch(base + path, {
      method, headers: { 'Content-Type': 'application/json' },
      body: body && JSON.stringify(body),
    })
    return { status: response.status, data: response.status === 204 ? null : await response.json() }
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

  it('returns source information for a saved map', async () => {
    const response = await request('/api/maps/' + mapId + '/sources')
    expect(response.status).to.equal(200)
    expect(response.data.title).to.equal('Natural Earth')
    expect(response.data.url).to.include('naturalearthdata.com')
    expect((await request('/api/maps/unknown/sources')).status).to.equal(404)
  })

  it('duplicates maps and preserves their properties', async () => {
    const created = await request('/api/maps', 'POST', { name: 'Original map' })
    const id = created.data.id
    await request('/api/maps/' + id, 'PATCH', {
      selectedCountries: ['CAN'], styleId: 'forest',
    })
    const before = await request('/api/maps')
    const duplicated = await request('/api/maps/' + id + '/duplicate', 'POST')
    expect(duplicated.status).to.equal(201)
    expect(duplicated.data.id).not.to.equal(id)
    expect(duplicated.data.selectedCountries).to.deep.equal(['CAN'])
    expect(duplicated.data.styleId).to.equal('forest')
    expect((await request('/api/maps')).data).to.have.length(before.data.length + 1)
    await request('/api/maps/' + duplicated.data.id, 'PATCH', { selectedCountries: ['USA'] })
    expect((await request('/api/maps/' + id)).data.selectedCountries).to.deep.equal(['CAN'])
  })

  it('returns 404 for missing maps and routes', async () => {
    expect((await request('/api/maps/does-not-exist')).status).to.equal(404)
    expect((await request('/api/maps/does-not-exist', 'PATCH', { title: 'X' })).status).to.equal(404)
    expect((await request('/api/no-such-route')).status).to.equal(404)
  })

  it('deletes a saved map', async () => {
    const deleted = await request('/api/maps/' + mapId, 'DELETE')
    expect(deleted.status).to.equal(204)
    expect((await request('/api/maps')).data.some((map) => map.id === mapId)).to.equal(false)
    expect((await request('/api/maps/' + mapId)).status).to.equal(404)
    expect((await request('/api/maps/' + mapId, 'DELETE')).status).to.equal(404)
  })

  it('registers users and checks their passwords', async () => {
    const user = { username: 'Student', email: 'Student@Example.com', password: 'test-password' }
    expect((await request('/api/register', 'POST', { email: user.email })).status).to.equal(400)
    expect((await request('/api/register', 'POST', { ...user, password: 'short' })).status).to.equal(400)
    const registered = await request('/api/register', 'POST', user)
    expect(registered.status).to.equal(201)
    expect(registered.data).not.to.have.property('passwordHash')
    expect((await request('/api/auth/register', 'POST', user)).status).to.equal(409)
    expect((await request('/api/login', 'POST', { email: user.email, password: 'wrong-password' })).status).to.equal(401)
    const login = await request('/api/auth/login', 'POST', { email: 'student@example.com', password: user.password })
    expect(login.status).to.equal(200)
    expect(login.data.username).to.equal('Student')
    expect((await request('/api/login', 'POST', { email: user.email })).status).to.equal(400)
  })

  it('receives chat forms without claiming AI is connected', async () => {
    expect((await request('/api/chat', 'POST', { message: 'make it green' })).data.reply).to.include('not connected')
    expect((await request('/api/chat', 'POST', { message: '' })).status).to.equal(400)
  })

  it('validates map search and country selections', async () => {
    expect((await request('/api/search', 'POST', { query: 12 })).status).to.equal(400)
    expect((await request('/api/search', 'POST', { query: 'x'.repeat(141) })).status).to.equal(400)
    expect((await request('/api/maps', 'POST', { name: 'Test', selectedCountries: 'CAN' })).status).to.equal(400)
    expect((await request('/api/map-image', 'POST', { pageId: 123 })).status).to.equal(404)
  })

  it('returns editable sample maps without contacting external services', async () => {
    const all = await request('/api/search', 'POST', { query: '' })
    expect(all.data.results).to.have.length(6)
    const europe = await request('/api/search', 'POST', { query: 'Europe' })
    expect(europe.data.results).to.have.length(1)
    expect(europe.data.results[0].selectedCountries).to.include('FRA')
    expect((await request('/api/search', 'POST', { query: 'Roman Empire 117' })).data.results).to.deep.equal([])

    const template = europe.data.results[0]
    const created = await request('/api/maps', 'POST', {
      name: template.title, selectedCountries: template.selectedCountries, styleId: template.styleId,
    })
    expect(created.status).to.equal(201)
    expect(created.data.selectedCountries).to.deep.equal(template.selectedCountries)
    expect(created.data.styleId).to.equal(template.styleId)
    expect(created.data.asset).to.equal(null)
    expect((await request('/api/maps/' + created.data.id, 'DELETE')).status).to.equal(204)
  })
  it('shares maps and retrieves collaborators', async () => {
    const created = await request('/api/maps', 'POST', { name: 'Shared map' })
    const id = created.data.id
    const collaborator = { email: 'collaborator@example.com' }
    const shared = await request('/api/maps/' + id + '/share', 'POST', collaborator)
    expect(shared.status).to.equal(200)
    expect((await request('/api/maps/' + id)).data.collaborators).to.include(collaborator.email)
  })
})
