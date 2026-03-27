import { useState } from 'react'
import type { ComponentLibrary, LibraryVersion } from '@/lib/types'
import {
  createLibraryExportData,
  validateImportData,
  incrementVersion,
  formatVersionHistory,
} from '@/lib/library-versioning'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, TrashSimple, Books, PencilSimple, DownloadSimple, UploadSimple, ClockCounterClockwise, Tag } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface LibraryManagerProps {
  libraries: ComponentLibrary[]
  activeLibraryId: string | null
  onLibraryChange: (libraryId: string) => void
  onLibraryCreate: (library: Omit<ComponentLibrary, 'id' | 'createdAt' | 'lastModified' | 'componentCount'>) => void
  onLibraryUpdate: (libraryId: string, updates: Partial<ComponentLibrary>) => void
  onLibraryDelete: (libraryId: string) => void
  onLibraryImport?: (library: ComponentLibrary) => void
  versionHistory?: Map<string, LibraryVersion[]>
  onVersionHistoryUpdate?: (libraryId: string, history: LibraryVersion[]) => void
}

export function LibraryManager({
  libraries,
  activeLibraryId,
  onLibraryChange,
  onLibraryCreate,
  onLibraryUpdate,
  onLibraryDelete,
  onLibraryImport,
  versionHistory,
  onVersionHistoryUpdate,
}: LibraryManagerProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [versionInfoDialogOpen, setVersionInfoDialogOpen] = useState(false)
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null)
  
  const [newLibraryName, setNewLibraryName] = useState('')
  const [newLibraryDescription, setNewLibraryDescription] = useState('')
  const [newLibraryAuthor, setNewLibraryAuthor] = useState('')
  const [newLibraryTags, setNewLibraryTags] = useState('')
  
  const [editLibraryName, setEditLibraryName] = useState('')
  const [editLibraryDescription, setEditLibraryDescription] = useState('')
  const [editLibraryAuthor, setEditLibraryAuthor] = useState('')
  const [editLibraryTags, setEditLibraryTags] = useState('')
  
  const [exportVersionType, setExportVersionType] = useState<'major' | 'minor' | 'patch'>('patch')
  const [exportChangelog, setExportChangelog] = useState('')
  const [exportAuthor, setExportAuthor] = useState('')

  const activeLibrary = libraries.find(lib => lib.id === activeLibraryId)
  const selectedLibrary = libraries.find(lib => lib.id === selectedLibraryId)

  const handleCreateLibrary = () => {
    if (!newLibraryName.trim()) {
      toast.error('Le nom de la bibliothèque est requis')
      return
    }

    const tags = newLibraryTags.trim() 
      ? newLibraryTags.split(',').map(t => t.trim()).filter(Boolean)
      : []

    onLibraryCreate({
      name: newLibraryName.trim(),
      description: newLibraryDescription.trim(),
      isDefault: false,
      annotations: [],
      version: '1.0.0',
      author: newLibraryAuthor.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    })

    setNewLibraryName('')
    setNewLibraryDescription('')
    setNewLibraryAuthor('')
    setNewLibraryTags('')
    setCreateDialogOpen(false)
    toast.success('Bibliothèque créée avec succès')
  }

  const handleEditLibrary = () => {
    if (!selectedLibraryId || !editLibraryName.trim()) {
      toast.error('Le nom de la bibliothèque est requis')
      return
    }

    const tags = editLibraryTags.trim() 
      ? editLibraryTags.split(',').map(t => t.trim()).filter(Boolean)
      : []

    onLibraryUpdate(selectedLibraryId, {
      name: editLibraryName.trim(),
      description: editLibraryDescription.trim(),
      author: editLibraryAuthor.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    })

    setEditDialogOpen(false)
    setSelectedLibraryId(null)
    toast.success('Bibliothèque modifiée avec succès')
  }

  const handleDeleteLibrary = () => {
    if (!selectedLibraryId) return

    const library = libraries.find(lib => lib.id === selectedLibraryId)
    if (library?.isDefault) {
      toast.error('Impossible de supprimer la bibliothèque par défaut')
      return
    }

    onLibraryDelete(selectedLibraryId)
    setDeleteDialogOpen(false)
    setSelectedLibraryId(null)
    toast.success('Bibliothèque supprimée avec succès')
  }

  const openEditDialog = (libraryId: string) => {
    const library = libraries.find(lib => lib.id === libraryId)
    if (!library) return

    if (library.isDefault) {
      toast.error('Impossible de modifier la bibliothèque par défaut')
      return
    }

    setSelectedLibraryId(libraryId)
    setEditLibraryName(library.name)
    setEditLibraryDescription(library.description || '')
    setEditLibraryAuthor(library.author || '')
    setEditLibraryTags(library.tags?.join(', ') || '')
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (libraryId: string) => {
    const library = libraries.find(lib => lib.id === libraryId)
    if (!library) return

    if (library.isDefault) {
      toast.error('Impossible de supprimer la bibliothèque par défaut')
      return
    }

    setSelectedLibraryId(libraryId)
    setDeleteDialogOpen(true)
  }

  const openExportDialog = (libraryId: string) => {
    const library = libraries.find(lib => lib.id === libraryId)
    if (!library) {
      toast.error('Bibliothèque introuvable')
      return
    }

    setSelectedLibraryId(libraryId)
    setExportDialogOpen(true)
  }

  const openVersionInfoDialog = (libraryId: string) => {
    setSelectedLibraryId(libraryId)
    setVersionInfoDialogOpen(true)
  }

  const handleExportLibrary = () => {
    if (!selectedLibraryId) return
    
    const library = libraries.find(lib => lib.id === selectedLibraryId)
    if (!library) {
      toast.error('Bibliothèque introuvable')
      return
    }

    try {
      const currentVersion = library.version || '1.0.0'
      const newVersion = incrementVersion(currentVersion, exportVersionType)
      
      const newVersionEntry: LibraryVersion = {
        version: newVersion,
        changelog: exportChangelog.trim() || 'Nouvelle version exportée',
        createdAt: Date.now(),
        createdBy: exportAuthor.trim() || undefined,
      }

      const existingHistory = versionHistory?.get(library.id) || []
      const updatedHistory = [...existingHistory, newVersionEntry]

      const exportData = createLibraryExportData(
        { ...library, version: newVersion },
        exportAuthor.trim() || undefined,
        updatedHistory
      )

      if (onVersionHistoryUpdate) {
        onVersionHistoryUpdate(library.id, updatedHistory)
      }

      onLibraryUpdate(library.id, { version: newVersion })

      const jsonString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const safeFileName = library.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      a.download = `bibliotheque_${safeFileName}_v${newVersion}_${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)

      setExportDialogOpen(false)
      setSelectedLibraryId(null)
      setExportChangelog('')
      setExportAuthor('')
      setExportVersionType('patch')
      
      toast.success(`Bibliothèque "${library.name}" exportée avec succès (v${newVersion})`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Erreur lors de l\'exportation de la bibliothèque')
    }
  }

  const handleImportLibrary = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const data = JSON.parse(text)
        
        const validation = validateImportData(data)
        
        if (!validation.valid || !validation.exportData) {
          toast.error(validation.error || 'Format de fichier invalide')
          return
        }

        const { library, versionHistory: importedHistory } = validation.exportData

        const importedLibrary: ComponentLibrary = {
          ...library,
          id: `library-${Date.now()}`,
          createdAt: Date.now(),
          lastModified: Date.now(),
          isDefault: false,
        }

        if (onLibraryImport) {
          onLibraryImport(importedLibrary)
        } else {
          onLibraryCreate(importedLibrary)
        }

        if (importedHistory && importedHistory.length > 0 && onVersionHistoryUpdate) {
          onVersionHistoryUpdate(importedLibrary.id, importedHistory)
        }

        const versionInfo = library.version ? ` (v${library.version})` : ''
        toast.success(`Bibliothèque "${importedLibrary.name}"${versionInfo} importée avec succès`)
      } catch (error) {
        console.error('Import error:', error)
        toast.error('Erreur lors de l\'importation de la bibliothèque')
      }
    }

    input.click()
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 min-w-[280px]">
        <Books size={16} className="text-muted-foreground flex-shrink-0" />
        <Select value={activeLibraryId || ''} onValueChange={onLibraryChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Sélectionner une bibliothèque">
              {activeLibrary && (
                <div className="flex items-center gap-1.5">
                  <span>{activeLibrary.name}</span>
                  {activeLibrary.version && (
                    <Badge variant="outline" className="text-[8px] px-1 py-0 font-mono">
                      v{activeLibrary.version}
                    </Badge>
                  )}
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {libraries.map(library => (
              <SelectItem key={library.id} value={library.id}>
                <div className="flex items-center gap-2">
                  <span>{library.name}</span>
                  {library.version && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono">
                      v{library.version}
                    </Badge>
                  )}
                  {library.isDefault && (
                    <Badge variant="secondary" className="text-[9px] px-1 py-0">
                      Défaut
                    </Badge>
                  )}
                  <span className="text-muted-foreground text-[10px]">
                    ({library.componentCount} annotations)
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCreateDialogOpen(true)}
          className="h-8 w-8"
          title="Créer une nouvelle bibliothèque"
        >
          <Plus size={16} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleImportLibrary}
          className="h-8 w-8"
          title="Importer une bibliothèque"
        >
          <UploadSimple size={16} />
        </Button>

        {activeLibrary && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openExportDialog(activeLibrary.id)}
              className="h-8 w-8"
              title="Exporter la bibliothèque active"
            >
              <DownloadSimple size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openVersionInfoDialog(activeLibrary.id)}
              className="h-8 w-8"
              title="Historique des versions"
            >
              <ClockCounterClockwise size={16} />
            </Button>
          </>
        )}

        {activeLibrary && !activeLibrary.isDefault && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEditDialog(activeLibrary.id)}
              className="h-8 w-8"
              title="Modifier la bibliothèque"
            >
              <PencilSimple size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openDeleteDialog(activeLibrary.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
              title="Supprimer la bibliothèque"
            >
              <TrashSimple size={16} />
            </Button>
          </>
        )}
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une nouvelle bibliothèque</DialogTitle>
            <DialogDescription>
              Créez une bibliothèque personnalisée pour entraîner le modèle avec vos propres composants.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="library-name">Nom de la bibliothèque *</Label>
              <Input
                id="library-name"
                placeholder="Ma bibliothèque personnalisée"
                value={newLibraryName}
                onChange={(e) => setNewLibraryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="library-description">Description</Label>
              <Textarea
                id="library-description"
                placeholder="Description de la bibliothèque..."
                value={newLibraryDescription}
                onChange={(e) => setNewLibraryDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="library-author">Auteur</Label>
              <Input
                id="library-author"
                placeholder="Votre nom ou organisation"
                value={newLibraryAuthor}
                onChange={(e) => setNewLibraryAuthor(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="library-tags">Tags (séparés par des virgules)</Label>
              <Input
                id="library-tags"
                placeholder="électrique, industriel, résidentiel..."
                value={newLibraryTags}
                onChange={(e) => setNewLibraryTags(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateLibrary}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la bibliothèque</DialogTitle>
            <DialogDescription>
              Modifiez le nom et la description de la bibliothèque.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-library-name">Nom de la bibliothèque *</Label>
              <Input
                id="edit-library-name"
                placeholder="Ma bibliothèque personnalisée"
                value={editLibraryName}
                onChange={(e) => setEditLibraryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-library-description">Description</Label>
              <Textarea
                id="edit-library-description"
                placeholder="Description de la bibliothèque..."
                value={editLibraryDescription}
                onChange={(e) => setEditLibraryDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-library-author">Auteur</Label>
              <Input
                id="edit-library-author"
                placeholder="Votre nom ou organisation"
                value={editLibraryAuthor}
                onChange={(e) => setEditLibraryAuthor(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-library-tags">Tags (séparés par des virgules)</Label>
              <Input
                id="edit-library-tags"
                placeholder="électrique, industriel, résidentiel..."
                value={editLibraryTags}
                onChange={(e) => setEditLibraryTags(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditLibrary}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la bibliothèque</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la bibliothèque "{selectedLibrary?.name}" ?
              Cette action est irréversible et supprimera toutes les annotations d'entraînement associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLibrary}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exporter la bibliothèque</DialogTitle>
            <DialogDescription>
              Configurez les informations de version pour l'export de "{selectedLibrary?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Card className="p-3 bg-muted/50">
              <div className="flex items-center gap-2 text-sm">
                <Tag size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">Version actuelle:</span>
                <span className="font-mono font-semibold">{selectedLibrary?.version || '1.0.0'}</span>
              </div>
            </Card>
            
            <div className="space-y-2">
              <Label htmlFor="version-type">Type de version *</Label>
              <Select value={exportVersionType} onValueChange={(value: 'major' | 'minor' | 'patch') => setExportVersionType(value)}>
                <SelectTrigger id="version-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patch">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Patch (correction de bogues)</span>
                      <span className="text-xs text-muted-foreground">
                        {selectedLibrary?.version || '1.0.0'} → {incrementVersion(selectedLibrary?.version || '1.0.0', 'patch')}
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="minor">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Minor (nouvelles fonctionnalités)</span>
                      <span className="text-xs text-muted-foreground">
                        {selectedLibrary?.version || '1.0.0'} → {incrementVersion(selectedLibrary?.version || '1.0.0', 'minor')}
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="major">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Major (changements importants)</span>
                      <span className="text-xs text-muted-foreground">
                        {selectedLibrary?.version || '1.0.0'} → {incrementVersion(selectedLibrary?.version || '1.0.0', 'major')}
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="export-changelog">Notes de version *</Label>
              <Textarea
                id="export-changelog"
                placeholder="Décrivez les modifications de cette version..."
                value={exportChangelog}
                onChange={(e) => setExportChangelog(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="export-author">Auteur</Label>
              <Input
                id="export-author"
                placeholder="Votre nom"
                value={exportAuthor}
                onChange={(e) => setExportAuthor(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleExportLibrary}>
              <DownloadSimple size={16} className="mr-2" />
              Exporter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={versionInfoDialogOpen} onOpenChange={setVersionInfoDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Historique des versions</DialogTitle>
            <DialogDescription>
              Versions exportées de "{selectedLibrary?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ScrollArea className="h-[400px] pr-4">
              {selectedLibraryId && versionHistory?.get(selectedLibraryId) && versionHistory.get(selectedLibraryId)!.length > 0 ? (
                <div className="space-y-3">
                  {versionHistory.get(selectedLibraryId)!
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .map((version, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="font-mono">
                                v{version.version}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(version.createdAt).toLocaleDateString('fr-FR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-sm">{version.changelog}</p>
                            {version.createdBy && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Par: {version.createdBy}
                              </p>
                            )}
                          </div>
                          <ClockCounterClockwise size={18} className="text-muted-foreground flex-shrink-0" />
                        </div>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <ClockCounterClockwise size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Aucune version exportée</p>
                  <p className="text-xs mt-1">L'historique sera créé lors de votre premier export</p>
                </div>
              )}
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVersionInfoDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
