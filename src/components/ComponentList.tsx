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
        <p className="text-sm text-muted-foreground">Aucun composant détecté</p>
        <p className="text-xs text-muted-foreground mt-1">Téléversez et analysez un schéma</p>
      </div>
    )
  }

  const userAnnotated = components.filter(c => c.metadata?.userAnnotated === 'true')
  const autoDetected = components.filter(c => c.metadata?.userAnnotated !== 'true')

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-3">
        {userAnnotated.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
              <GraduationCap size={14} weight="duotone" className="text-primary" />
              <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Annotés ({userAnnotated.length})
              </h5>
            </div>
            <div className="space-y-1.5">
              {userAnnotated.map(comp => (
                <Card
                  key={comp.id}
                  className={`p-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedComponent === comp.id 
                      ? 'ring-2 ring-primary shadow-md' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => onComponentSelect(comp.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div
                          className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: getComponentColor(comp.type) }}
                        />
                        <h4 className="font-medium text-xs truncate">{comp.name}</h4>
                        {comp.type === 'breaker' && comp.breakerState && (
                          <Badge 
                            variant="secondary"
                            className={`text-[7px] h-3 px-1 ${
                              comp.breakerState === 'closed' 
                                ? 'bg-green-500/20 text-green-700 border-green-500/30' 
                                : 'bg-red-500/20 text-red-700 border-red-500/30'
                            }`}
                          >
                            {comp.breakerState === 'closed' ? 'FERMÉ' : 'OUVERT'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {getComponentLabel(comp.type)}
                      </p>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="text-[8px] font-mono flex-shrink-0 h-3 px-1"
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
            <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
              <Sparkle size={14} weight="fill" className="text-accent" />
              <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Détectés auto ({autoDetected.length})
              </h5>
            </div>
            <div className="space-y-1.5">
              {autoDetected.map(comp => (
                <Card
                  key={comp.id}
                  className={`p-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedComponent === comp.id 
                      ? 'ring-2 ring-accent shadow-md' 
                      : 'hover:border-accent/50'
                  }`}
                  onClick={() => onComponentSelect(comp.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div
                          className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: getComponentColor(comp.type) }}
                        />
                        <h4 className="font-medium text-xs truncate">{comp.name}</h4>
                        {comp.type === 'breaker' && comp.breakerState && (
                          <Badge 
                            variant="secondary"
                            className={`text-[7px] h-3 px-1 ${
                              comp.breakerState === 'closed' 
                                ? 'bg-green-500/20 text-green-700 border-green-500/30' 
                                : 'bg-red-500/20 text-red-700 border-red-500/30'
                            }`}
                          >
                            {comp.breakerState === 'closed' ? 'FERMÉ' : 'OUVERT'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {getComponentLabel(comp.type)}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-[8px] font-mono flex-shrink-0 h-3 px-1 bg-accent/10 text-accent border-accent/20"
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
