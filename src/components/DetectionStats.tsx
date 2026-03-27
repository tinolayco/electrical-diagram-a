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
    <Card className="p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Target size={16} className="text-primary" weight="duotone" />
        <h3 className="font-semibold text-sm">Detection Statistics</h3>
      </div>
      
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground">Total</span>
            <div className="font-mono text-lg font-bold">{components.length}</div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground">Avg. Conf.</span>
            <div className="font-mono text-lg font-bold">{avgConfidence}%</div>
          </div>
        </div>

        <Separator />

        <div className="space-y-1">
          <div className="text-[10px] font-medium text-muted-foreground mb-1">Distribution</div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <CheckCircle size={12} className="text-green-600" weight="fill" />
              <span className="text-muted-foreground">High</span>
            </div>
            <span className="font-mono text-[10px]">{highConfidence}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <CheckCircle size={12} className="text-yellow-600" weight="fill" />
              <span className="text-muted-foreground">Med</span>
            </div>
            <span className="font-mono text-[10px]">{mediumConfidence}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <CheckCircle size={12} className="text-orange-600" weight="fill" />
              <span className="text-muted-foreground">Low</span>
            </div>
            <span className="font-mono text-[10px]">{lowConfidence}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-1">
          <div className="text-[10px] font-medium text-muted-foreground mb-1">By Type</div>
          {Object.entries(componentsByType)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([type, count]) => (
              <div key={type} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0" 
                    style={{ backgroundColor: getComponentColor(type as any) }}
                  />
                  <span className="text-muted-foreground text-[10px] truncate">
                    {getComponentLabel(type as any)}
                  </span>
                </div>
                <span className="font-mono text-[10px] flex-shrink-0">{count}</span>
              </div>
            ))}
        </div>

        <Separator />

        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Cpu size={12} weight="duotone" />
          <span>CV + AI</span>
        </div>
      </div>
    </Card>
  )
}
