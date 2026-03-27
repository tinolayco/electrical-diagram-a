import type { Schematic, Component, ElectricalPath } from './types'

export async function loadDemoSchematic(): Promise<Schematic> {
  const demoImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Single-line_diagram_of_an_electrical_substation.svg/800px-Single-line_diagram_of_an_electrical_substation.svg.png'
  
  const response = await fetch(demoImageUrl)
  const blob = await response.blob()
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const imageData = reader.result as string
      
      const demoComponents: Component[] = [
        {
          id: 'demo-comp-1',
          type: 'transformer',
          name: 'T1 - Main Transformer',
          boundingBox: { x: 15, y: 10, width: 12, height: 15 },
          confidence: 95,
          voltage: '13.8kV/480V',
          rating: '1000kVA',
          manufacturer: 'ABB',
          connections: ['demo-comp-2'],
          metadata: { category: 'Power Distribution' }
        },
        {
          id: 'demo-comp-2',
          type: 'bus-bar',
          name: 'BB1 - Main Bus',
          boundingBox: { x: 35, y: 25, width: 30, height: 4 },
          confidence: 92,
          voltage: '480V',
          rating: '2000A',
          connections: ['demo-comp-1', 'demo-comp-3', 'demo-comp-4', 'demo-comp-5'],
          metadata: { material: 'Copper', phases: '3' }
        },
        {
          id: 'demo-comp-3',
          type: 'breaker',
          name: 'CB-1 Main Breaker',
          boundingBox: { x: 40, y: 35, width: 6, height: 8 },
          confidence: 98,
          voltage: '480V',
          rating: '400A',
          manufacturer: 'Schneider Electric',
          connections: ['demo-comp-2', 'demo-comp-6'],
          metadata: { type: 'ACB', tripUnit: 'Electronic' }
        },
        {
          id: 'demo-comp-4',
          type: 'breaker',
          name: 'CB-2 Feeder',
          boundingBox: { x: 50, y: 35, width: 6, height: 8 },
          confidence: 97,
          voltage: '480V',
          rating: '200A',
          manufacturer: 'Siemens',
          connections: ['demo-comp-2', 'demo-comp-7'],
          metadata: { type: 'MCCB', poles: '3P' }
        },
        {
          id: 'demo-comp-5',
          type: 'breaker',
          name: 'CB-3 Feeder',
          boundingBox: { x: 60, y: 35, width: 6, height: 8 },
          confidence: 96,
          voltage: '480V',
          rating: '150A',
          connections: ['demo-comp-2', 'demo-comp-8'],
          metadata: { type: 'MCCB', poles: '3P' }
        },
        {
          id: 'demo-comp-6',
          type: 'motor',
          name: 'M1 - Compressor Motor',
          boundingBox: { x: 40, y: 50, width: 8, height: 10 },
          confidence: 94,
          voltage: '480V',
          rating: '100HP',
          manufacturer: 'WEG',
          connections: ['demo-comp-3'],
          metadata: { speed: '1800 RPM', efficiency: 'IE3' }
        },
        {
          id: 'demo-comp-7',
          type: 'load',
          name: 'L1 - Distribution Panel',
          boundingBox: { x: 50, y: 50, width: 8, height: 10 },
          confidence: 89,
          voltage: '480V',
          rating: '100A',
          connections: ['demo-comp-4'],
          metadata: { type: 'Lighting & Receptacles' }
        },
        {
          id: 'demo-comp-8',
          type: 'motor',
          name: 'M2 - HVAC Fan',
          boundingBox: { x: 60, y: 50, width: 8, height: 10 },
          confidence: 93,
          voltage: '480V',
          rating: '50HP',
          manufacturer: 'Baldor',
          connections: ['demo-comp-5'],
          metadata: { speed: '1200 RPM', application: 'HVAC' }
        },
        {
          id: 'demo-comp-9',
          type: 'meter',
          name: 'PM1 - Power Meter',
          boundingBox: { x: 28, y: 24, width: 5, height: 6 },
          confidence: 91,
          connections: ['demo-comp-1', 'demo-comp-2'],
          metadata: { type: 'Digital', features: 'Energy monitoring' }
        },
        {
          id: 'demo-comp-10',
          type: 'disconnect',
          name: 'DS1 - Main Disconnect',
          boundingBox: { x: 8, y: 10, width: 4, height: 6 },
          confidence: 88,
          voltage: '13.8kV',
          rating: '600A',
          connections: ['demo-comp-1'],
          metadata: { type: 'Fused' }
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
