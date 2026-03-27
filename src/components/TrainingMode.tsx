import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Check, X, HandPointing, Sparkle } from '@phosphor-icons/react'
import type { TrainingAnnotation, ComponentType } from '@/lib/types'

interface TrainingModeProps {
  imageData: string
  onComplete: (annotations: TrainingAnnotation[]) => void
  onCancel: () => void
}

const COMPONENT_TYPES: { value: ComponentType; label: string }[] = [
  { value: 'breaker', label: 'Disjoncteur (CB)' },
  { value: 'bus-bar', label: 'Barre de bus' },
  { value: 'transformer', label: 'Transformateur' },
  { value: 'switch', label: 'Interrupteur' },
  { value: 'disconnect', label: 'Sectionneur' },
  { value: 'fuse', label: 'Fusible' },
  { value: 'relay', label: 'Relais' },
  { value: 'meter', label: 'Compteur' },
  { value: 'capacitor', label: 'Condensateur' },
  { value: 'inductor', label: 'Inducteur' },
  { value: 'generator', label: 'Générateur' },
  { value: 'motor', label: 'Moteur' },
  { value: 'load', label: 'Charge' },
]

export function TrainingMode({ imageData, onComplete, onCancel }: TrainingModeProps) {
  const [annotations, setAnnotations] = useState<TrainingAnnotation[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [selectedType, setSelectedType] = useState<ComponentType>('breaker')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const img = new Image()
    img.src = imageData
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height })
      if (canvasRef.current) {
        const canvas = canvasRef.current
        canvas.width = img.width
        canvas.height = img.height
        redrawCanvas(img)
      }
    }
  }, [imageData])

  const redrawCanvas = (img?: HTMLImageElement) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (!img) {
      img = new Image()
      img.src = imageData
    }

    if (img.complete) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)

      annotations.forEach((annotation, index) => {
        ctx.strokeStyle = '#10b981'
        ctx.lineWidth = 2
        ctx.strokeRect(
          annotation.boundingBox.x,
          annotation.boundingBox.y,
          annotation.boundingBox.width,
          annotation.boundingBox.height
        )

        ctx.fillStyle = '#10b981'
        ctx.font = '14px JetBrains Mono'
        const label = `${index + 1}: ${annotation.correctType}`
        ctx.fillText(label, annotation.boundingBox.x, annotation.boundingBox.y - 5)
      })

      if (currentBox) {
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.strokeRect(currentBox.x, currentBox.y, currentBox.width, currentBox.height)
        ctx.setLineDash([])
      }
    }
  }

  useEffect(() => {
    redrawCanvas()
  }, [annotations, currentBox])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    setIsDrawing(true)
    setStartPoint({ x, y })
    setCurrentBox({ x, y, width: 0, height: 0 })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const width = x - startPoint.x
    const height = y - startPoint.y

    setCurrentBox({
      x: width < 0 ? x : startPoint.x,
      y: height < 0 ? y : startPoint.y,
      width: Math.abs(width),
      height: Math.abs(height),
    })
  }

  const handleMouseUp = () => {
    if (!isDrawing || !currentBox || currentBox.width < 10 || currentBox.height < 10) {
      setIsDrawing(false)
      setStartPoint(null)
      setCurrentBox(null)
      return
    }

    const newAnnotation: TrainingAnnotation = {
      id: `annotation-${Date.now()}`,
      schematicId: 'current',
      boundingBox: currentBox,
      correctType: selectedType,
      userVerified: true,
      createdAt: Date.now(),
    }

    setAnnotations(prev => [...prev, newAnnotation])
    toast.success(`Annotation ajoutée: ${selectedType}`)

    setIsDrawing(false)
    setStartPoint(null)
    setCurrentBox(null)
  }

  const handleRemoveAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id))
    toast.info('Annotation supprimée')
  }

  const handleComplete = () => {
    if (annotations.length === 0) {
      toast.error('Ajoutez au moins une annotation avant de continuer')
      return
    }
    onComplete(annotations)
  }

  const progressPercent = Math.min((annotations.length / 5) * 100, 100)

  return (
    <div className="grid lg:grid-cols-[1fr_350px] gap-6 h-[calc(100vh-200px)]">
      <Card className="overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <HandPointing size={20} className="text-primary" weight="duotone" />
            <h3 className="font-semibold">Dessinez des boîtes autour des composants</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Cliquez et glissez pour dessiner une boîte autour de chaque composant
          </p>
        </div>
        
        <div ref={containerRef} className="flex-1 overflow-auto bg-muted/10">
          <div className="p-4 flex items-center justify-center min-h-full">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="max-w-full h-auto cursor-crosshair border-2 border-border rounded-lg shadow-lg"
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Type de composant</h3>
          <Select value={selectedType} onValueChange={(v) => setSelectedType(v as ComponentType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMPONENT_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Progression</h3>
            <Badge variant={annotations.length >= 5 ? 'default' : 'secondary'}>
              {annotations.length} / 5 minimum
            </Badge>
          </div>
          <Progress value={progressPercent} className="mb-2" />
          <p className="text-xs text-muted-foreground">
            Annotez au moins 5 composants pour un bon entraînement initial
          </p>
        </Card>

        <Card className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Annotations ({annotations.length})</h3>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {annotations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <HandPointing size={32} className="mx-auto mb-2 opacity-50" weight="duotone" />
                Aucune annotation
              </div>
            ) : (
              <div className="space-y-2">
                {annotations.map((annotation, index) => (
                  <div
                    key={annotation.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium font-mono text-sm">
                        #{index + 1}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {COMPONENT_TYPES.find(t => t.value === annotation.correctType)?.label}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveAnnotation(annotation.id)}
                    >
                      <X size={16} weight="bold" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            <X size={18} className="mr-2" />
            Annuler
          </Button>
          <Button
            onClick={handleComplete}
            disabled={annotations.length === 0}
            className="flex-1"
          >
            <Check size={18} className="mr-2" weight="bold" />
            Entraîner
          </Button>
        </div>
      </div>
    </div>
  )
}
