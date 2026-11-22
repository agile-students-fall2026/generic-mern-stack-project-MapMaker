const examples = [
  'Europe',
  'Asia',
  'Africa',
  'South America',
]

const menu = {
  user: 'Guest',
  links: [
    { label: 'New Map', path: '/home' },
    { label: 'My Maps', path: '/MyMaps' },
    { label: 'Sign Out', path: '/login' },
  ],
}

export default function addHomeRoutes(app) {
  app.get('/api/examples', (req, res) => res.json(examples))
  app.get('/api/menu', (req, res) => res.json(menu))
}