import type { ComponentLibrary, Schematic, Component, TrainingAnnotation } from './types'

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
