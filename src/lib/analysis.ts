import type { Component, ComponentType } from './types'

export async function analyzeSchematic(imageData: string): Promise<Component[]> {
  const prompt = spark.llmPrompt`You are an expert electrical engineer analyzing a single-line electrical diagram.

Analyze this electrical schematic image and identify all electrical components visible in the diagram.

For each component you identify, determine:
1. Component type (breaker, transformer, bus-bar, switch, disconnect, fuse, relay, meter, capacitor, inductor, generator, motor, load, or unknown)
2. Approximate position and size in the image (as percentages of image dimensions)
3. Confidence level (0-100)
4. Any visible labels or ratings

Return a JSON object with a single property "components" containing an array of component objects.

Each component object should have this structure:
{
  "type": "breaker",
  "name": "CB-1",
  "boundingBox": {
    "x": 10,
    "y": 20,
    "width": 5,
    "height": 8
  },
  "confidence": 85,
  "voltage": "480V",
  "rating": "100A"
}

The boundingBox coordinates should be percentages (0-100) of the image width and height.

Image data: ${imageData.substring(0, 200)}...`

  try {
    const response = await spark.llm(prompt, 'gpt-4o', true)
    const parsed = JSON.parse(response)
    
    if (!parsed.components || !Array.isArray(parsed.components)) {
      return []
    }
    
    return parsed.components.map((comp: any, index: number) => ({
      id: `comp-${Date.now()}-${index}`,
      type: (comp.type || 'unknown') as ComponentType,
      name: comp.name || `Component ${index + 1}`,
      boundingBox: comp.boundingBox || { x: 0, y: 0, width: 10, height: 10 },
      confidence: comp.confidence || 50,
      voltage: comp.voltage,
      rating: comp.rating,
      manufacturer: comp.manufacturer,
      connections: [],
      metadata: {}
    }))
  } catch (error) {
    console.error('Failed to analyze schematic:', error)
    return []
  }
}

export async function identifyElectricalPaths(
  components: Component[]
): Promise<Array<{ id: string; components: string[]; voltage: string; description: string }>> {
  if (components.length === 0) return []
  
  const componentList = components.map(c => ({
    id: c.id,
    type: c.type,
    name: c.name,
    position: c.boundingBox
  }))
  
  const prompt = spark.llmPrompt`You are an expert electrical engineer analyzing electrical connections.

Given these electrical components from a single-line diagram, identify the electrical paths (series of connected components).

Components: ${JSON.stringify(componentList)}

Analyze the spatial relationships and typical electrical schematic conventions to determine which components are connected in electrical paths.

Return a JSON object with a single property "paths" containing an array of path objects.

Each path should include:
{
  "components": ["comp-id-1", "comp-id-2", "comp-id-3"],
  "voltage": "480V",
  "description": "Main feeder from transformer to distribution panel"
}

Focus on identifying:
- Main power distribution paths
- Bus bar networks
- Branch circuits
- Generator/source to load paths`

  try {
    const response = await spark.llm(prompt, 'gpt-4o-mini', true)
    const parsed = JSON.parse(response)
    
    if (!parsed.paths || !Array.isArray(parsed.paths)) {
      return []
    }
    
    return parsed.paths.map((path: any, index: number) => ({
      id: `path-${Date.now()}-${index}`,
      components: path.components || [],
      voltage: path.voltage || 'Unknown',
      description: path.description || `Path ${index + 1}`
    }))
  } catch (error) {
    console.error('Failed to identify paths:', error)
    return []
  }
}

export function getComponentColor(type: ComponentType): string {
  const colors: Record<ComponentType, string> = {
    'breaker': '#EF4444',
    'transformer': '#3B82F6',
    'bus-bar': '#F59E0B',
    'switch': '#8B5CF6',
    'disconnect': '#EC4899',
    'fuse': '#DC2626',
    'relay': '#10B981',
    'meter': '#14B8A6',
    'capacitor': '#6366F1',
    'inductor': '#8B5CF6',
    'generator': '#F59E0B',
    'motor': '#06B6D4',
    'load': '#64748B',
    'unknown': '#9CA3AF'
  }
  return colors[type] || colors.unknown
}

export function getComponentLabel(type: ComponentType): string {
  const labels: Record<ComponentType, string> = {
    'breaker': 'Circuit Breaker',
    'transformer': 'Transformer',
    'bus-bar': 'Bus Bar',
    'switch': 'Switch',
    'disconnect': 'Disconnect',
    'fuse': 'Fuse',
    'relay': 'Relay',
    'meter': 'Meter',
    'capacitor': 'Capacitor',
    'inductor': 'Inductor',
    'generator': 'Generator',
    'motor': 'Motor',
    'load': 'Load',
    'unknown': 'Unknown'
  }
  return labels[type] || labels.unknown
}
