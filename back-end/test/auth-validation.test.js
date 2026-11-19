
import { expect } from 'chai'
import { createApp } from '../app.js'

describe('Authentication Validation', () => {
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

  it('rejects a blank username', async () => {
    const response = await post('/api/register', {
      username: '   ',
      email: 'test@example.com',
      password: 'password123'
    })

    expect(response.status).to.equal(400)
  })

  it('rejects an invalid email address', async () => {
    const response = await post('/api/register', {
      username: 'Student',
      email: 'invalidemail',
      password: 'password123'
    })

    expect(response.status).to.equal(400)
  })

  it('treats email addresses as case insensitive', async () => {
    const user = {
      username: 'Student',
      email: 'CASE@example.com',
      password: 'password123'
    }

    const first = await post('/api/register', user)

    const duplicate = await post('/api/register', {
      ...user,
      email: 'case@example.com'
    })

    expect(first.status).to.equal(201)
    expect(duplicate.status).to.equal(409)
  })

  it('rejects login for an unknown account', async () => {
    const response = await post('/api/login', {
      email: 'unknown@example.com',
      password: 'password123'
    })

    expect(response.status).to.equal(401)
  })
})