// Sample maps for Sprint 2. Live map search is saved on the next-sprint branch.
const templates = [
  { id: 'north-america', title: 'North America', description: 'Canada, Mexico, United States', styleId: 'atlas', selectedCountries: ['CAN', 'MEX', 'USA'] },
  { id: 'south-america', title: 'South America', description: 'Argentina, Brazil, Chile, Colombia, Peru', styleId: 'forest', selectedCountries: ['ARG', 'BRA', 'CHL', 'COL', 'PER'] },
  { id: 'europe', title: 'Europe', description: 'France, Germany, Italy, Spain, United Kingdom', styleId: 'blush', selectedCountries: ['FRA', 'DEU', 'ITA', 'ESP', 'GBR'] },
  { id: 'asia', title: 'Asia', description: 'China, India, Japan, South Korea', styleId: 'slate', selectedCountries: ['CHN', 'IND', 'JPN', 'KOR'] },
  { id: 'africa', title: 'Africa', description: 'Egypt, Kenya, Nigeria, South Africa', styleId: 'forest', selectedCountries: ['EGY', 'KEN', 'NGA', 'ZAF'] },
  { id: 'oceania', title: 'Oceania', description: 'Australia, New Zealand, Papua New Guinea', styleId: 'atlas', selectedCountries: ['AUS', 'NZL', 'PNG'] },
]

export function searchMaps(query = '') {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  return {
    results: templates.filter((map) => words.every((word) =>
      (map.title + ' ' + map.description).toLowerCase().includes(word))),
    next: null,
  }
}
