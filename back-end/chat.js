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
}