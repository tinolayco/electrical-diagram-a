import type { Component, ComponentType, TrainingAnnotation, BoundingBox } from './types'
import { detectComponentsInImage } from './image-detection'

export async function analyzeSchematic(imageData: string, trainingAnnotations?: TrainingAnnotation[]): Promise<Component[]> {
  const imageDetectedComponents = trainingAnnotations 
    ? await convertAnnotationsToComponents(trainingAnnotations, imageData)
    : await detectComponentsInImage(imageData)
  
  if (imageDetectedComponents.length === 0) {
    return []
  }
  
  const prompt = spark.llmPrompt`You are an expert electrical engineer analyzing a single-line electrical diagram.

We have performed computer vision analysis and detected these components with their visual locations:
${JSON.stringify(imageDetectedComponents.map(c => ({
  id: c.id,
  type: c.type,
  name: c.name,
  boundingBox: c.boundingBox,
  confidence: c.confidence
})), null, 2)}

IMPORTANT: The boundingBox coordinates are already correct percentages (0-100) of image dimensions.

Your task is to:
1. Keep the exact same boundingBox coordinates from the computer vision analysis
2. Improve the component names by analyzing text in the image (e.g., "CB-1", "T1", "M1")
3. Identify voltage ratings from visible text
4. Identify current ratings from visible text
5. Add manufacturer info if visible

CRITICAL: You must preserve the exact boundingBox from the input. Do not change or estimate new positions.

Return a JSON object with a single property "components" containing the refined array.

Example output format:
{
  "components": [
    {
      "id": "comp-123",
      "type": "breaker",
      "name": "CB-1",
      "boundingBox": {"x": 22.5, "y": 72, "width": 4, "height": 6},
      "confidence": 95,
      "voltage": "480V",
      "rating": "400A"
    }
  ]
}

Image (base64): ${imageData.substring(0, 300)}...`

  try {
    const response = await spark.llm(prompt, 'gpt-4o', true)
    const parsed = JSON.parse(response)
    
    if (!parsed.components || !Array.isArray(parsed.components)) {
      return imageDetectedComponents
    }
    
    const componentMap = new Map(imageDetectedComponents.map(c => [c.id, c]))
    
    const refinedComponents = parsed.components
      .map((comp: any) => {
        const original = componentMap.get(comp.id)
        if (!original) return null
        
        return {
          id: comp.id,
          type: (comp.type || original.type) as ComponentType,
          name: comp.name || original.name,
          boundingBox: validateBoundingBox(comp.boundingBox || original.boundingBox),
          confidence: Math.min(100, Math.max(0, comp.confidence || original.confidence)),
          voltage: comp.voltage || original.voltage,
          rating: comp.rating || original.rating,
          manufacturer: comp.manufacturer || original.manufacturer,
          connections: [],
          metadata: { ...original.metadata, ...comp.metadata }
        }
      })
      .filter((c: any) => c !== null)
    
    return refinedComponents.length > 0 ? refinedComponents : imageDetectedComponents
  } catch (error) {
    console.error('Failed to analyze schematic:', error)
    return imageDetectedComponents
  }
}

function validateBoundingBox(box: any): BoundingBox {
  return {
    x: Math.max(0, Math.min(100, Number(box.x) || 0)),
    y: Math.max(0, Math.min(100, Number(box.y) || 0)),
    width: Math.max(0.1, Math.min(100, Number(box.width) || 5)),
    height: Math.max(0.1, Math.min(100, Number(box.height) || 5))
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

async function convertAnnotationsToComponents(annotations: TrainingAnnotation[], imageData: string): Promise<Component[]> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = imageData
  })
  
  const imageWidth = img.width
  const imageHeight = img.height
  
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return []
  
  canvas.width = imageWidth
  canvas.height = imageHeight
  ctx.drawImage(img, 0, 0)
  const fullImageData = ctx.getImageData(0, 0, imageWidth, imageHeight)
  
  const allComponents: Component[] = []
  
  for (const annotation of annotations) {
    const bbox = annotation.boundingBox
    
    const percentBox: BoundingBox = {
      x: (bbox.x / imageWidth) * 100,
      y: (bbox.y / imageHeight) * 100,
      width: (bbox.width / imageWidth) * 100,
      height: (bbox.height / imageHeight) * 100
    }
    
    allComponents.push({
      id: annotation.id,
      type: annotation.correctType,
      name: `${annotation.correctType.toUpperCase()}-${allComponents.filter(c => c.type === annotation.correctType).length + 1}`,
      boundingBox: percentBox,
      confidence: 100,
      connections: [],
      metadata: { userAnnotated: 'true', source: 'training' }
    })
    
    const templateData = ctx.getImageData(
      Math.floor(bbox.x),
      Math.floor(bbox.y),
      Math.floor(bbox.width),
      Math.floor(bbox.height)
    )
    
    const similarComponents = await findSimilarComponents(
      fullImageData,
      templateData,
      bbox,
      annotation.correctType,
      imageWidth,
      imageHeight
    )
    
    allComponents.push(...similarComponents)
  }
  
  return deduplicateComponents(allComponents)
}

async function findSimilarComponents(
  fullImage: ImageData,
  template: ImageData,
  originalBox: { x: number; y: number; width: number; height: number },
  componentType: ComponentType,
  imageWidth: number,
  imageHeight: number
): Promise<Component[]> {
  const similarComponents: Component[] = []
  const templateWidth = template.width
  const templateHeight = template.height
  const threshold = 0.97
  
  const stepSize = Math.max(15, Math.floor(templateWidth / 3))
  
  for (let y = 0; y < imageHeight - templateHeight; y += stepSize) {
    for (let x = 0; x < imageWidth - templateWidth; x += stepSize) {
      if (Math.abs(x - originalBox.x) < 15 && Math.abs(y - originalBox.y) < 15) {
        continue
      }
      
      const similarity = calculateTemplateSimilarity(
        fullImage.data,
        template.data,
        x,
        y,
        templateWidth,
        templateHeight,
        imageWidth
      )
      
      if (similarity > threshold) {
        const percentBox: BoundingBox = {
          x: (x / imageWidth) * 100,
          y: (y / imageHeight) * 100,
          width: (templateWidth / imageWidth) * 100,
          height: (templateHeight / imageHeight) * 100
        }
        
        const hasOverlap = similarComponents.some(existing => {
          const xOverlap = Math.abs(existing.boundingBox.x - percentBox.x) < 2
          const yOverlap = Math.abs(existing.boundingBox.y - percentBox.y) < 2
          return xOverlap && yOverlap
        })
        
        if (!hasOverlap && similarComponents.length < 20) {
          const confidence = Math.round(similarity * 100)
          
          similarComponents.push({
            id: `comp-similar-${Date.now()}-${Math.random()}`,
            type: componentType,
            name: `${componentType.toUpperCase()}-auto`,
            boundingBox: percentBox,
            confidence,
            connections: [],
            metadata: { 
              source: 'template-matching',
              similarity: similarity.toFixed(3),
              templateBased: 'true'
            }
          })
        }
      }
    }
  }
  
  return similarComponents.sort((a, b) => (b.confidence || 0) - (a.confidence || 0)).slice(0, 15)
}

function calculateTemplateSimilarity(
  fullImageData: Uint8ClampedArray,
  templateData: Uint8ClampedArray,
  startX: number,
  startY: number,
  templateWidth: number,
  templateHeight: number,
  imageWidth: number
): number {
  let matchScore = 0
  let totalPixels = 0
  
  for (let ty = 0; ty < templateHeight; ty += 2) {
    for (let tx = 0; tx < templateWidth; tx += 2) {
      const imageX = startX + tx
      const imageY = startY + ty
      
      if (imageX >= imageWidth || imageY * imageWidth + imageX >= fullImageData.length / 4) {
        continue
      }
      
      const imageIdx = (imageY * imageWidth + imageX) * 4
      const templateIdx = (ty * templateWidth + tx) * 4
      
      const imgR = fullImageData[imageIdx]
      const imgG = fullImageData[imageIdx + 1]
      const imgB = fullImageData[imageIdx + 2]
      
      const tmpR = templateData[templateIdx]
      const tmpG = templateData[templateIdx + 1]
      const tmpB = templateData[templateIdx + 2]
      
      const rDiff = Math.abs(imgR - tmpR)
      const gDiff = Math.abs(imgG - tmpG)
      const bDiff = Math.abs(imgB - tmpB)
      
      const avgDiff = (rDiff + gDiff + bDiff) / 3
      const pixelSimilarity = 1 - (avgDiff / 255)
      
      matchScore += pixelSimilarity
      totalPixels++
    }
  }
  
  return totalPixels > 0 ? matchScore / totalPixels : 0
}

function deduplicateComponents(components: Component[]): Component[] {
  const deduplicated: Component[] = []
  
  for (const comp of components) {
    const isDuplicate = deduplicated.some(existing => {
      const xOverlap = Math.abs(existing.boundingBox.x - comp.boundingBox.x) < 2
      const yOverlap = Math.abs(existing.boundingBox.y - comp.boundingBox.y) < 2
      const sameType = existing.type === comp.type
      
      const widthSimilar = Math.abs(existing.boundingBox.width - comp.boundingBox.width) < 1
      const heightSimilar = Math.abs(existing.boundingBox.height - comp.boundingBox.height) < 1
      
      return xOverlap && yOverlap && sameType && widthSimilar && heightSimilar
    })
    
    if (!isDuplicate) {
      deduplicated.push(comp)
    }
  }
  
  const sorted = deduplicated.sort((a, b) => {
    if (a.metadata?.userAnnotated === 'true' && b.metadata?.userAnnotated !== 'true') return -1
    if (a.metadata?.userAnnotated !== 'true' && b.metadata?.userAnnotated === 'true') return 1
    return (b.confidence || 0) - (a.confidence || 0)
  })
  
  const userAnnotatedCount = sorted.filter(c => c.metadata?.userAnnotated === 'true').length
  const typeCounters: Record<string, number> = {}
  
  return sorted.map(comp => {
    if (comp.metadata?.userAnnotated === 'true') {
      typeCounters[comp.type] = (typeCounters[comp.type] || 0) + 1
      return {
        ...comp,
        name: `${comp.type.toUpperCase()}-${typeCounters[comp.type]}`
      }
    }
    
    typeCounters[comp.type] = (typeCounters[comp.type] || 0) + 1
    return {
      ...comp,
      name: `${comp.type.toUpperCase()}-${typeCounters[comp.type]}`
    }
  })
}
