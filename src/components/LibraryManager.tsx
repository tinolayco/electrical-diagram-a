import { useState } from 'react'
import type { ComponentLibrary } from '@/lib/types'
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
import { Plus, TrashSimple, Books, PencilSimple, DownloadSimple, UploadSimple } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface LibraryManagerProps {
  libraries: ComponentLibrary[]
  activeLibraryId: string | null
  onLibraryChange: (libraryId: string) => void
  onLibraryCreate: (library: Omit<ComponentLibrary, 'id' | 'createdAt' | 'lastModified' | 'componentCount'>) => void
  onLibraryUpdate: (libraryId: string, updates: Partial<ComponentLibrary>) => void
  onLibraryDelete: (libraryId: string) => void
  onLibraryImport?: (library: ComponentLibrary) => void
}

export function LibraryManager({
  libraries,
  activeLibraryId,
  onLibraryChange,
  onLibraryCreate,
  onLibraryUpdate,
  onLibraryDelete,
  onLibraryImport,
}: LibraryManagerProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null)
  
  const [newLibraryName, setNewLibraryName] = useState('')
  const [newLibraryDescription, setNewLibraryDescription] = useState('')
  const [editLibraryName, setEditLibraryName] = useState('')
  const [editLibraryDescription, setEditLibraryDescription] = useState('')

  const activeLibrary = libraries.find(lib => lib.id === activeLibraryId)
  const selectedLibrary = libraries.find(lib => lib.id === selectedLibraryId)

  const handleCreateLibrary = () => {
    if (!newLibraryName.trim()) {
      toast.error('Le nom de la bibliothèque est requis')
      return
    }

    onLibraryCreate({
      name: newLibraryName.trim(),
      description: newLibraryDescription.trim(),
      isDefault: false,
      annotations: [],
    })

    setNewLibraryName('')
    setNewLibraryDescription('')
    setCreateDialogOpen(false)
    toast.success('Bibliothèque créée avec succès')
  }

  const handleEditLibrary = () => {
    if (!selectedLibraryId || !editLibraryName.trim()) {
      toast.error('Le nom de la bibliothèque est requis')
      return
    }

    onLibraryUpdate(selectedLibraryId, {
      name: editLibraryName.trim(),
      description: editLibraryDescription.trim(),
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

  const handleExportLibrary = (libraryId: string) => {
    const library = libraries.find(lib => lib.id === libraryId)
    if (!library) {
      toast.error('Bibliothèque introuvable')
      return
    }

    const exportData = {
      version: '1.0',
      exportedAt: Date.now(),
      library: library
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${library.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Bibliothèque exportée avec succès')
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
        
        if (!data.library || !data.version) {
          toast.error('Format de fichier invalide')
          return
        }

        const importedLibrary: ComponentLibrary = {
          ...data.library,
          id: `library-${Date.now()}`,
          createdAt: Date.now(),
          lastModified: Date.now(),
          isDefault: false
        }

        if (onLibraryImport) {
          onLibraryImport(importedLibrary)
        } else {
          onLibraryCreate(importedLibrary)
        }

        toast.success(`Bibliothèque "${importedLibrary.name}" importée avec succès`)
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
            <SelectValue placeholder="Sélectionner une bibliothèque" />
          </SelectTrigger>
          <SelectContent>
            {libraries.map(library => (
              <SelectItem key={library.id} value={library.id}>
                <div className="flex items-center gap-2">
                  <span>{library.name}</span>
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleExportLibrary(activeLibrary.id)}
            className="h-8 w-8"
            title="Exporter la bibliothèque active"
          >
            <DownloadSimple size={16} />
          </Button>
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
    </div>
  )
}
