import type { Schematic, Component, ElectricalPath } from './types'
import demoSchematicSvg from '@/assets/demo-schematic.svg'

export async function loadDemoSchematic(): Promise<Schematic> {
  const response = await fetch(demoSchematicSvg)
  const svgText = await response.text()
  const blob = new Blob([svgText], { type: 'image/svg+xml' })
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const imageData = reader.result as string
      
      const demoComponents: Component[] = [
        {
          id: 'demo-comp-10',
          type: 'switch',
          name: 'SW1 - Main Switch',
          boundingBox: { x: 4, y: 19, width: 3, height: 6 },
          confidence: 88,
          voltage: '13.8kV',
          rating: '600A',
          connections: ['demo-comp-1'],
          metadata: { type: 'Fused' }
        },
        {
          id: 'demo-comp-1',
          type: 'transformer',
          name: 'T1 - Main Transformer',
          boundingBox: { x: 1, y: 32, width: 11, height: 14 },
          confidence: 95,
          voltage: '13.8kV/480V',
          rating: '1000kVA',
          manufacturer: 'ABB',
          connections: ['demo-comp-10', 'demo-comp-9'],
          metadata: { category: 'Power Distribution' }
        },
        {
          id: 'demo-comp-9',
          type: 'meter',
          name: 'PM1 - Power Meter',
          boundingBox: { x: 3, y: 54, width: 6, height: 5 },
          confidence: 91,
          connections: ['demo-comp-1', 'demo-comp-2'],
          metadata: { type: 'Digital', features: 'Energy monitoring' }
        },
        {
          id: 'demo-comp-2',
          type: 'bus-bar',
          name: 'BB1 - Main Bus',
          boundingBox: { x: 12, y: 61, width: 76, height: 6 },
          confidence: 92,
          voltage: '480V',
          rating: '2000A',
          connections: ['demo-comp-9', 'demo-comp-3', 'demo-comp-4', 'demo-comp-5'],
          metadata: { material: 'Copper', phases: '3' }
        },
        {
          id: 'demo-comp-3',
          type: 'breaker',
          name: 'CB-1 Main Breaker',
          boundingBox: { x: 22.5, y: 72, width: 4, height: 6 },
          confidence: 98,
          voltage: '480V',
          rating: '400A',
          manufacturer: 'Schneider Electric',
          connections: ['demo-comp-2', 'demo-comp-6'],
          metadata: { type: 'ACB', tripUnit: 'Electronic' }
        },
        {
          id: 'demo-comp-6',
          type: 'motor',
          name: 'M1 - Compressor Motor',
          boundingBox: { x: 21.5, y: 85, width: 6, height: 9.5 },
          confidence: 94,
          voltage: '480V',
          rating: '100HP',
          manufacturer: 'WEG',
          connections: ['demo-comp-3'],
          metadata: { speed: '1800 RPM', efficiency: 'IE3' }
        },
        {
          id: 'demo-comp-4',
          type: 'breaker',
          name: 'CB-2 Feeder',
          boundingBox: { x: 47.5, y: 72, width: 4, height: 6 },
          confidence: 97,
          voltage: '480V',
          rating: '200A',
          manufacturer: 'Siemens',
          connections: ['demo-comp-2', 'demo-comp-7'],
          metadata: { type: 'MCCB', poles: '3P' }
        },
        {
          id: 'demo-comp-7',
          type: 'load',
          name: 'L1 - Distribution Panel',
          boundingBox: { x: 46, y: 85, width: 7, height: 9.5 },
          confidence: 89,
          voltage: '480V',
          rating: '100A',
          connections: ['demo-comp-4'],
          metadata: { type: 'Lighting & Receptacles' }
        },
        {
          id: 'demo-comp-5',
          type: 'breaker',
          name: 'CB-3 Feeder',
          boundingBox: { x: 72.5, y: 72, width: 4, height: 6 },
          confidence: 96,
          voltage: '480V',
          rating: '150A',
          connections: ['demo-comp-2', 'demo-comp-8'],
          metadata: { type: 'MCCB', poles: '3P' }
        },
        {
          id: 'demo-comp-8',
          type: 'motor',
          name: 'M2 - HVAC Fan',
          boundingBox: { x: 71.5, y: 85, width: 6, height: 9.5 },
          confidence: 93,
          voltage: '480V',
          rating: '50HP',
          manufacturer: 'Baldor',
          connections: ['demo-comp-5'],
          metadata: { speed: '1200 RPM', application: 'HVAC' }
        }
      ]

      const demoPaths: ElectricalPath[] = [
        {
          id: 'demo-path-1',
          components: ['demo-comp-10', 'demo-comp-1', 'demo-comp-9', 'demo-comp-2'],
          voltage: '13.8kV → 480V',
          description: 'Main power feed from utility through transformer to main bus'
        },
        {
          id: 'demo-path-2',
          components: ['demo-comp-2', 'demo-comp-3', 'demo-comp-6'],
          voltage: '480V',
          description: 'Compressor motor circuit via main breaker CB-1'
        },
        {
          id: 'demo-path-3',
          components: ['demo-comp-2', 'demo-comp-4', 'demo-comp-7'],
          voltage: '480V',
          description: 'Distribution panel feeder via breaker CB-2'
        },
        {
          id: 'demo-path-4',
          components: ['demo-comp-2', 'demo-comp-5', 'demo-comp-8'],
          voltage: '480V',
          description: 'HVAC fan motor circuit via breaker CB-3'
        }
      ]

      const demoSchematic: Schematic = {
        id: 'demo-schematic-example',
        name: 'Example - Industrial Electrical Substation',
        imageData,
        uploadedAt: Date.now(),
        components: demoComponents,
        paths: demoPaths
      }

      resolve(demoSchematic)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
