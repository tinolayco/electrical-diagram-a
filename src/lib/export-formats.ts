import type { ComponentLibrary, Schematic, Component, TrainingAnnotation, ComponentType } from './types'

export function exportLibraryToCSV(library: ComponentLibrary): string {
  const lines: string[] = []
  
  lines.push('=== INFORMATIONS DE LA BIBLIOTHÈQUE ===')
  lines.push('')
  lines.push('Champ,Valeur')
  lines.push(`Nom,${escapeCSV(library.name)}`)
  lines.push(`Version,${escapeCSV(library.version || '1.0.0')}`)
  lines.push(`Description,${escapeCSV(library.description || 'Aucune description')}`)
  lines.push(`Auteur,${escapeCSV(library.author || 'Non spécifié')}`)
  lines.push(`Étiquettes,${escapeCSV(library.tags?.join('; ') || 'Aucune')}`)
  lines.push(`Date de création,${new Date(library.createdAt).toLocaleString('fr-FR')}`)
  lines.push(`Dernière modification,${new Date(library.lastModified).toLocaleString('fr-FR')}`)
  lines.push(`Nombre de composants entraînés,${library.componentCount}`)
  lines.push(`Bibliothèque par défaut,${library.isDefault ? 'Oui' : 'Non'}`)
  
  lines.push('')
  lines.push('')
  lines.push('=== STATISTIQUES PAR TYPE DE COMPOSANT ===')
  lines.push('')
  
  const typeStats = new Map<string, number>()
  library.annotations.forEach((annotation: TrainingAnnotation) => {
    const count = typeStats.get(annotation.correctType) || 0
    typeStats.set(annotation.correctType, count + 1)
  })
  
  lines.push('Type de composant,Nombre d\'annotations,Pourcentage')
  const sortedTypes = Array.from(typeStats.entries()).sort((a, b) => b[1] - a[1])
  sortedTypes.forEach(([type, count]) => {
    const percentage = ((count / library.componentCount) * 100).toFixed(1)
    lines.push(`${escapeCSV(getComponentTypeLabel(type))},${count},${percentage}%`)
  })
  
  lines.push('')
  lines.push('')
  lines.push('=== DÉTAILS DES ANNOTATIONS ===')
  lines.push('')
  lines.push('N°,ID Annotation,Type de composant,Position X,Position Y,Largeur,Hauteur,Aire (px²),Ratio L/H,Centre X,Centre Y,ID Schéma,Vérifié,Date de création')
  
  library.annotations.forEach((annotation: TrainingAnnotation, index) => {
    const area = annotation.boundingBox.width * annotation.boundingBox.height
    const ratio = (annotation.boundingBox.width / annotation.boundingBox.height).toFixed(2)
    const centerX = (annotation.boundingBox.x + annotation.boundingBox.width / 2).toFixed(1)
    const centerY = (annotation.boundingBox.y + annotation.boundingBox.height / 2).toFixed(1)
    
    lines.push([
      (index + 1).toString(),
      escapeCSV(annotation.id),
      escapeCSV(getComponentTypeLabel(annotation.correctType)),
      annotation.boundingBox.x.toFixed(1),
      annotation.boundingBox.y.toFixed(1),
      annotation.boundingBox.width.toFixed(1),
      annotation.boundingBox.height.toFixed(1),
      area.toFixed(0),
      ratio,
      centerX,
      centerY,
      escapeCSV(annotation.schematicId.substring(0, 30)),
      annotation.userVerified ? 'Oui' : 'Non',
      new Date(annotation.createdAt).toLocaleString('fr-FR')
    ].join(','))
  })
  
  lines.push('')
  lines.push('')
  lines.push('=== INFORMATIONS D\'EXPORT ===')
  lines.push('')
  lines.push('Exporté le,' + new Date().toLocaleString('fr-FR'))
  lines.push('Format,CSV pour analyse Excel')
  lines.push('Application,iSchémateur - Analyseur de schémas électriques')
  lines.push('Compatible avec,Microsoft Excel, Google Sheets, LibreOffice Calc')
  
  return lines.join('\n')
}

function getComponentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'breaker': 'Disjoncteur',
    'transformer': 'Transformateur',
    'bus-bar': 'Barre omnibus',
    'switch': 'Interrupteur',
    'fuse': 'Fusible',
    'relay': 'Relais',
    'meter': 'Compteur',
    'capacitor': 'Condensateur',
    'inductor': 'Inductance',
    'generator': 'Générateur',
    'motor': 'Moteur',
    'load': 'Charge',
    'unknown': 'Inconnu'
  }
  return labels[type] || type
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
  
  lines.push('=== INFORMATIONS DU SCHÉMA ===')
  lines.push('')
  lines.push('Champ,Valeur')
  lines.push(`Nom du schéma,${escapeCSV(schematic.name)}`)
  lines.push(`ID,${escapeCSV(schematic.id)}`)
  lines.push(`Date de téléversement,${new Date(schematic.uploadedAt).toLocaleString('fr-FR')}`)
  lines.push(`Nombre total de composants,${schematic.components.length}`)
  lines.push(`Nombre de chemins électriques,${schematic.paths.length}`)
  
  lines.push('')
  lines.push('')
  lines.push('=== STATISTIQUES PAR TYPE DE COMPOSANT ===')
  lines.push('')
  
  const typeStats = new Map<string, { count: number; avgConfidence: number; userAnnotated: number }>()
  schematic.components.forEach((component: Component) => {
    const stats = typeStats.get(component.type) || { count: 0, avgConfidence: 0, userAnnotated: 0 }
    stats.count += 1
    stats.avgConfidence += component.confidence || 0
    if (component.metadata?.userAnnotated === 'true') {
      stats.userAnnotated += 1
    }
    typeStats.set(component.type, stats)
  })
  
  lines.push('Type de composant,Nombre,Confiance moyenne,Annotés manuellement,Auto-détectés')
  const sortedTypes = Array.from(typeStats.entries()).sort((a, b) => b[1].count - a[1].count)
  sortedTypes.forEach(([type, stats]) => {
    const avgConf = stats.count > 0 ? (stats.avgConfidence / stats.count).toFixed(1) : '0'
    const autoDetected = stats.count - stats.userAnnotated
    lines.push(`${escapeCSV(getComponentTypeLabel(type))},${stats.count},${avgConf}%,${stats.userAnnotated},${autoDetected}`)
  })
  
  lines.push('')
  lines.push('')
  lines.push('=== DÉTAILS DES COMPOSANTS DÉTECTÉS ===')
  lines.push('')
  lines.push('N°,ID,Type,Nom,Position X,Position Y,Largeur,Hauteur,Aire (px²),Centre X,Centre Y,Confiance (%),Source,Tension,Puissance,Fabricant,Connexions')
  
  schematic.components.forEach((component: Component, index) => {
    const area = component.boundingBox.width * component.boundingBox.height
    const centerX = (component.boundingBox.x + component.boundingBox.width / 2).toFixed(1)
    const centerY = (component.boundingBox.y + component.boundingBox.height / 2).toFixed(1)
    const source = component.metadata?.userAnnotated === 'true' ? 'Manuel' : 'Auto-détecté'
    
    lines.push([
      (index + 1).toString(),
      escapeCSV(component.id),
      escapeCSV(getComponentTypeLabel(component.type)),
      escapeCSV(component.name || ''),
      component.boundingBox.x.toFixed(1),
      component.boundingBox.y.toFixed(1),
      component.boundingBox.width.toFixed(1),
      component.boundingBox.height.toFixed(1),
      area.toFixed(0),
      centerX,
      centerY,
      component.confidence?.toFixed(1) || '',
      source,
      escapeCSV(component.voltage || ''),
      escapeCSV(component.rating || ''),
      escapeCSV(component.manufacturer || ''),
      escapeCSV(component.connections?.join('; ') || '')
    ].join(','))
  })
  
  if (schematic.paths.length > 0) {
    lines.push('')
    lines.push('')
    lines.push('=== CHEMINS ÉLECTRIQUES IDENTIFIÉS ===')
    lines.push('')
    lines.push('N°,ID Chemin,Description,Tension,Nombre de composants,Liste des composants (IDs)')
    
    schematic.paths.forEach((path, index) => {
      lines.push([
        (index + 1).toString(),
        escapeCSV(path.id),
        escapeCSV(path.description),
        escapeCSV(path.voltage || 'Non spécifié'),
        path.components.length.toString(),
        escapeCSV(path.components.join(' → '))
      ].join(','))
    })
    
    lines.push('')
    lines.push('')
    lines.push('=== MATRICE DE CONNEXIONS ===')
    lines.push('')
    
    const componentMap = new Map(schematic.components.map(c => [c.id, c]))
    const connectionPairs = new Set<string>()
    
    schematic.components.forEach(comp => {
      comp.connections?.forEach(connId => {
        const pair = [comp.id, connId].sort().join('|')
        connectionPairs.add(pair)
      })
    })
    
    if (connectionPairs.size > 0) {
      lines.push('Composant A,Type A,Composant B,Type B')
      connectionPairs.forEach(pair => {
        const [idA, idB] = pair.split('|')
        const compA = componentMap.get(idA)
        const compB = componentMap.get(idB)
        if (compA && compB) {
          lines.push([
            escapeCSV(compA.name || idA),
            escapeCSV(getComponentTypeLabel(compA.type)),
            escapeCSV(compB.name || idB),
            escapeCSV(getComponentTypeLabel(compB.type))
          ].join(','))
        }
      })
    }
  }
  
  lines.push('')
  lines.push('')
  lines.push('=== INFORMATIONS D\'EXPORT ===')
  lines.push('')
  lines.push('Exporté le,' + new Date().toLocaleString('fr-FR'))
  lines.push('Format,CSV pour analyse Excel')
  lines.push('Application,iSchémateur - Analyseur de schémas électriques')
  lines.push('Compatible avec,Microsoft Excel, Google Sheets, LibreOffice Calc')
  
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
    
    let name = 'Bibliothèque importée'
    let version = '1.0.0'
    let description = ''
    let author = ''
    let tags: string[] | undefined = undefined
    
    const metadataSection = lines.findIndex(line => line.includes('=== INFORMATIONS DE LA BIBLIOTHÈQUE ==='))
    
    if (metadataSection !== -1) {
      for (let i = metadataSection + 2; i < lines.length; i++) {
        const line = lines[i]
        if (line.startsWith('===') || !line.includes(',')) break
        
        const values = parseCSVLine(line)
        if (values.length < 2) continue
        
        const field = values[0].toLowerCase()
        const value = values[1]
        
        if (field === 'nom') name = value
        else if (field === 'version') version = value
        else if (field === 'description') description = value
        else if (field === 'auteur') author = value
        else if (field === 'étiquettes') {
          tags = value.split(';').map(t => t.trim()).filter(Boolean)
        }
      }
    } else {
      const headerLine = lines[1]
      const headerValues = parseCSVLine(headerLine)
      
      if (headerValues.length >= 8) {
        name = headerValues[0]
        version = headerValues[1] || '1.0.0'
        description = headerValues[2]
        author = headerValues[3]
        const tagsString = headerValues[4]
        tags = tagsString ? tagsString.split(';').filter(Boolean) : undefined
      }
    }
    
    const annotations: TrainingAnnotation[] = []
    
    let annotationsStartIndex = -1
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.includes('N°,ID Annotation,Type de composant') || line.includes('ID,Type,Position X')) {
        annotationsStartIndex = i + 1
        break
      }
    }
    
    if (annotationsStartIndex !== -1) {
      for (let i = annotationsStartIndex; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line || line.startsWith('===')) continue
        
        const values = parseCSVLine(line)
        if (values.length >= 7) {
          let idIndex = 0
          let typeIndex = 1
          let xIndex = 2
          let yIndex = 3
          let widthIndex = 4
          let heightIndex = 5
          let schematicIdIndex = 7
          
          if (line.match(/^\d+,/)) {
            idIndex = 1
            typeIndex = 2
            xIndex = 3
            yIndex = 4
            widthIndex = 5
            heightIndex = 6
            schematicIdIndex = 11
          }
          
          let componentType = values[typeIndex] as ComponentType
          const typeMap: Record<string, ComponentType> = {
            'Disjoncteur': 'breaker',
            'Transformateur': 'transformer',
            'Barre omnibus': 'bus-bar',
            'Interrupteur': 'switch',
            'Fusible': 'fuse',
            'Relais': 'relay',
            'Compteur': 'meter',
            'Condensateur': 'capacitor',
            'Inductance': 'inductor',
            'Générateur': 'generator',
            'Moteur': 'motor',
            'Charge': 'load',
            'Inconnu': 'unknown'
          }
          
          if (typeMap[componentType]) {
            componentType = typeMap[componentType]
          }
          
          const annotation: TrainingAnnotation = {
            id: values[idIndex] || `annotation-${Date.now()}-${i}`,
            correctType: componentType,
            boundingBox: {
              x: parseFloat(values[xIndex]) || 0,
              y: parseFloat(values[yIndex]) || 0,
              width: parseFloat(values[widthIndex]) || 50,
              height: parseFloat(values[heightIndex]) || 50,
            },
            schematicId: values[schematicIdIndex] || 'imported',
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
