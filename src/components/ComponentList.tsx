import type { Component } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getComponentColor, getComponentLabel } from '@/lib/analysis'
import { Cube, GraduationCap, Sparkle } from '@phosphor-icons/react'

interface ComponentListProps {
  components: Component[]
  selectedComponent: string | null
  onComponentSelect: (id: string) => void
}

export function ComponentList({
  components,
  selectedComponent,
  onComponentSelect
}: ComponentListProps) {
  if (components.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <Cube size={48} className="text-muted-foreground mb-3" weight="duotone" />
        <p className="text-sm text-muted-foreground">No components detected</p>
        <p className="text-xs text-muted-foreground mt-1">Upload and analyze a schematic</p>
      </div>
    )
  }

  const userAnnotated = components.filter(c => c.metadata?.userAnnotated === 'true')
  const autoDetected = components.filter(c => c.metadata?.userAnnotated !== 'true')

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {userAnnotated.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <GraduationCap size={16} weight="duotone" className="text-primary" />
              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Annotés ({userAnnotated.length})
              </h5>
            </div>
            <div className="space-y-2">
              {userAnnotated.map(comp => (
                <Card
                  key={comp.id}
                  className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                    selectedComponent === comp.id 
                      ? 'ring-2 ring-primary shadow-md' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => onComponentSelect(comp.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-3 h-3 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: getComponentColor(comp.type) }}
                        />
                        <h4 className="font-medium text-sm truncate">{comp.name}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {getComponentLabel(comp.type)}
                      </p>
                      {(comp.voltage || comp.rating) && (
                        <div className="flex gap-1 mt-2">
                          {comp.voltage && (
                            <Badge variant="outline" className="text-[10px] font-mono h-4 px-1.5">
                              {comp.voltage}
                            </Badge>
                          )}
                          {comp.rating && (
                            <Badge variant="outline" className="text-[10px] font-mono h-4 px-1.5">
                              {comp.rating}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="text-[10px] font-mono flex-shrink-0 h-5 px-1.5"
                    >
                      {comp.confidence}%
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {autoDetected.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <Sparkle size={16} weight="fill" className="text-accent" />
              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Détectés automatiquement ({autoDetected.length})
              </h5>
            </div>
            <div className="space-y-2">
              {autoDetected.map(comp => (
                <Card
                  key={comp.id}
                  className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                    selectedComponent === comp.id 
                      ? 'ring-2 ring-accent shadow-md' 
                      : 'hover:border-accent/50'
                  }`}
                  onClick={() => onComponentSelect(comp.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-3 h-3 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: getComponentColor(comp.type) }}
                        />
                        <h4 className="font-medium text-sm truncate">{comp.name}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {getComponentLabel(comp.type)}
                      </p>
                      {(comp.voltage || comp.rating) && (
                        <div className="flex gap-1 mt-2">
                          {comp.voltage && (
                            <Badge variant="outline" className="text-[10px] font-mono h-4 px-1.5">
                              {comp.voltage}
                            </Badge>
                          )}
                          {comp.rating && (
                            <Badge variant="outline" className="text-[10px] font-mono h-4 px-1.5">
                              {comp.rating}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-[10px] font-mono flex-shrink-0 h-5 px-1.5 bg-accent/10 text-accent border-accent/20"
                    >
                      {comp.confidence}%
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
