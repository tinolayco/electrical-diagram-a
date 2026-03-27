import { useState, useEffect, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import type { Component, Schematic, CatalogEntry, TrainingAnnotation } from '@/lib/types'
import { analyzeSchematic, identifyElectricalPaths } from '@/lib/analysis'
import { loadDemoSchematic } from '@/lib/demo-data'
import { isOpenCVReady, waitForOpenCV } from '@/lib/opencv-detection'
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
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  Sliders,
  TrashSimple
} from '@phosphor-icons/react'

function App() {
  const [schematics, setSchematics] = useKV<Schematic[]>('schematics', [])
  const [catalog, setCatalog] = useKV<CatalogEntry[]>('component-catalog', [])
  const [trainingAnnotations, setTrainingAnnotations] = useKV<TrainingAnnotation[]>('training-annotations', [])
  const [confidenceThreshold, setConfidenceThreshold] = useKV<number>('confidence-threshold', 85)
  const [currentSchematic, setCurrentSchematic] = useState<Schematic | null>(null)
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [highlightedPath, setHighlightedPath] = useState<string[] | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [helpDialogOpen, setHelpDialogOpen] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [trainingMode, setTrainingMode] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [resetType, setResetType] = useState<'all' | 'training' | 'schematics' | null>(null)
  const [opencvReady, setOpencvReady] = useState(false)

  useEffect(() => {
    waitForOpenCV(10000).then(ready => {
      setOpencvReady(ready)
      if (ready) {
        console.log('✅ OpenCV.js chargé et prêt pour la détection avancée')
      } else {
        console.warn('⚠️ OpenCV.js non disponible - utilisation de la détection basique')
      }
    })
  }, [])

  const filteredComponents = useMemo(() => {
    if (!currentSchematic) return []
    return currentSchematic.components.filter(comp => {
      if (comp.metadata?.userAnnotated === 'true') return true
      const threshold = confidenceThreshold !== undefined ? confidenceThreshold : 85
      if (!comp.confidence) return true
      return comp.confidence >= threshold
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
        confidenceThreshold !== undefined ? confidenceThreshold : 85,
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
      const currentThreshold = confidenceThreshold !== undefined ? confidenceThreshold : 85
      const filtered = components.filter(comp => {
        if (comp.metadata?.userAnnotated === 'true') return true
        return comp.confidence >= currentThreshold
      })
      const belowThreshold = components.length - filtered.length
      
      toast.success(
        `Détection terminée! ${components.length} composants trouvés (${userAnnotated} annotés + ${autoDetected} similaires détectés)\n` +
        `Affichés avec seuil ${currentThreshold}%: ${filtered.length} composants (${belowThreshold} masqués)\n` +
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

  const handleResetClick = (type: 'all' | 'training' | 'schematics') => {
    setResetType(type)
    setResetDialogOpen(true)
  }

  const handleResetConfirm = () => {
    if (!resetType) return

    switch (resetType) {
      case 'all':
        setSchematics([])
        setCatalog([])
        setTrainingAnnotations([])
        setConfidenceThreshold(85)
        setCurrentSchematic(null)
        setSelectedComponent(null)
        setHighlightedPath(null)
        toast.success('Toutes les données ont été réinitialisées')
        break
      case 'training':
        setTrainingAnnotations([])
        toast.success('Données d\'entraînement réinitialisées')
        break
      case 'schematics':
        setSchematics([])
        setCatalog([])
        setCurrentSchematic(null)
        setSelectedComponent(null)
        setHighlightedPath(null)
        toast.success('Schémas et catalogue réinitialisés')
        break
    }

    setResetDialogOpen(false)
    setResetType(null)
  }

  const selectedComponentData = filteredComponents.find(
    c => c.id === selectedComponent
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card flex-shrink-0">
        <div className="px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Cpu size={28} weight="duotone" className="text-primary flex-shrink-0" />
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  Analyseur de schémas électriques
                </h1>
                <p className="text-xs text-muted-foreground">
                  {opencvReady ? '✓ OpenCV.js activé - Détection avancée' : 'Reconnaissance de composants par IA'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setHelpDialogOpen(true)}
                className="text-muted-foreground hover:text-foreground h-8 w-8"
              >
                <Question size={18} weight="bold" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground h-8 w-8"
                  >
                    <TrashSimple size={18} weight="bold" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => handleResetClick('training')}>
                    <GraduationCap size={16} className="mr-2" />
                    Réinitialiser l'entraînement
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleResetClick('schematics')}>
                    <Cpu size={16} className="mr-2" />
                    Réinitialiser les schémas
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleResetClick('all')}
                    className="text-destructive focus:text-destructive"
                  >
                    <TrashSimple size={16} className="mr-2" weight="fill" />
                    Tout réinitialiser
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadDemo}
              >
                <Sparkle size={16} className="mr-1.5" weight="fill" />
                Exemple
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUploadDialogOpen(true)}
              >
                <UploadSimple size={16} className="mr-1.5" />
                Télécharger
              </Button>
              <Button
                size="sm"
                onClick={handleAnalyze}
                disabled={!currentSchematic || analyzing}
              >
                <Lightning size={16} className="mr-1.5" weight="fill" />
                {analyzing ? 'Analyse...' : 'Analyser'}
              </Button>
              {trainingAnnotations && trainingAnnotations.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTrainingMode(true)}
                >
                  <GraduationCap size={16} className="mr-1.5" weight="duotone" />
                  Entraîner ({trainingAnnotations.length})
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {analysisProgress > 0 && (
        <div className="px-4 lg:px-6">
          <Progress value={analysisProgress} className="h-1" />
        </div>
      )}

      <main className="px-4 lg:px-6 py-4 flex-1 flex flex-col min-h-0">
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
          <Tabs defaultValue="analysis" className="w-full flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between mb-3">
              <TabsList>
                <TabsTrigger value="analysis" className="gap-1.5 text-xs">
                  <Lightning size={14} />
                  Analyse
                </TabsTrigger>
                <TabsTrigger value="catalog" className="gap-1.5 text-xs">
                  <Cube size={14} />
                  Catalogue
                </TabsTrigger>
                <TabsTrigger value="paths" className="gap-1.5 text-xs">
                  <GitBranch size={14} />
                  Chemins
                </TabsTrigger>
              </TabsList>

              {currentSchematic && currentSchematic.components.length > 0 && (
                <Card className="px-3 py-1.5 flex items-center gap-3">
                  <Sliders size={14} className="text-muted-foreground" />
                  <div className="flex flex-col gap-0.5 min-w-[120px]">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-[10px] font-medium">Seuil</Label>
                      <span className="text-[10px] font-mono text-muted-foreground">{confidenceThreshold !== undefined ? confidenceThreshold : 85}%</span>
                    </div>
                    <Slider
                      value={[confidenceThreshold !== undefined ? confidenceThreshold : 85]}
                      onValueChange={(value) => setConfidenceThreshold(value[0])}
                      min={80}
                      max={99}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground border-l pl-2 font-mono">
                    {filteredComponents.length}/{currentSchematic.components.length}
                  </div>
                </Card>
              )}
            </div>

            <TabsContent value="analysis" className="flex-1 min-h-0 m-0">
              <div className="grid lg:grid-cols-[1fr_360px] gap-3 h-full">
                <Card className="overflow-hidden flex flex-col">
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

                <div className="flex flex-col gap-3 min-h-0">
                  {filteredComponents.length > 0 && (
                    <DetectionStats 
                      components={filteredComponents} 
                      isAnalyzing={analyzing}
                    />
                  )}
                  
                  <Card className="flex-1 flex flex-col overflow-hidden min-h-0">
                    <div className="p-3 border-b border-border flex items-center justify-between flex-shrink-0">
                      <h3 className="font-semibold text-sm">Composants</h3>
                      {selectedComponent && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditorOpen(true)}
                          className="h-7 text-xs"
                        >
                          <PencilSimple size={14} className="mr-1" />
                          Modifier
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

            <TabsContent value="catalog" className="flex-1 min-h-0 m-0">
              <Card className="p-4 h-full overflow-auto">
                <h3 className="text-base font-semibold mb-3">Catalogue de composants</h3>
                {!catalog || catalog.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Cube size={48} className="mx-auto mb-3" weight="duotone" />
                    <p className="text-sm">Aucun composant dans le catalogue</p>
                    <p className="text-xs mt-1">Analysez des schémas pour construire votre catalogue</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {catalog.map(entry => (
                      <Card key={entry.id} className="p-3">
                        <div className="font-medium text-xs mb-1">{entry.type}</div>
                        <div className="text-xl font-bold text-primary">{entry.count}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          instances détectées
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="paths" className="flex-1 min-h-0 m-0">
              <Card className="p-4 h-full overflow-auto">
                <h3 className="text-base font-semibold mb-3">Chemins électriques</h3>
                {currentSchematic.paths.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <GitBranch size={48} className="mx-auto mb-3" weight="duotone" />
                    <p className="text-sm">Aucun chemin électrique identifié</p>
                    <p className="text-xs mt-1">Analysez le schéma pour identifier les connexions</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentSchematic.paths.map(path => (
                      <Card
                        key={path.id}
                        className="p-3 cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => handlePathClick(path.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="font-medium text-sm mb-0.5">{path.description}</div>
                            <div className="text-xs text-muted-foreground">
                              {path.components.length} composants • {path.voltage}
                            </div>
                          </div>
                          <GitBranch size={18} className="text-muted-foreground flex-shrink-0" />
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

      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {resetType === 'all' && 'Réinitialiser toutes les données?'}
              {resetType === 'training' && 'Réinitialiser l\'entraînement?'}
              {resetType === 'schematics' && 'Réinitialiser les schémas?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {resetType === 'all' && 
                'Cette action supprimera tous les schémas, le catalogue de composants et les données d\'entraînement. Cette action est irréversible.'}
              {resetType === 'training' && 
                'Cette action supprimera toutes les annotations d\'entraînement. Vous devrez réentraîner le modèle pour détecter de nouveaux composants.'}
              {resetType === 'schematics' && 
                'Cette action supprimera tous les schémas et le catalogue de composants. Les données d\'entraînement seront conservées.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Réinitialiser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default App