import api from '../api'

export function cleanMapQuery(text) {
  return text.trim()
    .replace(/^(?:please\s+)?(?:can you\s+)?(?:generate|create|make|find|show|give me)\s+(?:me\s+)?(?:a\s+)?(?:historical\s+)?map\s*(?:of|showing|depicting|for)?\s*/i, '')
    .replace(/^(?:map\s+of\s+|a\s+map\s+of\s+)/i, '')
    .slice(0, 140)
}

export const searchMaps = (query, signal) => api('/search', {
  method: 'POST', body: { query }, signal,
})
