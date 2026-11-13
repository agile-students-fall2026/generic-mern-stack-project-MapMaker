import bcrypt from 'bcryptjs'

export default function addAuthRoutes(app) {
  const users = [] // Sprint 2 mock storage; accounts disappear when the server restarts.

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
}
