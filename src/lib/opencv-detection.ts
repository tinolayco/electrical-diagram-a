import type { Component, ComponentType, BoundingBox } from './types'

declare global {
  interface Window {
    cv: any
  }
}

export function isOpenCVReady(): boolean {
  return typeof window !== 'undefined' && window.cv && window.cv.Mat
}

export async function waitForOpenCV(timeout = 10000): Promise<boolean> {
  if (isOpenCVReady()) return true
  
  const startTime = Date.now()
  
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if (isOpenCVReady()) {
        clearInterval(checkInterval)
        resolve(true)
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval)
        resolve(false)
      }
    }, 100)
  })
}

export async function detectComponentsWithOpenCV(
  imageData: string,
  template: ImageData,
  templateBoundingBox: { x: number; y: number; width: number; height: number },
  componentType: ComponentType,
  confidenceThreshold: number = 85,
  onComponentFound?: (component: Component) => void
): Promise<Component[]> {
  const ready = await waitForOpenCV()
  if (!ready) {
    console.warn('OpenCV not ready, falling back to basic detection')
    return []
  }

  const cv = window.cv
  const detectedComponents: Component[] = []

  const img = await loadImage(imageData)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)

  const src = cv.imread(canvas)
  
  const templateCanvas = document.createElement('canvas')
  templateCanvas.width = template.width
  templateCanvas.height = template.height
  const templateCtx = templateCanvas.getContext('2d')!
  templateCtx.putImageData(template, 0, 0)
  const templ = cv.imread(templateCanvas)

  const rotations = [0, 90, 180, 270]
  
  for (const angle of rotations) {
    try {
      const rotatedTemplate = rotateImageOpenCV(templ, angle)
      
      const matches = matchTemplateOpenCV(
        src,
        rotatedTemplate,
        confidenceThreshold / 100,
        img.width,
        img.height,
        templateBoundingBox
      )

      for (const match of matches) {
        const percentBox: BoundingBox = {
          x: (match.x / img.width) * 100,
          y: (match.y / img.height) * 100,
          width: (match.width / img.width) * 100,
          height: (match.height / img.height) * 100
        }

        const hasOverlap = detectedComponents.some(existing => {
          const xOverlap = Math.abs(existing.boundingBox.x - percentBox.x) < 2
          const yOverlap = Math.abs(existing.boundingBox.y - percentBox.y) < 2
          return xOverlap && yOverlap
        })

        if (!hasOverlap) {
          const newComponent: Component = {
            id: `comp-opencv-${Date.now()}-${Math.random()}`,
            type: componentType,
            name: `${componentType.toUpperCase()}-auto`,
            boundingBox: percentBox,
            confidence: Math.round(match.confidence * 100),
            connections: [],
            metadata: {
              source: 'opencv-template-matching',
              method: 'TM_CCOEFF_NORMED',
              rotation: `${angle}°`
            }
          }

          detectedComponents.push(newComponent)

          if (onComponentFound) {
            onComponentFound(newComponent)
          }
        }
      }

      rotatedTemplate.delete()
    } catch (error) {
      console.error(`Error processing rotation ${angle}:`, error)
    }
  }

  src.delete()
  templ.delete()

  return detectedComponents
    .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
    .slice(0, 20)
}

function rotateImageOpenCV(src: any, angle: number): any {
  if (angle === 0) {
    return src.clone()
  }

  const cv = window.cv
  const rotated = new cv.Mat()
  
  const center = new cv.Point(src.cols / 2, src.rows / 2)
  const rotationMatrix = cv.getRotationMatrix2D(center, -angle, 1.0)
  
  let newSize
  if (angle === 90 || angle === 270) {
    newSize = new cv.Size(src.rows, src.cols)
  } else {
    newSize = new cv.Size(src.cols, src.rows)
  }
  
  cv.warpAffine(src, rotated, rotationMatrix, newSize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar(255, 255, 255, 255))
  
  rotationMatrix.delete()
  
  return rotated
}

function matchTemplateOpenCV(
  src: any,
  templ: any,
  threshold: number,
  imageWidth: number,
  imageHeight: number,
  originalBox: { x: number; y: number; width: number; height: number }
): Array<{ x: number; y: number; width: number; height: number; confidence: number }> {
  const cv = window.cv
  const matches: Array<{ x: number; y: number; width: number; height: number; confidence: number }> = []

  const result = new cv.Mat()
  const mask = new cv.Mat()

  cv.matchTemplate(src, templ, result, cv.TM_CCOEFF_NORMED, mask)

  const minMaxLoc = cv.minMaxLoc(result)
  
  const data = result.data32F
  const cols = result.cols
  const rows = result.rows

  const nonMaxRadius = Math.max(templ.cols, templ.rows) / 2

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const value = data[i * cols + j]
      
      if (value >= threshold) {
        const distFromOriginal = Math.sqrt(
          Math.pow(j - originalBox.x, 2) + Math.pow(i - originalBox.y, 2)
        )
        
        if (distFromOriginal < 20) {
          continue
        }

        const tooClose = matches.some(existing => {
          const dist = Math.sqrt(
            Math.pow(existing.x - j, 2) + Math.pow(existing.y - i, 2)
          )
          return dist < nonMaxRadius
        })

        if (!tooClose && matches.length < 20) {
          matches.push({
            x: j,
            y: i,
            width: templ.cols,
            height: templ.rows,
            confidence: value
          })
        }
      }
    }
  }

  result.delete()
  mask.delete()

  return matches.sort((a, b) => b.confidence - a.confidence)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function preprocessImageForDetection(imageData: string): Promise<string> {
  const ready = await waitForOpenCV()
  if (!ready) return imageData

  const cv = window.cv
  
  try {
    const img = await loadImage(imageData)
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)

    const src = cv.imread(canvas)
    const processed = new cv.Mat()

    cv.cvtColor(src, processed, cv.COLOR_RGBA2GRAY)
    
    cv.GaussianBlur(processed, processed, new cv.Size(3, 3), 0)
    
    cv.adaptiveThreshold(
      processed,
      processed,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY,
      11,
      2
    )

    const outputCanvas = document.createElement('canvas')
    cv.imshow(outputCanvas, processed)

    const result = outputCanvas.toDataURL('image/png')

    src.delete()
    processed.delete()

    return result
  } catch (error) {
    console.error('Error preprocessing image:', error)
    return imageData
  }
}

export async function detectShapesWithOpenCV(imageData: string): Promise<Array<{
  type: 'rectangle' | 'circle' | 'line'
  boundingBox: { x: number; y: number; width: number; height: number }
  confidence: number
}>> {
  const ready = await waitForOpenCV()
  if (!ready) return []

  const cv = window.cv
  const shapes: Array<{
    type: 'rectangle' | 'circle' | 'line'
    boundingBox: { x: number; y: number; width: number; height: number }
    confidence: number
  }> = []

  try {
    const img = await loadImage(imageData)
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)

    const src = cv.imread(canvas)
    const gray = new cv.Mat()
    const edges = new cv.Mat()

    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY)
    cv.Canny(gray, edges, 50, 150, 3, false)

    const contours = new cv.MatVector()
    const hierarchy = new cv.Mat()
    cv.findContours(edges, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)

    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i)
      const area = cv.contourArea(contour)

      if (area > 100 && area < (img.width * img.height * 0.1)) {
        const rect = cv.boundingRect(contour)
        
        const aspectRatio = rect.width / rect.height
        
        if (aspectRatio > 0.8 && aspectRatio < 1.2 && area > 300) {
          shapes.push({
            type: 'circle',
            boundingBox: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height
            },
            confidence: 0.85
          })
        } else if (area > 200) {
          shapes.push({
            type: 'rectangle',
            boundingBox: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height
            },
            confidence: 0.80
          })
        }
      }

      contour.delete()
    }

    src.delete()
    gray.delete()
    edges.delete()
    contours.delete()
    hierarchy.delete()

    return shapes
  } catch (error) {
    console.error('Error detecting shapes:', error)
    return []
  }
}

export async function colorBreakerInterior(
  imageData: string,
  boundingBox: BoundingBox,
  color: 'green' | 'red'
): Promise<string> {
  const ready = await waitForOpenCV()
  if (!ready) {
    console.warn('OpenCV not ready, cannot color breaker')
    return imageData
  }

  const cv = window.cv

  try {
    const img = await loadImage(imageData)
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)

    const src = cv.imread(canvas)

    const x = Math.round((boundingBox.x / 100) * img.width)
    const y = Math.round((boundingBox.y / 100) * img.height)
    const width = Math.round((boundingBox.width / 100) * img.width)
    const height = Math.round((boundingBox.height / 100) * img.height)

    const rect = new cv.Rect(x, y, width, height)
    const roi = src.roi(rect)

    const gray = new cv.Mat()
    cv.cvtColor(roi, gray, cv.COLOR_RGBA2GRAY)

    const threshold = new cv.Mat()
    cv.threshold(gray, threshold, 200, 255, cv.THRESH_BINARY)

    const kernel = cv.Mat.ones(3, 3, cv.CV_8U)
    cv.erode(threshold, threshold, kernel, new cv.Point(-1, -1), 2)
    cv.dilate(threshold, threshold, kernel, new cv.Point(-1, -1), 2)

    const contours = new cv.MatVector()
    const hierarchy = new cv.Mat()
    cv.findContours(threshold, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    const colorValue = color === 'green' 
      ? new cv.Scalar(100, 200, 100, 180)
      : new cv.Scalar(200, 100, 100, 180)

    if (contours.size() > 0) {
      let largestContour = contours.get(0)
      let maxArea = cv.contourArea(largestContour)

      for (let i = 1; i < contours.size(); i++) {
        const contour = contours.get(i)
        const area = cv.contourArea(contour)
        if (area > maxArea) {
          maxArea = area
          largestContour = contour
        }
      }

      const mask = cv.Mat.zeros(roi.rows, roi.cols, cv.CV_8UC1)
      cv.drawContours(mask, contours, -1, new cv.Scalar(255), -1)

      const overlay = new cv.Mat(roi.rows, roi.cols, cv.CV_8UC4, colorValue)
      overlay.copyTo(roi, mask)

      mask.delete()
      overlay.delete()
    } else {
      const padding = 4
      const innerRect = new cv.Rect(
        padding,
        padding,
        Math.max(1, width - padding * 2),
        Math.max(1, height - padding * 2)
      )
      
      cv.rectangle(roi, innerRect.tl(), innerRect.br(), colorValue, -1)
    }

    for (let i = 0; i < contours.size(); i++) {
      contours.get(i).delete()
    }
    contours.delete()
    hierarchy.delete()
    gray.delete()
    threshold.delete()
    kernel.delete()
    roi.delete()

    const outputCanvas = document.createElement('canvas')
    outputCanvas.width = img.width
    outputCanvas.height = img.height
    cv.imshow(outputCanvas, src)

    const result = outputCanvas.toDataURL('image/png')

    src.delete()

    return result
  } catch (error) {
    console.error('Error coloring breaker interior:', error)
    return imageData
  }
}
