from __future__ import annotations

import io
from copy import deepcopy
from pathlib import Path

from flask import Flask, jsonify, render_template, request, send_file, send_from_directory

from .analysis import analyze_schematic, update_catalog
from .exporters import (
    export_catalog_to_csv,
    export_library_to_csv,
    export_library_to_json,
    export_library_to_xml,
    export_schematic_to_csv,
    import_library_from_text,
)
from .models import COMPONENT_TYPES, normalize_box, now_ts
from .storage import Storage


def create_app() -> Flask:
    app = Flask(__name__, template_folder="templates", static_folder="static")
    storage = Storage(app)
    app.config["storage"] = storage

    @app.get("/")
    def index():
        return render_template("index.html", component_types=COMPONENT_TYPES)

    @app.get("/media/<path:filename>")
    def media_file(filename: str):
        return send_from_directory(storage.upload_dir, filename)

    @app.get("/api/bootstrap")
    def bootstrap():
        return jsonify(storage.serialize_state())

    @app.post("/api/demo")
    def load_demo():
        schematic = storage.ensure_demo_schematic()
        state = storage.serialize_state()
        schematic_payload = next(item for item in state["schematics"] if item["id"] == schematic["id"])
        return jsonify({"schematic": schematic_payload, "state": state})

    @app.post("/api/upload")
    def upload_schematic():
        file = request.files.get("file")
        if file is None or not file.filename:
            return jsonify({"error": "Fichier manquant"}), 400
        suffix = Path(file.filename).suffix.lower()
        if suffix not in {".png", ".jpg", ".jpeg", ".bmp", ".webp"}:
            return jsonify({"error": "Formats supportés: PNG, JPG, JPEG, BMP, WEBP"}), 400
        stored_name, original_name = storage.save_upload(file)

        def mutator(state: dict) -> dict:
            schematic = {
                "id": f"schematic-{now_ts()}",
                "name": original_name,
                "uploadedAt": now_ts(),
                "imageKind": "upload",
                "imagePath": stored_name,
                "components": [],
                "paths": [],
            }
            state["schematics"].append(schematic)
            return state

        state = storage.mutate_state(mutator)
        payload = storage.serialize_state()
        return jsonify({"state": payload, "schematic": payload["schematics"][-1]})

    @app.post("/api/analyze")
    def analyze():
        body = request.get_json(force=True)
        schematic_id = body.get("schematicId")
        library_id = body.get("libraryId")
        threshold = int(body.get("threshold", 85))
        state = storage.read_state()
        schematic = next((item for item in state["schematics"] if item["id"] == schematic_id), None)
        if schematic is None:
            return jsonify({"error": "Schéma introuvable"}), 404
        library = next((item for item in state["libraries"] if item["id"] == library_id), None)
        if library is None:
            return jsonify({"error": "Bibliothèque introuvable"}), 404

        effective_library = dict(library)
        template_rects = body.get("templateRects", [])
        if template_rects:
            extra = []
            for item in template_rects:
                rect = item.get("rect")
                rtype = item.get("type", "unknown")
                if rect:
                    extra.append({
                        "id": f"template-{now_ts()}-{len(extra)}",
                        "schematicId": schematic_id,
                        "boundingBox": normalize_box(rect),
                        "correctType": rtype,
                        "userVerified": True,
                    })
            effective_library["annotations"] = list(library.get("annotations", [])) + extra

        source_image_map = {item["id"]: storage.get_image_path(item) for item in state["schematics"]}
        components, paths = analyze_schematic(schematic, storage.get_image_path(schematic), effective_library, threshold, source_image_map)

        def mutator(current_state: dict) -> dict:
            for item in current_state["schematics"]:
                if item["id"] == schematic_id:
                    item["components"] = components
                    item["paths"] = paths
            current_state["catalog"] = update_catalog(current_state.get("catalog", []), components)
            current_state.setdefault("settings", {})["confidenceThreshold"] = threshold
            return current_state

        updated_state = storage.mutate_state(mutator)
        payload = storage.serialize_state()
        updated_schematic = next(item for item in payload["schematics"] if item["id"] == schematic_id)
        return jsonify({"schematic": updated_schematic, "catalog": payload["catalog"], "state": payload})

    @app.post("/api/libraries")
    def create_library():
        body = request.get_json(force=True)
        name = (body.get("name") or "").strip()
        if not name:
            return jsonify({"error": "Le nom est requis"}), 400

        def mutator(state: dict) -> dict:
            library = {
                "id": f"library-{now_ts()}",
                "name": name,
                "description": body.get("description", "").strip(),
                "isDefault": False,
                "createdAt": now_ts(),
                "lastModified": now_ts(),
                "annotations": [],
                "componentCount": 0,
                "version": body.get("version") or "1.0.0",
                "author": body.get("author") or None,
                "tags": body.get("tags") or [],
            }
            state["libraries"].append(library)
            state["activeLibraryId"] = library["id"]
            return state

        state = storage.mutate_state(mutator)
        return jsonify(state)

    @app.put("/api/libraries/<library_id>")
    def update_library(library_id: str):
        body = request.get_json(force=True)

        def mutator(state: dict) -> dict:
            for library in state["libraries"]:
                if library["id"] == library_id:
                    for field in ["name", "description", "author", "tags", "version"]:
                        if field in body:
                            library[field] = body[field]
                    library["lastModified"] = now_ts()
            return state

        return jsonify(storage.mutate_state(mutator))

    @app.delete("/api/libraries/<library_id>")
    def delete_library(library_id: str):
        def mutator(state: dict) -> dict:
            state["libraries"] = [item for item in state["libraries"] if item["id"] != library_id or item.get("isDefault")]
            if state.get("activeLibraryId") == library_id:
                state["activeLibraryId"] = state["libraries"][0]["id"]
            return state

        return jsonify(storage.mutate_state(mutator))

    @app.post("/api/libraries/activate")
    def activate_library():
        body = request.get_json(force=True)
        library_id = body.get("libraryId")

        def mutator(state: dict) -> dict:
            if any(item["id"] == library_id for item in state["libraries"]):
                state["activeLibraryId"] = library_id
            return state

        return jsonify(storage.mutate_state(mutator))

    @app.post("/api/libraries/import")
    def import_library():
        file = request.files.get("file")
        if file is None or not file.filename:
            return jsonify({"error": "Fichier de bibliothèque manquant"}), 400
        content = file.read().decode("utf-8")
        imported = import_library_from_text(file.filename, content)

        def mutator(state: dict) -> dict:
            library = deepcopy(imported)
            library["isDefault"] = False
            library["componentCount"] = len(library.get("annotations", []))
            library["lastModified"] = now_ts()
            existing = next((lib for lib in state["libraries"] if lib.get("name") == library.get("name") and not lib.get("isDefault")), None)
            if existing:
                existing["annotations"] = library.get("annotations", [])
                existing["componentCount"] = library["componentCount"]
                existing["lastModified"] = library["lastModified"]
                for field in ["description", "author", "tags", "version"]:
                    if field in library:
                        existing[field] = library[field]
                state["activeLibraryId"] = existing["id"]
            else:
                library["id"] = f"library-{now_ts()}"
                library["createdAt"] = now_ts()
                state["libraries"].append(library)
                state["activeLibraryId"] = library["id"]
            return state

        return jsonify(storage.mutate_state(mutator))

    @app.get("/api/libraries/<library_id>/export/<fmt>")
    def export_library(library_id: str, fmt: str):
        state = storage.read_state()
        library = next((item for item in state["libraries"] if item["id"] == library_id), None)
        if library is None:
            return jsonify({"error": "Bibliothèque introuvable"}), 404
        if fmt == "json":
            content = export_library_to_json(library)
            mime = "application/json"
            filename = f"bibliotheque_{library['name']}.json"
        elif fmt == "csv":
            content = export_library_to_csv(library)
            mime = "text/csv"
            filename = f"bibliotheque_{library['name']}.csv"
        elif fmt == "xml":
            content = export_library_to_xml(library)
            mime = "application/xml"
            filename = f"bibliotheque_{library['name']}.xml"
        else:
            return jsonify({"error": "Format non supporté"}), 400
        return send_file(io.BytesIO(content.encode("utf-8")), as_attachment=True, download_name=filename, mimetype=mime)

    @app.post("/api/libraries/<library_id>/train")
    def train_library(library_id: str):
        body = request.get_json(force=True)
        schematic_id = body.get("schematicId")
        annotations = body.get("annotations", [])
        if not annotations:
            return jsonify({"error": "Aucune annotation transmise"}), 400

        normalized = []
        for annotation in annotations:
            normalized.append({
                "id": annotation.get("id") or f"annotation-{now_ts()}",
                "schematicId": schematic_id,
                "boundingBox": normalize_box(annotation["boundingBox"]),
                "correctType": annotation["correctType"],
                "userVerified": True,
                "createdAt": now_ts(),
            })

        def mutator(state: dict) -> dict:
            for library in state["libraries"]:
                if library["id"] == library_id:
                    library["annotations"].extend(normalized)
                    library["componentCount"] = len(library["annotations"])
                    library["lastModified"] = now_ts()
            return state

        return jsonify(storage.mutate_state(mutator))

    @app.delete("/api/libraries/<library_id>/annotations/<annotation_id>")
    def delete_annotation(library_id: str, annotation_id: str):
        def mutator(state: dict) -> dict:
            for library in state["libraries"]:
                if library["id"] == library_id:
                    library["annotations"] = [
                        a for a in library.get("annotations", []) if a["id"] != annotation_id
                    ]
                    library["componentCount"] = len(library["annotations"])
                    library["lastModified"] = now_ts()
            return state

        return jsonify(storage.mutate_state(mutator))

    @app.put("/api/components/<schematic_id>/<component_id>")
    def update_component(schematic_id: str, component_id: str):
        body = request.get_json(force=True)

        def mutator(state: dict) -> dict:
            for schematic in state["schematics"]:
                if schematic["id"] != schematic_id:
                    continue
                for component in schematic.get("components", []):
                    if component["id"] == component_id:
                        for field in ["name", "type", "voltage", "rating", "manufacturer"]:
                            if field in body:
                                component[field] = body[field]
            for schematic in state["schematics"]:
                if schematic["id"] == schematic_id:
                    state["catalog"] = update_catalog(state.get("catalog", []), schematic.get("components", []))
            return state

        return jsonify(storage.mutate_state(mutator))

    @app.post("/api/components/<schematic_id>/<component_id>/toggle-breaker")
    def toggle_breaker(schematic_id: str, component_id: str):
        def mutator(state: dict) -> dict:
            for schematic in state["schematics"]:
                if schematic["id"] != schematic_id:
                    continue
                for component in schematic.get("components", []):
                    if component["id"] == component_id and component.get("type") == "breaker":
                        component["breakerState"] = "open" if component.get("breakerState") == "closed" else "closed"
            return state

        return jsonify(storage.mutate_state(mutator))

    @app.get("/api/export/schematic/<schematic_id>.csv")
    def export_schematic(schematic_id: str):
        state = storage.read_state()
        schematic = next((item for item in state["schematics"] if item["id"] == schematic_id), None)
        if schematic is None:
            return jsonify({"error": "Schéma introuvable"}), 404
        content = export_schematic_to_csv(schematic)
        return send_file(io.BytesIO(content.encode("utf-8")), as_attachment=True, download_name=f"schema_{schematic_id}.csv", mimetype="text/csv")

    @app.get("/api/export/catalog.csv")
    def export_catalog():
        state = storage.read_state()
        content = export_catalog_to_csv(state.get("catalog", []))
        return send_file(io.BytesIO(content.encode("utf-8")), as_attachment=True, download_name="catalogue_composants.csv", mimetype="text/csv")

    @app.post("/api/reset")
    def reset():
        body = request.get_json(force=True)
        reset_type = body.get("type")
        active_library_id = body.get("activeLibraryId")
        state = storage.reset(reset_type, active_library_id)
        return jsonify(storage.serialize_state())

    return app
