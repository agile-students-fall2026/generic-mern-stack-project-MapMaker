import { expect } from 'chai'
import { createApp } from '../app.js'

describe('AI Chat', () => {
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

  async function post(path, data) {
    const response = await fetch(url + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    return {
      status: response.status,
      data: await response.json()
    }
  }

  it('returns a greeting for the chat page', async () => {
    const response = await get('/api/chat')

    expect(response.status).to.equal(200)
    expect(response.data.greeting).to.include('Hi')
  })

  it('returns chat suggestions', async () => {
    const response = await get('/api/chat')

    expect(response.data.suggestions).to.be.an('array')
    expect(response.data.suggestions.length).to.be.greaterThan(0)
  })

  it('replies to a chat message', async () => {
    const response = await post('/api/chat', { message: 'Make it green' })

    expect(response.status).to.equal(200)
    expect(response.data.reply).to.include('Make it green')
  })

  it('rejects an empty chat message', async () => {
    const response = await post('/api/chat', { message: '   ' })

    expect(response.status).to.equal(400)
    expect(response.data.error).to.equal('Enter a message.')
  })

  it('rejects a chat request with no message', async () => {
    const response = await post('/api/chat', {})

    expect(response.status).to.equal(400)
  })

  it('rejects a chat message that is not text', async () => {
    const response = await post('/api/chat', { message: 123 })
    expect(response.status).to.equal(400)
  })
})
