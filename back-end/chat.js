const chat = {
  greeting: 'Hi! Tell me what you want to change on your map.',
  suggestions: [
    'Make it green',
    'Make it pink',
    'Title: My Trip',
  ],
}

export default function addChatRoutes(app) {
  app.get('/api/chat', (req, res) => res.json(chat))
  app.post('/api/chat', (req, res) => {
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : ''
    if (!message) return res.status(400).json({ error: 'Enter a message.' })
    res.json({ reply: `Demo response: received "${message.slice(0, 180)}". AI is not connected yet.` })
  })
}
