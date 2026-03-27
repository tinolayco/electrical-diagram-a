export type ComponentType = 
  | 'breaker'
  | 'transformer'
  | 'bus-bar'
  | 'switch'
  | 'fuse'
  | 'relay'
  | 'meter'
  | 'capacitor'
  | 'inductor'
  | 'generator'
  | 'motor'
  | 'load'
  | 'unknown'

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface Component {
  id: string
  type: ComponentType
  name: string
  boundingBox: BoundingBox
  confidence: number
  voltage?: string
  rating?: string
  manufacturer?: string
  connections: string[]
  metadata?: Record<string, string>
}

export interface ElectricalPath {
  id: string
  components: string[]
  voltage: string
  description: string
}

export interface Schematic {
  id: string
  name: string
  imageData: string
  uploadedAt: number
  components: Component[]
  paths: ElectricalPath[]
}

export interface CatalogEntry {
  id: string
  type: ComponentType
  count: number
  examples: Array<{
    imageData: string
    boundingBox: BoundingBox
    metadata: Record<string, string>
  }>
  lastUpdated: number
}

export interface TrainingAnnotation {
  id: string
  schematicId: string
  boundingBox: BoundingBox
  correctType: ComponentType
  userVerified: boolean
  createdAt: number
}

export interface ComponentLibrary {
  id: string
  name: string
  description: string
  isDefault: boolean
  createdAt: number
  lastModified: number
  annotations: TrainingAnnotation[]
  componentCount: number
  version?: string
  author?: string
  tags?: string[]
}

export interface LibraryVersion {
  version: string
  changelog: string
  createdAt: number
  createdBy?: string
}

export interface LibraryExportData {
  formatVersion: string
  exportedAt: number
  exportedBy?: string
  library: ComponentLibrary
  metadata: {
    appVersion: string
    compatibleWith: string[]
    checksum?: string
  }
  versionHistory?: LibraryVersion[]
}
