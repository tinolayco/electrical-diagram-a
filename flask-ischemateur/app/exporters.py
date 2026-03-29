from __future__ import annotations

import csv
import io
import json
import xml.etree.ElementTree as ET

from .models import COMPONENT_LABELS, now_ts


def _escape_csv(value) -> str:
    if value is None:
        return ""
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow([value])
    return buffer.getvalue().strip()


def export_schematic_to_csv(schematic: dict) -> str:
    lines = []
    lines.append("=== INFORMATIONS DU SCHÉMA ===")
    lines.append("")
    lines.append("Champ,Valeur")
    lines.append(f"Nom du schéma,{_escape_csv(schematic['name'])}")
    lines.append(f"ID,{_escape_csv(schematic['id'])}")
    lines.append(f"Nombre total de composants,{len(schematic.get('components', []))}")
    lines.append(f"Nombre de chemins électriques,{len(schematic.get('paths', []))}")
    lines.append("")
    lines.append("=== DÉTAILS DES COMPOSANTS DÉTECTÉS ===")
    lines.append("")
    lines.append("N°,ID,Type,Nom,Position X,Position Y,Largeur,Hauteur,Confiance,Tension,Calibre,Fabricant,Connexions")
    for index, component in enumerate(schematic.get("components", []), start=1):
        box = component["boundingBox"]
        lines.append(",".join([
            str(index),
            _escape_csv(component["id"]),
            _escape_csv(COMPONENT_LABELS.get(component["type"], component["type"])),
            _escape_csv(component.get("name", "")),
            str(round(box["x"], 2)),
            str(round(box["y"], 2)),
            str(round(box["width"], 2)),
            str(round(box["height"], 2)),
            str(round(component.get("confidence", 0), 1)),
            _escape_csv(component.get("voltage", "")),
            _escape_csv(component.get("rating", "")),
            _escape_csv(component.get("manufacturer", "")),
            _escape_csv("; ".join(component.get("connections", []))),
        ]))
    if schematic.get("paths"):
        lines.append("")
        lines.append("=== CHEMINS ÉLECTRIQUES IDENTIFIÉS ===")
        lines.append("")
        lines.append("N°,ID,Description,Tension,Composants")
        for index, path in enumerate(schematic["paths"], start=1):
            lines.append(",".join([
                str(index),
                _escape_csv(path["id"]),
                _escape_csv(path.get("description", "")),
                _escape_csv(path.get("voltage", "")),
                _escape_csv(" -> ".join(path.get("components", []))),
            ]))
    return "\n".join(lines)


def export_catalog_to_csv(catalog: list[dict]) -> str:
    lines = ["Type,Nombre,Dernière mise à jour"]
    for entry in catalog:
        lines.append(",".join([
            _escape_csv(COMPONENT_LABELS.get(entry["type"], entry["type"])),
            str(entry.get("count", 0)),
            str(entry.get("lastUpdated", 0)),
        ]))
    return "\n".join(lines)


def export_library_to_json(library: dict, version_history: list[dict] | None = None) -> str:
    payload = {
        "formatVersion": "1.0.0",
        "exportedAt": now_ts(),
        "library": library,
        "versionHistory": version_history or [],
    }
    return json.dumps(payload, ensure_ascii=False, indent=2)


def export_library_to_csv(library: dict) -> str:
    lines = [
        "=== INFORMATIONS DE LA BIBLIOTHÈQUE ===",
        "",
        "Champ,Valeur",
        f"Nom,{_escape_csv(library['name'])}",
        f"Description,{_escape_csv(library.get('description', ''))}",
        f"Version,{_escape_csv(library.get('version', '1.0.0'))}",
        f"Auteur,{_escape_csv(library.get('author', ''))}",
        f"Nombre d'annotations,{library.get('componentCount', 0)}",
        "",
        "=== ANNOTATIONS ===",
        "",
        "N°,ID,Type,X,Y,Largeur,Hauteur,Schéma",
    ]
    for index, annotation in enumerate(library.get("annotations", []), start=1):
        box = annotation["boundingBox"]
        lines.append(",".join([
            str(index),
            _escape_csv(annotation["id"]),
            _escape_csv(annotation["correctType"]),
            str(round(box["x"], 2)),
            str(round(box["y"], 2)),
            str(round(box["width"], 2)),
            str(round(box["height"], 2)),
            _escape_csv(annotation.get("schematicId", "")),
        ]))
    return "\n".join(lines)


def export_library_to_xml(library: dict) -> str:
    root = ET.Element("bibliotheque")
    info = ET.SubElement(root, "informations")
    for key in ["name", "description", "version", "author", "componentCount"]:
        node = ET.SubElement(info, key)
        node.text = str(library.get(key, ""))
    annotations = ET.SubElement(root, "annotations")
    for annotation in library.get("annotations", []):
        item = ET.SubElement(annotations, "annotation")
        ET.SubElement(item, "id").text = annotation["id"]
        ET.SubElement(item, "correctType").text = annotation["correctType"]
        ET.SubElement(item, "schematicId").text = annotation.get("schematicId", "")
        box = ET.SubElement(item, "boundingBox")
        for field, value in annotation["boundingBox"].items():
            ET.SubElement(box, field).text = str(value)
    return ET.tostring(root, encoding="unicode")


def import_library_from_text(file_name: str, content: str) -> dict:
    lowered = file_name.lower()
    if lowered.endswith(".json"):
        payload = json.loads(content)
        if "library" in payload:
            return payload["library"]
        return payload

    if lowered.endswith(".xml"):
        root = ET.fromstring(content)
        info = root.find("informations")
        library = {
            "name": info.findtext("name", default="Bibliothèque importée"),
            "description": info.findtext("description", default=""),
            "version": info.findtext("version", default="1.0.0"),
            "author": info.findtext("author", default=""),
            "annotations": [],
            "isDefault": False,
            "tags": [],
        }
        for node in root.findall("./annotations/annotation"):
            box_node = node.find("boundingBox")
            library["annotations"].append({
                "id": node.findtext("id", default="annotation-imported"),
                "correctType": node.findtext("correctType", default="unknown"),
                "schematicId": node.findtext("schematicId", default=""),
                "userVerified": True,
                "createdAt": now_ts(),
                "boundingBox": {
                    "x": float(box_node.findtext("x", default="0")),
                    "y": float(box_node.findtext("y", default="0")),
                    "width": float(box_node.findtext("width", default="1")),
                    "height": float(box_node.findtext("height", default="1")),
                },
            })
        library["componentCount"] = len(library["annotations"])
        return library

    if lowered.endswith(".csv"):
        annotations = []
        reader = csv.reader(io.StringIO(content))
        annotation_section = False
        for row in reader:
            if not row:
                continue
            if row[0] == "=== ANNOTATIONS ===":
                annotation_section = True
                continue
            if not annotation_section or row[0] in {"N°", "N°,ID,Type,X,Y,Largeur,Hauteur,Schéma"}:
                continue
            if len(row) >= 8 and row[0].isdigit():
                annotations.append({
                    "id": row[1],
                    "correctType": row[2],
                    "boundingBox": {
                        "x": float(row[3]),
                        "y": float(row[4]),
                        "width": float(row[5]),
                        "height": float(row[6]),
                    },
                    "schematicId": row[7],
                    "userVerified": True,
                    "createdAt": now_ts(),
                })
        return {
            "name": "Bibliothèque importée CSV",
            "description": "Import CSV",
            "version": "1.0.0",
            "author": "Import CSV",
            "annotations": annotations,
            "isDefault": False,
            "componentCount": len(annotations),
            "tags": ["import", "csv"],
        }

    raise ValueError("Format de bibliothèque non supporté")
