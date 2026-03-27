import { useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { UploadSimple } from '@phosphor-icons/react'

interface UploadDialogProps {
  open: boolean
  onClose: () => void
  onUpload: (imageData: string, fileName: string) => void
}

export function UploadDialog({ open, onClose, onUpload }: UploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        onUpload(result, file.name)
        onClose()
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Télécharger un schéma électrique</DialogTitle>
        </DialogHeader>
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <UploadSimple size={48} className="mx-auto mb-4 text-muted-foreground" weight="duotone" />
          <p className="text-sm font-medium mb-1">
            Déposez votre schéma ici ou cliquez pour parcourir
          </p>
          <p className="text-xs text-muted-foreground">
            Supporte PNG, JPG, SVG (max 10 Mo)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-xs text-muted-foreground">
          <p className="font-medium mb-1">Conseils pour de meilleurs résultats :</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Utilisez des images haute résolution (minimum 1000px de largeur)</li>
            <li>Assurez-vous que les étiquettes des composants sont clairement visibles</li>
            <li>Les schémas unifilaires fonctionnent le mieux</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
