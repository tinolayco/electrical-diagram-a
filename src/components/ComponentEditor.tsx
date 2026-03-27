import { useState } from 'react'
import type { Component } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getComponentLabel } from '@/lib/analysis'
import type { ComponentType } from '@/lib/types'

interface ComponentEditorProps {
  component: Component | null
  open: boolean
  onClose: () => void
  onSave: (component: Component) => void
}

const componentTypes: ComponentType[] = [
  'breaker',
  'transformer',
  'bus-bar',
  'switch',
  'fuse',
  'relay',
  'meter',
  'capacitor',
  'inductor',
  'generator',
  'motor',
  'load',
  'unknown'
]

export function ComponentEditor({ component, open, onClose, onSave }: ComponentEditorProps) {
  const [editedComponent, setEditedComponent] = useState<Component | null>(component)

  const handleSave = () => {
    if (editedComponent) {
      onSave(editedComponent)
      onClose()
    }
  }

  if (!component || !editedComponent) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Component</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Component Name</Label>
            <Input
              id="name"
              value={editedComponent.name}
              onChange={(e) =>
                setEditedComponent({ ...editedComponent, name: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Component Type</Label>
            <Select
              value={editedComponent.type}
              onValueChange={(value) =>
                setEditedComponent({ ...editedComponent, type: value as ComponentType })
              }
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {componentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getComponentLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="voltage">Voltage</Label>
              <Input
                id="voltage"
                value={editedComponent.voltage || ''}
                onChange={(e) =>
                  setEditedComponent({ ...editedComponent, voltage: e.target.value })
                }
                placeholder="480V"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                value={editedComponent.rating || ''}
                onChange={(e) =>
                  setEditedComponent({ ...editedComponent, rating: e.target.value })
                }
                placeholder="100A"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="manufacturer">Manufacturer</Label>
            <Input
              id="manufacturer"
              value={editedComponent.manufacturer || ''}
              onChange={(e) =>
                setEditedComponent({ ...editedComponent, manufacturer: e.target.value })
              }
              placeholder="e.g. Schneider Electric"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
