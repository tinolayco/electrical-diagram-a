import type { ComponentLibrary, Schematic, Component, TrainingAnnotation, ComponentType } from './types'

export function exportLibraryToCSV(library: ComponentLibrary): string {
  const lines: string[] = []
  
  lines.push('Bibliothèque,Version,Description,Auteur,Étiquettes,Date de création,Dernière modification,Nombre de composants')
  lines.push([
    escapeCSV(library.name),
    escapeCSV(library.version || '1.0.0'),
    escapeCSV(library.description || ''),
    escapeCSV(library.author || ''),
    escapeCSV(library.tags?.join(';') || ''),
    new Date(library.createdAt).toLocaleString('fr-FR'),
    new Date(library.lastModified).toLocaleString('fr-FR'),
    library.componentCount.toString()
  ].join(','))
  
  lines.push('')
  lines.push('ID,Type,Position X,Position Y,Largeur,Hauteur,Angle,Image Data (tronqué)')
  
  library.annotations.forEach((annotation: TrainingAnnotation) => {
    lines.push([
      escapeCSV(annotation.id),
      escapeCSV(annotation.correctType),
      annotation.boundingBox.x.toString(),
      annotation.boundingBox.y.toString(),
      annotation.boundingBox.width.toString(),
      annotation.boundingBox.height.toString(),
      '0',
      escapeCSV(annotation.schematicId.substring(0, 50))
    ].join(','))
  })
  
  return lines.join('\n')
}

export function exportLibraryToXML(library: ComponentLibrary): string {
  const xml: string[] = []
  
  xml.push('<?xml version="1.0" encoding="UTF-8"?>')
  xml.push('<bibliotheque>')
  xml.push(`  <informations>`)
  xml.push(`    <nom>${escapeXML(library.name)}</nom>`)
  xml.push(`    <version>${escapeXML(library.version || '1.0.0')}</version>`)
  xml.push(`    <description>${escapeXML(library.description || '')}</description>`)
  if (library.author) {
    xml.push(`    <auteur>${escapeXML(library.author)}</auteur>`)
  }
  if (library.tags && library.tags.length > 0) {
    xml.push(`    <etiquettes>`)
    library.tags.forEach(tag => {
      xml.push(`      <etiquette>${escapeXML(tag)}</etiquette>`)
    })
    xml.push(`    </etiquettes>`)
  }
  xml.push(`    <dateCreation>${new Date(library.createdAt).toISOString()}</dateCreation>`)
  xml.push(`    <derniereModification>${new Date(library.lastModified).toISOString()}</derniereModification>`)
  xml.push(`    <nombreComposants>${library.componentCount}</nombreComposants>`)
  xml.push(`    <parDefaut>${library.isDefault ? 'true' : 'false'}</parDefaut>`)
  xml.push(`  </informations>`)
  
  xml.push(`  <annotations>`)
  library.annotations.forEach((annotation: TrainingAnnotation) => {
    xml.push(`    <annotation>`)
    xml.push(`      <id>${escapeXML(annotation.id)}</id>`)
    xml.push(`      <type>${escapeXML(annotation.correctType)}</type>`)
    xml.push(`      <limites>`)
    xml.push(`        <x>${annotation.boundingBox.x}</x>`)
    xml.push(`        <y>${annotation.boundingBox.y}</y>`)
    xml.push(`        <largeur>${annotation.boundingBox.width}</largeur>`)
    xml.push(`        <hauteur>${annotation.boundingBox.height}</hauteur>`)
    xml.push(`      </limites>`)
    xml.push(`      <schematicId>${escapeXML(annotation.schematicId)}</schematicId>`)
    xml.push(`      <verifie>${annotation.userVerified ? 'true' : 'false'}</verifie>`)
    xml.push(`    </annotation>`)
  })
  xml.push(`  </annotations>`)
  
  xml.push('</bibliotheque>')
  
  return xml.join('\n')
}

export function exportSchematicToCSV(schematic: Schematic): string {
  const lines: string[] = []
  
  lines.push('Schéma,Date de téléversement,Nombre de composants,Nombre de chemins')
  lines.push([
    escapeCSV(schematic.name),
    new Date(schematic.uploadedAt).toLocaleString('fr-FR'),
    schematic.components.length.toString(),
    schematic.paths.length.toString()
  ].join(','))
  
  lines.push('')
  lines.push('ID,Type,Position X,Position Y,Largeur,Hauteur,Confiance,Annoté par utilisateur,Connexions')
  
  schematic.components.forEach((component: Component) => {
    lines.push([
      escapeCSV(component.id),
      escapeCSV(component.type),
      component.boundingBox.x.toString(),
      component.boundingBox.y.toString(),
      component.boundingBox.width.toString(),
      component.boundingBox.height.toString(),
      component.confidence?.toString() || '',
      component.metadata?.userAnnotated === 'true' ? 'Oui' : 'Non',
      escapeCSV(component.connections?.join(';') || '')
    ].join(','))
  })
  
  if (schematic.paths.length > 0) {
    lines.push('')
    lines.push('ID Chemin,Description,Tension,Nombre de composants,Composants')
    
    schematic.paths.forEach(path => {
      lines.push([
        escapeCSV(path.id),
        escapeCSV(path.description),
        escapeCSV(path.voltage || ''),
        path.components.length.toString(),
        escapeCSV(path.components.join(';'))
      ].join(','))
    })
  }
  
  return lines.join('\n')
}

export function exportSchematicToXML(schematic: Schematic): string {
  const xml: string[] = []
  
  xml.push('<?xml version="1.0" encoding="UTF-8"?>')
  xml.push('<schema>')
  xml.push(`  <informations>`)
  xml.push(`    <nom>${escapeXML(schematic.name)}</nom>`)
  xml.push(`    <id>${escapeXML(schematic.id)}</id>`)
  xml.push(`    <dateTeleversement>${new Date(schematic.uploadedAt).toISOString()}</dateTeleversement>`)
  xml.push(`    <nombreComposants>${schematic.components.length}</nombreComposants>`)
  xml.push(`    <nombreChemins>${schematic.paths.length}</nombreChemins>`)
  xml.push(`  </informations>`)
  
  xml.push(`  <composants>`)
  schematic.components.forEach((component: Component) => {
    xml.push(`    <composant>`)
    xml.push(`      <id>${escapeXML(component.id)}</id>`)
    xml.push(`      <type>${escapeXML(component.type)}</type>`)
    xml.push(`      <limites>`)
    xml.push(`        <x>${component.boundingBox.x}</x>`)
    xml.push(`        <y>${component.boundingBox.y}</y>`)
    xml.push(`        <largeur>${component.boundingBox.width}</largeur>`)
    xml.push(`        <hauteur>${component.boundingBox.height}</hauteur>`)
    xml.push(`      </limites>`)
    if (component.confidence !== undefined) {
      xml.push(`      <confiance>${component.confidence}</confiance>`)
    }
    if (component.metadata?.userAnnotated) {
      xml.push(`      <annotePar>utilisateur</annotePar>`)
    }
    if (component.connections && component.connections.length > 0) {
      xml.push(`      <connexions>`)
      component.connections.forEach(conn => {
        xml.push(`        <connexion>${escapeXML(conn)}</connexion>`)
      })
      xml.push(`      </connexions>`)
    }
    xml.push(`    </composant>`)
  })
  xml.push(`  </composants>`)
  
  if (schematic.paths.length > 0) {
    xml.push(`  <chemins>`)
    schematic.paths.forEach(path => {
      xml.push(`    <chemin>`)
      xml.push(`      <id>${escapeXML(path.id)}</id>`)
      xml.push(`      <description>${escapeXML(path.description)}</description>`)
      if (path.voltage) {
        xml.push(`      <tension>${escapeXML(path.voltage)}</tension>`)
      }
      xml.push(`      <composants>`)
      path.components.forEach(compId => {
        xml.push(`        <composant>${escapeXML(compId)}</composant>`)
      })
      xml.push(`      </composants>`)
      xml.push(`    </chemin>`)
    })
    xml.push(`  </chemins>`)
  }
  
  xml.push('</schema>')
  
  return xml.join('\n')
}

function escapeCSV(value: string): string {
  const stringValue = String(value)
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

function escapeXML(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function importLibraryFromCSV(csvContent: string): ComponentLibrary | null {
  try {
    const lines = csvContent.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      throw new Error('Fichier CSV invalide: trop peu de lignes')
    }
    
    const headerLine = lines[1]
    const headerValues = parseCSVLine(headerLine)
    
    if (headerValues.length < 8) {
      throw new Error('Fichier CSV invalide: en-tête incomplet')
    }
    
    const name = headerValues[0]
    const version = headerValues[1] || '1.0.0'
    const description = headerValues[2]
    const author = headerValues[3]
    const tagsString = headerValues[4]
    const tags = tagsString ? tagsString.split(';').filter(Boolean) : undefined
    
    const annotations: TrainingAnnotation[] = []
    
    let annotationsStartIndex = -1
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('ID,Type,Position X')) {
        annotationsStartIndex = i + 1
        break
      }
    }
    
    if (annotationsStartIndex !== -1) {
      for (let i = annotationsStartIndex; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        
        const values = parseCSVLine(line)
        if (values.length >= 7) {
          const annotation: TrainingAnnotation = {
            id: values[0] || `annotation-${Date.now()}-${i}`,
            correctType: values[1] as ComponentType,
            boundingBox: {
              x: parseFloat(values[2]) || 0,
              y: parseFloat(values[3]) || 0,
              width: parseFloat(values[4]) || 50,
              height: parseFloat(values[5]) || 50,
            },
            schematicId: values[7] || 'imported',
            userVerified: true,
            createdAt: Date.now(),
          }
          annotations.push(annotation)
        }
      }
    }
    
    const library: ComponentLibrary = {
      id: `library-${Date.now()}`,
      name: name || 'Bibliothèque importée',
      description: description || '',
      isDefault: false,
      createdAt: Date.now(),
      lastModified: Date.now(),
      annotations,
      componentCount: annotations.length,
      version,
      author: author || undefined,
      tags: tags && tags.length > 0 ? tags : undefined,
    }
    
    return library
  } catch (error) {
    console.error('Erreur lors de l\'import CSV:', error)
    return null
  }
}

export function importLibraryFromXML(xmlContent: string): ComponentLibrary | null {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlContent, 'text/xml')
    
    const parserError = doc.querySelector('parsererror')
    if (parserError) {
      throw new Error('Fichier XML invalide')
    }
    
    const root = doc.querySelector('bibliotheque')
    if (!root) {
      throw new Error('Élément racine <bibliotheque> introuvable')
    }
    
    const name = root.querySelector('informations > nom')?.textContent || 'Bibliothèque importée'
    const version = root.querySelector('informations > version')?.textContent || '1.0.0'
    const description = root.querySelector('informations > description')?.textContent || ''
    const author = root.querySelector('informations > auteur')?.textContent || undefined
    
    const tagElements = root.querySelectorAll('informations > etiquettes > etiquette')
    const tags: string[] = []
    tagElements.forEach(tag => {
      const tagText = tag.textContent
      if (tagText) tags.push(tagText)
    })
    
    const annotations: TrainingAnnotation[] = []
    const annotationElements = root.querySelectorAll('annotations > annotation')
    
    annotationElements.forEach((annotationEl, index) => {
      const id = annotationEl.querySelector('id')?.textContent || `annotation-${Date.now()}-${index}`
      const type = annotationEl.querySelector('type')?.textContent || 'unknown'
      const x = parseFloat(annotationEl.querySelector('limites > x')?.textContent || '0')
      const y = parseFloat(annotationEl.querySelector('limites > y')?.textContent || '0')
      const width = parseFloat(annotationEl.querySelector('limites > largeur')?.textContent || '50')
      const height = parseFloat(annotationEl.querySelector('limites > hauteur')?.textContent || '50')
      const schematicId = annotationEl.querySelector('schematicId')?.textContent || 'imported'
      const verified = annotationEl.querySelector('verifie')?.textContent === 'true'
      
      const annotation: TrainingAnnotation = {
        id,
        correctType: type as ComponentType,
        boundingBox: { x, y, width, height },
        schematicId,
        userVerified: verified,
        createdAt: Date.now(),
      }
      
      annotations.push(annotation)
    })
    
    const library: ComponentLibrary = {
      id: `library-${Date.now()}`,
      name,
      description,
      isDefault: false,
      createdAt: Date.now(),
      lastModified: Date.now(),
      annotations,
      componentCount: annotations.length,
      version,
      author,
      tags: tags.length > 0 ? tags : undefined,
    }
    
    return library
  } catch (error) {
    console.error('Erreur lors de l\'import XML:', error)
    return null
  }
}

function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  values.push(current.trim())
  return values
}

export async function downloadFile(content: string, fileName: string, mimeType: string): Promise<void> {
  const blob = new Blob([content], { type: mimeType })
  
  if ('showSaveFilePicker' in window) {
    try {
      const extension = fileName.split('.').pop() || 'txt'
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [{
          description: `Fichier ${extension.toUpperCase()}`,
          accept: { [mimeType]: [`.${extension}`] },
        }],
      })
      
      const writable = await fileHandle.createWritable()
      await writable.write(blob)
      await writable.close()
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('CANCELLED')
      }
      throw err
    }
  } else {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
  }
}
