import type { ComponentLibrary, LibraryExportData, LibraryVersion } from './types'

const CURRENT_FORMAT_VERSION = '2.0.0'
const APP_VERSION = '1.0.0'
const COMPATIBLE_VERSIONS = ['1.0.0', '2.0.0']

export function generateChecksum(data: string): string {
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}

export function incrementVersion(currentVersion: string, type: 'major' | 'minor' | 'patch' = 'patch'): string {
  const parts = currentVersion.split('.').map(Number)
  
  switch (type) {
    case 'major':
      return `${parts[0] + 1}.0.0`
    case 'minor':
      return `${parts[0]}.${parts[1] + 1}.0`
    case 'patch':
    default:
      return `${parts[0]}.${parts[1]}.${parts[2] + 1}`
  }
}

export function createLibraryExportData(
  library: ComponentLibrary,
  exportedBy?: string,
  versionHistory?: LibraryVersion[]
): LibraryExportData {
  const libraryJson = JSON.stringify(library)
  
  const exportData: LibraryExportData = {
    formatVersion: CURRENT_FORMAT_VERSION,
    exportedAt: Date.now(),
    exportedBy,
    library: {
      ...library,
      version: library.version || '1.0.0',
    },
    metadata: {
      appVersion: APP_VERSION,
      compatibleWith: COMPATIBLE_VERSIONS,
      checksum: generateChecksum(libraryJson),
    },
    versionHistory: versionHistory || [],
  }
  
  return exportData
}

export function validateImportData(data: unknown): {
  valid: boolean
  error?: string
  exportData?: LibraryExportData
} {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Format de fichier invalide' }
  }
  
  const exportData = data as Partial<LibraryExportData>
  
  if (!exportData.library) {
    return { valid: false, error: 'Bibliothèque manquante dans le fichier' }
  }
  
  if (!exportData.formatVersion) {
    return { valid: false, error: 'Version du format manquante' }
  }
  
  if (!COMPATIBLE_VERSIONS.includes(exportData.formatVersion)) {
    return {
      valid: false,
      error: `Format incompatible. Versions supportées: ${COMPATIBLE_VERSIONS.join(', ')}`
    }
  }
  
  if (exportData.metadata?.checksum) {
    const libraryJson = JSON.stringify(exportData.library)
    const calculatedChecksum = generateChecksum(libraryJson)
    
    if (calculatedChecksum !== exportData.metadata.checksum) {
      return {
        valid: false,
        error: 'Le fichier semble corrompu (checksum invalide)'
      }
    }
  }
  
  return {
    valid: true,
    exportData: exportData as LibraryExportData
  }
}

export function formatVersionHistory(history: LibraryVersion[]): string {
  return history
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(v => `v${v.version} - ${new Date(v.createdAt).toLocaleDateString('fr-FR')}${v.changelog ? ': ' + v.changelog : ''}`)
    .join('\n')
}

export function getLatestVersion(history: LibraryVersion[]): LibraryVersion | null {
  if (history.length === 0) return null
  return history.reduce((latest, current) => {
    return current.createdAt > latest.createdAt ? current : latest
  })
}
