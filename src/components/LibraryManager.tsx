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
import { Plus, TrashSimple, Books, PencilSimple } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface LibraryManagerProps {
  libraries: ComponentLibrary[]
  activeLibraryId: string | null
  onLibraryChange: (libraryId: string) => void
  onLibraryCreate: (library: Omit<ComponentLibrary, 'id' | 'createdAt' | 'lastModified' | 'componentCount'>) => void
  onLibraryUpdate: (libraryId: string, updates: Partial<ComponentLibrary>) => void
  onLibraryDelete: (libraryId: string) => void
}

export function LibraryManager({
  libraries,
  activeLibraryId,
  onLibraryChange,
  onLibraryCreate,
  onLibraryUpdate,
  onLibraryDelete,
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
        >
          <Plus size={16} />
        </Button>

        {activeLibrary && !activeLibrary.isDefault && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEditDialog(activeLibrary.id)}
              className="h-8 w-8"
            >
              <PencilSimple size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openDeleteDialog(activeLibrary.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
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
