import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Cube, 
  Lightning, 
  CheckCircle,
  Target,
  Cpu
} from '@phosphor-icons/react'
import type { Component } from '@/lib/types'
import { getComponentLabel, getComponentColor } from '@/lib/analysis'

interface DetectionStatsProps {
  components: Component[]
  isAnalyzing?: boolean
}

export function DetectionStats({ components, isAnalyzing }: DetectionStatsProps) {
  if (components.length === 0 && !isAnalyzing) {
    return null
  }

  const componentsByType = components.reduce((acc, comp) => {
    acc[comp.type] = (acc[comp.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const avgConfidence = components.length > 0
    ? Math.round(components.reduce((sum, c) => sum + c.confidence, 0) / components.length)
    : 0

  const highConfidence = components.filter(c => c.confidence >= 85).length
  const mediumConfidence = components.filter(c => c.confidence >= 70 && c.confidence < 85).length
  const lowConfidence = components.filter(c => c.confidence < 70).length

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Target size={20} className="text-primary" weight="duotone" />
        <h3 className="font-semibold">Detection Statistics</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Components</span>
          <Badge variant="secondary" className="font-mono">
            {components.length}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Avg. Confidence</span>
          <Badge 
            variant={avgConfidence >= 85 ? 'default' : avgConfidence >= 70 ? 'secondary' : 'outline'}
            className="font-mono"
          >
            {avgConfidence}%
          </Badge>
        </div>

        <Separator />

        <div className="space-y-1.5">
          <div className="text-xs font-medium text-muted-foreground mb-2">Confidence Distribution</div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-green-600" weight="fill" />
              <span className="text-muted-foreground">High (&ge;85%)</span>
            </div>
            <span className="font-mono text-xs">{highConfidence}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-yellow-600" weight="fill" />
              <span className="text-muted-foreground">Medium (70-84%)</span>
            </div>
            <span className="font-mono text-xs">{mediumConfidence}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-orange-600" weight="fill" />
              <span className="text-muted-foreground">Low (&lt;70%)</span>
            </div>
            <span className="font-mono text-xs">{lowConfidence}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-1.5">
          <div className="text-xs font-medium text-muted-foreground mb-2">By Component Type</div>
          {Object.entries(componentsByType)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([type, count]) => (
              <div key={type} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm" 
                    style={{ backgroundColor: getComponentColor(type as any) }}
                  />
                  <span className="text-muted-foreground text-xs">
                    {getComponentLabel(type as any)}
                  </span>
                </div>
                <span className="font-mono text-xs">{count}</span>
              </div>
            ))}
        </div>

        <Separator />

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Cpu size={14} weight="duotone" />
          <span>Computer Vision + AI Detection</span>
        </div>
      </div>
    </Card>
  )
}
