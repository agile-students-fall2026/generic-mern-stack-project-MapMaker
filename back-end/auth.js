import bcrypt from 'bcryptjs'
import { randomBytes, createHash } from 'node:crypto'

export default function addAuthRoutes(app) {
  const users = [] // Sprint 2 mock storage; accounts disappear when the server restarts.
  const resetTokens = new Map()

  app.post(['/api/register', '/api/auth/register'], async (req, res) => {
    const { username, email, password } = req.body || {}

    if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Please complete all fields.' })
    }

    if (!username.trim() || !email.includes('@') || password.length < 8) {
      return res.status(400).json({
        message: 'Enter a name, valid email, and password of at least 8 characters.'
      })
    }

    const cleanEmail = email.trim().toLowerCase()
    if (users.some(user => user.email === cleanEmail)) {
      return res.status(409).json({ message: 'This email is already registered.' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    users.push({ username: username.trim(), email: cleanEmail, passwordHash })
    res.status(201).json({ message: 'Account created.' })
  })

  app.post(['/api/login', '/api/auth/login'], async (req, res) => {
    const { email, password } = req.body || {}
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Enter your email and password.' })
    }

    const user = users.find(user => user.email === email.trim().toLowerCase())
    const validPassword = user && await bcrypt.compare(password, user.passwordHash)
    if (!validPassword) {
      return res.status(401).json({ message: 'Incorrect email or password.' })
    }

    res.json({ message: 'Signed in.', username: user.username })
  })

  app.post('/api/forgot-password', (req, res) => {
    const { email } = req.body || {}

    if (typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        message: 'Please enter your email.'
      })
    }

    const user = users.find(
      user => user.email === email.trim().toLowerCase()
    )

    if (user) {
      const token = randomBytes(32).toString('hex')
      const tokenHash = createHash('sha256').update(token).digest('hex')

      resetTokens.set(tokenHash, {
        email: user.email,
        expires: Date.now() + 15 * 60 * 1000
      })

      console.log(
        'Development password reset link: http://localhost:5173/reset-password?token=' + token
      )
    }

    res.json({
      message: 'If the account exists, check the backend terminal for the development reset link.'
    })
  })

  app.post('/api/reset-password', async (req, res) => {
    const { token, newPassword } = req.body || {}

    if (
      typeof token !== 'string' ||
      typeof newPassword !== 'string' ||
      newPassword.length < 8
    ) {
      return res.status(400).json({
        message: 'Invalid request or password is too short.'
      })
    }

    const tokenHash = createHash('sha256').update(token).digest('hex')
    const reset = resetTokens.get(tokenHash)

    if (!reset || Date.now() > reset.expires) {
      resetTokens.delete(tokenHash)
      return res.status(400).json({
        message: 'Reset link is invalid or expired.'
      })
    }

    const user = users.find(user => user.email === reset.email)

    if (!user) {
      resetTokens.delete(tokenHash)
      return res.status(400).json({
        message: 'Reset link is invalid.'
      })
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10)

    for (const [key, value] of resetTokens) {
      if (value.email === user.email) {
        resetTokens.delete(key)
      }
    }

    res.json({
      message: 'Password successfully updated.'
    })
  })

}
