
import { expect } from 'chai'
import { createApp } from '../app.js'

describe('Password Reset', () => {
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

  async function getResetToken(email) {
    let resetLink = ''
    const originalLog = console.log

    console.log = (...args) => {
      const message = args.join(' ')

      if (message.startsWith('Development password reset link: ')) {
        resetLink = message.replace('Development password reset link: ', '')
      } else {
        originalLog(...args)
      }
    }

    try {
      const response = await post('/api/forgot-password', { email })
      expect(response.status).to.equal(200)
    } finally {
      console.log = originalLog
    }

    expect(resetLink).to.not.equal('')
    return new URL(resetLink).searchParams.get('token')
  }

  it('rejects forgot password requests without an email', async () => {
    const response = await post('/api/forgot-password', {})

    expect(response.status).to.equal(400)
    expect(response.data.message).to.equal('Please enter your email.')
  })

  it('handles unknown email addresses without revealing accounts', async () => {
    const response = await post('/api/forgot-password', {
      email: 'unknown@example.com'
    })

    expect(response.status).to.equal(200)
    expect(response.data.message).to.include('If the account exists')
  })

  it('rejects missing and invalid reset tokens', async () => {
    const missing = await post('/api/reset-password', {
      newPassword: 'password123'
    })

    const invalid = await post('/api/reset-password', {
      token: 'invalid-token',
      newPassword: 'password123'
    })

    expect(missing.status).to.equal(400)
    expect(invalid.status).to.equal(400)
  })

  it('rejects a new password shorter than 8 characters', async () => {
    const response = await post('/api/reset-password', {
      token: 'invalid-token',
      newPassword: 'short'
    })

    expect(response.status).to.equal(400)
    expect(response.data.message).to.include('password is too short')
  })

  it('resets a password and allows login with the new password', async () => {
    const email = 'reset-success@example.com'
    const oldPassword = 'oldpassword123'
    const newPassword = 'newpassword123'

    const registered = await post('/api/register', {
      username: 'Reset User',
      email,
      password: oldPassword
    })

    expect(registered.status).to.equal(201)

    const token = await getResetToken(email)

    const reset = await post('/api/reset-password', {
      token,
      newPassword
    })

    expect(reset.status).to.equal(200)
    expect(reset.data.message).to.equal('Password successfully updated.')

    const oldLogin = await post('/api/login', {
      email,
      password: oldPassword
    })

    const newLogin = await post('/api/login', {
      email,
      password: newPassword
    })

    expect(oldLogin.status).to.equal(401)
    expect(newLogin.status).to.equal(200)
  })

  it('prevents reuse of a password reset token', async () => {
    const email = 'reset-reuse@example.com'

    const registered = await post('/api/register', {
      username: 'Another User',
      email,
      password: 'originalpassword123'
    })

    expect(registered.status).to.equal(201)

    const token = await getResetToken(email)

    const firstReset = await post('/api/reset-password', {
      token,
      newPassword: 'newpassword123'
    })

    const secondReset = await post('/api/reset-password', {
      token,
      newPassword: 'anotherpassword123'
    })

    expect(firstReset.status).to.equal(200)
    expect(secondReset.status).to.equal(400)
  })
})
