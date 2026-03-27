import { useState, useRef, useEffect } from 'react'
import type { Component } from '@/lib/types'
import { getComponentColor } from '@/lib/analysis'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MagnifyingGlassMinus, MagnifyingGlassPlus } from '@phosphor-icons/react'

interface DiagramViewerProps {
  imageData: string
  components: Component[]
  selectedComponent: string | null
  highlightedPath: string[] | null
  onComponentSelect: (id: string) => void
}

export function DiagramViewer({
  imageData,
  components,
  selectedComponent,
  highlightedPath,
  onComponentSelect
}: DiagramViewerProps) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height })
    }
    img.src = imageData
  }, [imageData])

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && e.target instanceof Element && !e.target.closest('[data-component]')) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const zoomIn = () => setZoom(prev => Math.min(3, prev * 1.2))
  const zoomOut = () => setZoom(prev => Math.max(0.5, prev / 1.2))
  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  if (!imageData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed border-border">
        <p className="text-muted-foreground text-sm">No schematic loaded</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-muted/30 rounded-lg overflow-hidden">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button size="sm" variant="secondary" onClick={zoomOut}>
          <MagnifyingGlassMinus size={16} />
        </Button>
        <Button size="sm" variant="secondary" onClick={resetView}>
          <span className="font-mono text-xs">{Math.round(zoom * 100)}%</span>
        </Button>
        <Button size="sm" variant="secondary" onClick={zoomIn}>
          <MagnifyingGlassPlus size={16} />
        </Button>
      </div>

      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            width: 'fit-content',
            margin: 'auto',
            paddingTop: '2rem'
          }}
        >
          <img
            src={imageData}
            alt="Electrical schematic"
            className="max-w-full h-auto pointer-events-none select-none"
            draggable={false}
          />

          <svg
            className="absolute inset-0 pointer-events-none"
            style={{
              width: '100%',
              height: '100%'
            }}
          >
            {components.map(comp => {
              const isSelected = comp.id === selectedComponent
              const isInPath = highlightedPath?.includes(comp.id)
              const color = getComponentColor(comp.type)

              const scaleX = imageDimensions.width / 100
              const scaleY = imageDimensions.height / 100

              const x = comp.boundingBox.x * scaleX
              const y = comp.boundingBox.y * scaleY
              const width = comp.boundingBox.width * scaleX
              const height = comp.boundingBox.height * scaleY

              return (
                <g key={comp.id}>
                  <rect
                    data-component={comp.id}
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={isSelected || isInPath ? color : 'none'}
                    fillOpacity={isSelected ? 0.25 : isInPath ? 0.15 : 0}
                    stroke={color}
                    strokeWidth={isSelected ? 3 : isInPath ? 2 : 1.5}
                    strokeDasharray={isInPath && !isSelected ? '5,5' : 'none'}
                    className="cursor-pointer pointer-events-auto transition-all hover:stroke-[3] hover:fill-opacity-20"
                    onClick={(e) => {
                      e.stopPropagation()
                      onComponentSelect(comp.id)
                    }}
                    rx={4}
                  />
                  {(isSelected || isInPath) && (
                    <text
                      x={x + width / 2}
                      y={y - 8}
                      textAnchor="middle"
                      className="text-xs font-mono font-medium pointer-events-none"
                      fill={color}
                    >
                      {comp.name}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {components.length > 0 && (
        <div className="absolute bottom-4 left-4">
          <Badge variant="secondary" className="font-mono text-xs">
            {components.length} components detected
          </Badge>
        </div>
      )}
    </div>
  )
}
