import { expect } from 'chai'
import { createApp } from '../app.js'

describe('Home Page and Menu', () => {
  let server
  let url

  before((done) => {
    server = createApp().listen(0, () => {
      url = `http://127.0.0.1:${server.address().port}`
      done()
    })
  })

  after((done) => {
    server.close(done)
  })

  async function get(path) {
    const response = await fetch(url + path)

    return {
      status: response.status,
      data: await response.json()
    }
  }

  it('returns the home page examples', async () => {
    const response = await get('/api/examples')

    expect(response.status).to.equal(200)
    expect(response.data).to.be.an('array')
    expect(response.data.length).to.be.greaterThan(0)
  })

  it('only returns examples that are not blank', async () => {
    const response = await get('/api/examples')

    for (const example of response.data) {
      expect(example).to.be.a('string')
      expect(example.trim()).to.not.equal('')
    }
  })

  it('finds a map for every example', async () => {
    const examples = (await get('/api/examples')).data

    for (const example of examples) {
      const response = await fetch(url + '/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: example })
      })
      const data = await response.json()

      expect(data.results.length).to.be.greaterThan(0)
    }
  })

  it('returns the menu with a user name', async () => {
    const response = await get('/api/menu')

    expect(response.status).to.equal(200)
    expect(response.data.user).to.equal('Guest')
  })

  it('returns the menu links', async () => {
    const response = await get('/api/menu')
    const labels = response.data.links.map(link => link.label)

    expect(response.data.links).to.have.length(3)
    expect(labels).to.include('My Maps')
  })

  it('only has menu links that go to a page in the app', async () => {
    const response = await get('/api/menu')

    for (const link of response.data.links) {
      expect(link.label).to.be.a('string')
      expect(link.path.startsWith('/')).to.equal(true)
    }
  })
})
