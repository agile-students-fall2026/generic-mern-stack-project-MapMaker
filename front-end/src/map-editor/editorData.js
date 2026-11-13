export const STYLES = [
  { id: 'atlas', name: 'Atlas blue', water: '#ecf2ff', land: '#cbd7f0', highlight: '#5367df', border: '#aebfdd', grid: '#c4d1e9' },
  { id: 'blush', name: 'Soft pastel', water: '#fff3f7', land: '#efd8e6', highlight: '#bf7fa9', border: '#dfbfd3', grid: '#f0dbe7' },
  { id: 'forest', name: 'Forest', water: '#edf8f4', land: '#cce4d8', highlight: '#348d72', border: '#abcfc0', grid: '#d5e9df' },
  { id: 'slate', name: 'Modern slate', water: '#f0f3f7', land: '#cfd8e3', highlight: '#596a81', border: '#b7c5d4', grid: '#d9e2eb' },
]

export const IMAGE_STYLES = [
  { id: 'original', name: 'Original', filter: 'none' },
  { id: 'black-white', name: 'Black and white', filter: 'grayscale(1)' },
  { id: 'warm', name: 'Warm', filter: 'sepia(0.5)' },
]

export const DEFAULT_MAP = {
  id: 'demo-world',
  title: 'World at a glance',
  subtitle: 'An editable map to tell your story',
  styleId: 'atlas',
  selectedCountries: [],
  asset: null,
  imageStyle: 'original',
  legendLabels: ['Highlighted regions', 'Other regions'],
}

export function getMapFor(selectedMap) {
  const id = String(selectedMap.id ?? selectedMap.number ?? selectedMap.name ?? 'demo-world')
  return {
    ...DEFAULT_MAP,
    ...selectedMap,
    id,
    title: selectedMap.title || selectedMap.name || DEFAULT_MAP.title,
    asset: selectedMap.asset || null,
    selectedCountries: selectedMap.selectedCountries || [],
    legendLabels: selectedMap.legendLabels || [...DEFAULT_MAP.legendLabels],
  }
}
