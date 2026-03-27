import { useState, useEffect, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import type { Component, Schematic, CatalogEntry, TrainingAnnotation } from '@/lib/types'
import { analyzeSchematic, identifyElectricalPaths } from '@/lib/analysis'
import { loadDemoSchematic } from '@/lib/demo-data'
import { DiagramViewer } from '@/components/DiagramViewer'
import { ComponentList } from '@/components/ComponentList'
import { ComponentEditor } from '@/components/ComponentEditor'
import { UploadDialog } from '@/components/UploadDialog'
import { HelpDialog } from '@/components/HelpDialog'
import { DetectionStats } from '@/components/DetectionStats'
import { TrainingMode } from '@/components/TrainingMode'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { 
  UploadSimple, 
  Lightning, 
  Cube, 
  GitBranch,
  PencilSimple,
  Cpu,
  Question,
  Sparkle,
  GraduationCap,
  Sliders
} from '@phosphor-icons/react'

function App() {
  const [schematics, setSchematics] = useKV<Schematic[]>('schematics', [])
  const [catalog, setCatalog] = useKV<CatalogEntry[]>('component-catalog', [])
  const [trainingAnnotations, setTrainingAnnotations] = useKV<TrainingAnnotation[]>('training-annotations', [])
  const [confidenceThreshold, setConfidenceThreshold] = useKV<number>('confidence-threshold', 97)
  const [currentSchematic, setCurrentSchematic] = useState<Schematic | null>(null)
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [highlightedPath, setHighlightedPath] = useState<string[] | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [helpDialogOpen, setHelpDialogOpen] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [trainingMode, setTrainingMode] = useState(false)

  const filteredComponents = useMemo(() => {
    if (!currentSchematic) return []
    return currentSchematic.components.filter(comp => {
      if (comp.metadata?.userAnnotated === 'true') return true
      return comp.confidence >= (confidenceThreshold || 97)
    })
  }, [currentSchematic, confidenceThreshold])

  useEffect(() => {
    if (schematics && schematics.length > 0 && !currentSchematic) {
      setCurrentSchematic(schematics[0])
    }
  }, [schematics, currentSchematic])

  const handleUpload = async (imageData: string, fileName: string) => {
    const newSchematic: Schematic = {
      id: `schematic-${Date.now()}`,
      name: fileName,
      imageData,
      uploadedAt: Date.now(),
      components: [],
      paths: []
    }
    
    setSchematics(current => [...(current || []), newSchematic])
    setCurrentSchematic(newSchematic)
    toast.success('Schematic uploaded successfully')
  }

  const handleAnalyze = async () => {
    if (!currentSchematic) return

    if (currentSchematic.components.length === 0 && (!trainingAnnotations || trainingAnnotations.length === 0)) {
      toast.info('Commençons par un entraînement supervisé')
      setTrainingMode(true)
      return
    }

    setAnalyzing(true)
    setAnalysisProgress(0)
    toast.info('Analyse en cours - les composants s\'afficheront dès qu\'ils sont détectés...', { duration: 3000 })

    const detectedComponents: Component[] = []

    try {
      setAnalysisProgress(30)
      const components = await analyzeSchematic(
        currentSchematic.imageData,
        trainingAnnotations && trainingAnnotations.length > 0 ? trainingAnnotations : undefined,
        confidenceThreshold || 97,
        (newComponent: Component) => {
          detectedComponents.push(newComponent)
          
          const updatedSchematic: Schematic = {
            ...currentSchematic,
            components: [...detectedComponents],
            paths: []
          }
          
          setCurrentSchematic(updatedSchematic)
        }
      )
      
      setAnalysisProgress(70)
      const paths = await identifyElectricalPaths(components)
      
      setAnalysisProgress(90)
      
      const updatedSchematic: Schematic = {
        ...currentSchematic,
        components,
        paths
      }
      
      setSchematics(current =>
        (current || []).map(s => s.id === currentSchematic.id ? updatedSchematic : s)
      )
      setCurrentSchematic(updatedSchematic)
      
      updateCatalog(components)
      
      setAnalysisProgress(100)
      
      const userAnnotated = components.filter(c => c.metadata?.userAnnotated === 'true').length
      const autoDetected = components.length - userAnnotated
      const filtered = components.filter(comp => {
        if (comp.metadata?.userAnnotated === 'true') return true
        return comp.confidence >= (confidenceThreshold || 97)
      })
      const belowThreshold = components.length - filtered.length
      
      toast.success(
        `Détection terminée! ${components.length} composants trouvés (${userAnnotated} annotés + ${autoDetected} similaires détectés)\n` +
        `Affichés avec seuil ${confidenceThreshold}%: ${filtered.length} composants (${belowThreshold} masqués)\n` +
        `${paths.length} chemins électriques identifiés`,
        { duration: 7000 }
      )
    } catch (error) {
      console.error('Analysis failed:', error)
      toast.error('Échec de l\'analyse. Veuillez réessayer.')
    } finally {
      setAnalyzing(false)
      setTimeout(() => setAnalysisProgress(0), 1000)
    }
  }

  const handleTrainingComplete = async (annotations: TrainingAnnotation[]) => {
    setTrainingAnnotations(currentAnnotations => [...(currentAnnotations || []), ...annotations])
    setTrainingMode(false)
    toast.success(`${annotations.length} annotations d'entraînement sauvegardées!`)
    setTimeout(() => {
      handleAnalyze()
    }, 500)
  }

  const updateCatalog = (components: Component[]) => {
    setCatalog(currentCatalog => {
      const catalogMap = new Map((currentCatalog || []).map(entry => [entry.type, entry]))
      
      components.forEach(comp => {
        const existing = catalogMap.get(comp.type)
        if (existing) {
          existing.count += 1
          existing.lastUpdated = Date.now()
        } else {
          catalogMap.set(comp.type, {
            id: `catalog-${comp.type}`,
            type: comp.type,
            count: 1,
            examples: [],
            lastUpdated: Date.now()
          })
        }
      })
      
      return Array.from(catalogMap.values())
    })
  }

  const handleComponentSave = (updatedComponent: Component) => {
    if (!currentSchematic) return

    const updatedComponents = currentSchematic.components.map(c =>
      c.id === updatedComponent.id ? updatedComponent : c
    )

    const updatedSchematic: Schematic = {
      ...currentSchematic,
      components: updatedComponents
    }

    setSchematics(current =>
      (current || []).map(s => s.id === currentSchematic.id ? updatedSchematic : s)
    )
    setCurrentSchematic(updatedSchematic)
    updateCatalog(updatedComponents)
    toast.success('Component updated')
  }

  const handlePathClick = (pathId: string) => {
    const path = currentSchematic?.paths.find(p => p.id === pathId)
    if (path) {
      setHighlightedPath(path.components)
      toast.info(`Highlighting path: ${path.description}`)
    }
  }

  const handleLoadDemo = async () => {
    try {
      toast.info('Chargement de l\'exemple...')
      const demoSchematic = await loadDemoSchematic()
      
      setSchematics(current => {
        const filtered = (current || []).filter(s => s.id !== 'demo-schematic-example')
        return [...filtered, demoSchematic]
      })
      setCurrentSchematic(demoSchematic)
      updateCatalog(demoSchematic.components)
      
      toast.success('Exemple chargé avec succès! Explorez les onglets pour voir l\'analyse complète.')
    } catch (error) {
      console.error('Failed to load demo:', error)
      toast.error('Échec du chargement de l\'exemple')
    }
  }

  const selectedComponentData = filteredComponents.find(
    c => c.id === selectedComponent
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cpu size={32} weight="duotone" className="text-primary" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Electrical Schematic Analyzer
                </h1>
                <p className="text-sm text-muted-foreground">
                  AI-powered component recognition and path analysis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {currentSchematic && currentSchematic.components.length > 0 && (
                <Card className="px-4 py-2 flex items-center gap-3">
                  <Sliders size={18} className="text-muted-foreground" />
                  <div className="flex flex-col gap-1 min-w-[140px]">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-xs font-medium">Seuil</Label>
                      <span className="text-xs font-mono text-muted-foreground">{confidenceThreshold}%</span>
                    </div>
                    <Slider
                      value={[confidenceThreshold || 97]}
                      onValueChange={(value) => setConfidenceThreshold(value[0])}
                      min={80}
                      max={99}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground border-l pl-3">
                    {filteredComponents.length}/{currentSchematic.components.length}
                  </div>
                </Card>
              )}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setHelpDialogOpen(true)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Question size={20} weight="bold" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLoadDemo}
                >
                  <Sparkle size={18} className="mr-2" weight="fill" />
                  Load Example
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setUploadDialogOpen(true)}
                >
                  <UploadSimple size={18} className="mr-2" />
                  Upload
                </Button>
                <Button
                  onClick={handleAnalyze}
                  disabled={!currentSchematic || analyzing}
                >
                  <Lightning size={18} className="mr-2" weight="fill" />
                  {analyzing ? 'Analyseencours...' : 'Analyser'}
                </Button>
                {trainingAnnotations && trainingAnnotations.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setTrainingMode(true)}
                  >
                    <GraduationCap size={18} className="mr-2" weight="duotone" />
                    Entraîner ({trainingAnnotations.length})
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {analysisProgress > 0 && (
        <div className="container mx-auto px-4 lg:px-6 py-2">
          <Progress value={analysisProgress} className="h-1" />
        </div>
      )}

      <main className="container mx-auto px-4 lg:px-6 py-6">
        {!currentSchematic ? (
          <Card className="p-12 text-center">
            <Cpu size={64} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Aucun schéma chargé</h2>
            <p className="text-muted-foreground mb-6">
              Téléchargez un schéma électrique unifilaire pour commencer
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setUploadDialogOpen(true)}>
                <UploadSimple size={18} className="mr-2" />
                Télécharger un schéma
              </Button>
              <Button variant="outline" onClick={handleLoadDemo}>
                <Sparkle size={18} className="mr-2" weight="fill" />
                Charger un exemple
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Essayez l'exemple pour voir comment fonctionne l'analyse IA
            </p>
          </Card>
        ) : trainingMode ? (
          <TrainingMode
            imageData={currentSchematic.imageData}
            onComplete={handleTrainingComplete}
            onCancel={() => setTrainingMode(false)}
          />
        ) : (
          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="analysis" className="gap-2">
                <Lightning size={16} />
                Analysis
              </TabsTrigger>
              <TabsTrigger value="catalog" className="gap-2">
                <Cube size={16} />
                Catalog
              </TabsTrigger>
              <TabsTrigger value="paths" className="gap-2">
                <GitBranch size={16} />
                Paths
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="mt-6">
              <div className="grid lg:grid-cols-[1fr_400px] gap-6 h-[calc(100vh-280px)]">
                <Card className="overflow-hidden">
                  <DiagramViewer
                    imageData={currentSchematic.imageData}
                    components={filteredComponents}
                    selectedComponent={selectedComponent}
                    highlightedPath={highlightedPath}
                    onComponentSelect={(id) => {
                      setSelectedComponent(id)
                      setHighlightedPath(null)
                    }}
                  />
                </Card>

                <div className="flex flex-col gap-4">
                  {filteredComponents.length > 0 && (
                    <DetectionStats 
                      components={filteredComponents} 
                      isAnalyzing={analyzing}
                    />
                  )}
                  
                  <Card className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <h3 className="font-semibold">Components</h3>
                      {selectedComponent && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditorOpen(true)}
                        >
                          <PencilSimple size={16} className="mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                    <ComponentList
                      components={filteredComponents}
                      selectedComponent={selectedComponent}
                      onComponentSelect={setSelectedComponent}
                    />
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="catalog" className="mt-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Component Catalog</h3>
                {!catalog || catalog.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Cube size={48} className="mx-auto mb-3" weight="duotone" />
                    <p>No components in catalog yet</p>
                    <p className="text-sm">Analyze schematics to build your catalog</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {catalog.map(entry => (
                      <Card key={entry.id} className="p-4">
                        <div className="font-medium text-sm mb-1">{entry.type}</div>
                        <div className="text-2xl font-bold text-primary">{entry.count}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          instances detected
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="paths" className="mt-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Electrical Paths</h3>
                {currentSchematic.paths.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <GitBranch size={48} className="mx-auto mb-3" weight="duotone" />
                    <p>No electrical paths identified yet</p>
                    <p className="text-sm">Analyze the schematic to identify connections</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentSchematic.paths.map(path => (
                      <Card
                        key={path.id}
                        className="p-4 cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => handlePathClick(path.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="font-medium mb-1">{path.description}</div>
                            <div className="text-sm text-muted-foreground">
                              {path.components.length} components • {path.voltage}
                            </div>
                          </div>
                          <GitBranch size={20} className="text-muted-foreground flex-shrink-0" />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>

      <UploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUpload={handleUpload}
      />

      <ComponentEditor
        component={selectedComponentData || null}
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleComponentSave}
      />

      <HelpDialog
        open={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
      />
    </div>
  )
}

export default App