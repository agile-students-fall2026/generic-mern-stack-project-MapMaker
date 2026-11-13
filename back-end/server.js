import { createApp } from './app.js'

const port = process.env.PORT || 3001
createApp().listen(port, () => console.log(`MapMaker API running at http://localhost:${port}`))
