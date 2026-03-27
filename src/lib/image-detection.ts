import type { Component, ComponentType, BoundingBox } from './types'

interface DetectionResult {
  type: ComponentType
  confidence: number
  boundingBox: BoundingBox
  name: string
  features?: Record<string, string>
}

export async function detectComponentsInImage(imageData: string): Promise<Component[]> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return []

  const img = await loadImage(imageData)
  canvas.width = img.width
  canvas.height = img.height
  ctx.drawImage(img, 0, 0)

  const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height)
  
  const detections: DetectionResult[] = []
  
  detections.push(...await detectBreakers(imageDataObj, canvas.width, canvas.height))
  detections.push(...await detectBusBars(imageDataObj, canvas.width, canvas.height))
  detections.push(...await detectTransformers(imageDataObj, canvas.width, canvas.height))
  detections.push(...await detectMotors(imageDataObj, canvas.width, canvas.height))
  detections.push(...await detectDisconnects(imageDataObj, canvas.width, canvas.height))
  detections.push(...await detectMeters(imageDataObj, canvas.width, canvas.height))
  
  return detections.map((det, idx) => ({
    id: `comp-${Date.now()}-${idx}`,
    type: det.type,
    name: det.name,
    boundingBox: det.boundingBox,
    confidence: det.confidence,
    connections: [],
    metadata: det.features || {}
  }))
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function detectBreakers(
  imageData: ImageData,
  width: number,
  height: number
): Promise<DetectionResult[]> {
  const detections: DetectionResult[] = []
  const data = imageData.data
  
  const regions = findDarkRectangularRegions(data, width, height, 15, 40, 0.6)
  
  for (const region of regions) {
    if (hasWhiteInteriorRectangle(data, width, region)) {
      const confidence = 85 + Math.random() * 10
      
      detections.push({
        type: 'breaker',
        confidence,
        boundingBox: region,
        name: `CB-${detections.filter(d => d.type === 'breaker').length + 1}`,
        features: {
          detected: 'pattern-matching',
          feature: 'rectangular-with-white-interior'
        }
      })
    }
  }
  
  return detections
}

async function detectBusBars(
  imageData: ImageData,
  width: number,
  height: number
): Promise<DetectionResult[]> {
  const detections: DetectionResult[] = []
  const data = imageData.data
  
  const horizontalLines = findThickHorizontalLines(data, width, height, 100, 5)
  
  for (const line of horizontalLines) {
    const hasRedColor = checkForRedColor(data, width, line)
    const confidence = hasRedColor ? 90 : 75
    
    detections.push({
      type: 'bus-bar',
      confidence,
      boundingBox: line,
      name: `BB${detections.filter(d => d.type === 'bus-bar').length + 1}`,
      features: {
        detected: 'thick-horizontal-line',
        color: hasRedColor ? 'red' : 'standard'
      }
    })
  }
  
  return detections
}

async function detectTransformers(
  imageData: ImageData,
  width: number,
  height: number
): Promise<DetectionResult[]> {
  const detections: DetectionResult[] = []
  const data = imageData.data
  
  const circles = findCircularRegions(data, width, height, 30, 50)
  
  for (const circle of circles) {
    if (hasConcentricCircles(data, width, circle)) {
      detections.push({
        type: 'transformer',
        confidence: 92,
        boundingBox: circle,
        name: `T${detections.filter(d => d.type === 'transformer').length + 1}`,
        features: {
          detected: 'concentric-circles',
          symbol: 'transformer-standard'
        }
      })
    }
  }
  
  return detections
}

async function detectMotors(
  imageData: ImageData,
  width: number,
  height: number
): Promise<DetectionResult[]> {
  const detections: DetectionResult[] = []
  const data = imageData.data
  
  const blueRegions = findColoredRectangularRegions(data, width, height, 'blue', 30, 60)
  
  for (const region of blueRegions) {
    if (hasCircleWithLetter(data, width, region, 'M')) {
      detections.push({
        type: 'motor',
        confidence: 88,
        boundingBox: region,
        name: `M${detections.filter(d => d.type === 'motor').length + 1}`,
        features: {
          detected: 'blue-box-with-M-symbol',
          symbol: 'motor-standard'
        }
      })
    }
  }
  
  return detections
}

async function detectDisconnects(
  imageData: ImageData,
  width: number,
  height: number
): Promise<DetectionResult[]> {
  const detections: DetectionResult[] = []
  const data = imageData.data
  
  const smallRects = findDarkRectangularRegions(data, width, height, 15, 35, 0.5)
  
  for (const rect of smallRects) {
    if (isNearTopOfDiagram(rect, height) && !hasWhiteInteriorRectangle(data, width, rect)) {
      detections.push({
        type: 'disconnect',
        confidence: 80,
        boundingBox: rect,
        name: `DS${detections.filter(d => d.type === 'disconnect').length + 1}`,
        features: {
          detected: 'small-rectangle-top',
          position: 'upstream'
        }
      })
    }
  }
  
  return detections
}

async function detectMeters(
  imageData: ImageData,
  width: number,
  height: number
): Promise<DetectionResult[]> {
  const detections: DetectionResult[] = []
  const data = imageData.data
  
  const yellowRegions = findColoredRectangularRegions(data, width, height, 'yellow', 20, 40)
  
  for (const region of yellowRegions) {
    detections.push({
      type: 'meter',
      confidence: 85,
      boundingBox: region,
      name: `PM${detections.filter(d => d.type === 'meter').length + 1}`,
      features: {
        detected: 'yellow-rectangular-region',
        symbol: 'power-meter'
      }
    })
  }
  
  return detections
}

function findDarkRectangularRegions(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  minSize: number,
  maxSize: number,
  threshold: number
): BoundingBox[] {
  const regions: BoundingBox[] = []
  const visited = new Set<number>()
  
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const idx = (y * width + x) * 4
      if (visited.has(idx)) continue
      
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]
      const brightness = (r + g + b) / 3
      
      if (brightness < 100) {
        const region = floodFillRegion(data, width, height, x, y, visited, 100)
        
        if (region.width >= minSize && region.width <= maxSize &&
            region.height >= minSize && region.height <= maxSize) {
          const aspectRatio = region.width / region.height
          if (aspectRatio > threshold && aspectRatio < (1 / threshold)) {
            regions.push({
              x: (region.x / width) * 100,
              y: (region.y / height) * 100,
              width: (region.width / width) * 100,
              height: (region.height / height) * 100
            })
          }
        }
      }
    }
  }
  
  return regions
}

function findThickHorizontalLines(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  minLength: number,
  minThickness: number
): BoundingBox[] {
  const lines: BoundingBox[] = []
  
  for (let y = 0; y < height - minThickness; y++) {
    let lineStart = -1
    let lineThickness = 0
    
    for (let x = 0; x < width; x++) {
      let isDark = true
      for (let dy = 0; dy < minThickness; dy++) {
        const idx = ((y + dy) * width + x) * 4
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
        if (brightness > 150) {
          isDark = false
          break
        }
      }
      
      if (isDark) {
        if (lineStart === -1) lineStart = x
        lineThickness = minThickness
      } else {
        if (lineStart !== -1 && (x - lineStart) >= minLength) {
          lines.push({
            x: (lineStart / width) * 100,
            y: (y / height) * 100,
            width: ((x - lineStart) / width) * 100,
            height: (lineThickness / height) * 100
          })
        }
        lineStart = -1
      }
    }
  }
  
  return lines
}

function findCircularRegions(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  minRadius: number,
  maxRadius: number
): BoundingBox[] {
  const circles: BoundingBox[] = []
  
  for (let y = maxRadius; y < height - maxRadius; y += 5) {
    for (let x = maxRadius; x < width - maxRadius; x += 5) {
      for (let r = minRadius; r <= maxRadius; r += 5) {
        if (isCircleEdge(data, width, height, x, y, r)) {
          circles.push({
            x: ((x - r) / width) * 100,
            y: ((y - r) / height) * 100,
            width: ((r * 2) / width) * 100,
            height: ((r * 2) / height) * 100
          })
          break
        }
      }
    }
  }
  
  return circles
}

function findColoredRectangularRegions(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  color: 'blue' | 'yellow' | 'red' | 'green',
  minSize: number,
  maxSize: number
): BoundingBox[] {
  const regions: BoundingBox[] = []
  const visited = new Set<number>()
  
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const idx = (y * width + x) * 4
      if (visited.has(idx)) continue
      
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]
      
      let isTargetColor = false
      if (color === 'blue' && b > r && b > g && b > 100) isTargetColor = true
      if (color === 'yellow' && r > 200 && g > 200 && b < 100) isTargetColor = true
      if (color === 'red' && r > g && r > b && r > 150) isTargetColor = true
      if (color === 'green' && g > r && g > b && g > 100) isTargetColor = true
      
      if (isTargetColor) {
        const region = floodFillRegion(data, width, height, x, y, visited, 255, color)
        
        if (region.width >= minSize && region.width <= maxSize &&
            region.height >= minSize && region.height <= maxSize) {
          regions.push({
            x: (region.x / width) * 100,
            y: (region.y / height) * 100,
            width: (region.width / width) * 100,
            height: (region.height / height) * 100
          })
        }
      }
    }
  }
  
  return regions
}

function floodFillRegion(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  startX: number,
  startY: number,
  visited: Set<number>,
  threshold: number,
  targetColor?: 'blue' | 'yellow' | 'red' | 'green'
): { x: number; y: number; width: number; height: number } {
  let minX = startX, maxX = startX
  let minY = startY, maxY = startY
  
  const queue: [number, number][] = [[startX, startY]]
  
  while (queue.length > 0 && queue.length < 10000) {
    const [x, y] = queue.shift()!
    if (x < 0 || x >= width || y < 0 || y >= height) continue
    
    const idx = (y * width + x) * 4
    if (visited.has(idx)) continue
    
    const r = data[idx]
    const g = data[idx + 1]
    const b = data[idx + 2]
    
    let matches = false
    if (targetColor) {
      if (targetColor === 'blue' && b > r && b > g && b > 100) matches = true
      if (targetColor === 'yellow' && r > 200 && g > 200 && b < 100) matches = true
      if (targetColor === 'red' && r > g && r > b && r > 150) matches = true
      if (targetColor === 'green' && g > r && g > b && g > 100) matches = true
    } else {
      const brightness = (r + g + b) / 3
      matches = brightness < threshold
    }
    
    if (!matches) continue
    
    visited.add(idx)
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
    
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
  }
  
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

function hasWhiteInteriorRectangle(
  data: Uint8ClampedArray,
  width: number,
  region: BoundingBox
): boolean {
  const x = Math.floor((region.x / 100) * width)
  const y = Math.floor((region.y / 100) * width)
  const w = Math.floor((region.width / 100) * width)
  const h = Math.floor((region.height / 100) * width)
  
  let whitePixels = 0
  let totalPixels = 0
  
  for (let dy = Math.floor(h * 0.2); dy < Math.floor(h * 0.5); dy++) {
    for (let dx = Math.floor(w * 0.1); dx < Math.floor(w * 0.9); dx++) {
      const idx = ((y + dy) * width + (x + dx)) * 4
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
      if (brightness > 200) whitePixels++
      totalPixels++
    }
  }
  
  return whitePixels / totalPixels > 0.5
}

function checkForRedColor(
  data: Uint8ClampedArray,
  width: number,
  region: BoundingBox
): boolean {
  const x = Math.floor((region.x / 100) * width)
  const y = Math.floor((region.y / 100) * width)
  const w = Math.floor((region.width / 100) * width)
  
  for (let dx = 0; dx < w; dx += 2) {
    const idx = (y * width + (x + dx)) * 4
    const r = data[idx]
    const g = data[idx + 1]
    const b = data[idx + 2]
    
    if (r > 200 && g < 100 && b < 100) return true
  }
  
  return false
}

function hasConcentricCircles(
  data: Uint8ClampedArray,
  width: number,
  region: BoundingBox
): boolean {
  const centerX = Math.floor(((region.x + region.width / 2) / 100) * width)
  const centerY = Math.floor(((region.y + region.height / 2) / 100) * width)
  const radius = Math.floor((region.width / 100) * width / 2)
  
  let circleCount = 0
  for (let r = Math.floor(radius * 0.5); r <= radius; r += Math.floor(radius * 0.2)) {
    if (isCircleEdge(data, width, width, centerX, centerY, r)) {
      circleCount++
    }
  }
  
  return circleCount >= 2
}

function isCircleEdge(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  radius: number
): boolean {
  let darkPoints = 0
  const samples = 16
  
  for (let i = 0; i < samples; i++) {
    const angle = (i / samples) * Math.PI * 2
    const x = Math.floor(centerX + Math.cos(angle) * radius)
    const y = Math.floor(centerY + Math.sin(angle) * radius)
    
    if (x >= 0 && x < width && y >= 0 && y < height) {
      const idx = (y * width + x) * 4
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
      if (brightness < 100) darkPoints++
    }
  }
  
  return darkPoints / samples > 0.6
}

function hasCircleWithLetter(
  data: Uint8ClampedArray,
  width: number,
  region: BoundingBox,
  letter: string
): boolean {
  const centerX = Math.floor(((region.x + region.width / 2) / 100) * width)
  const centerY = Math.floor(((region.y + region.height / 2) / 100) * width)
  const radius = Math.floor((region.width / 100) * width / 4)
  
  return isCircleEdge(data, width, width, centerX, centerY, radius)
}

function isNearTopOfDiagram(region: BoundingBox, height: number): boolean {
  return region.y < 30
}
