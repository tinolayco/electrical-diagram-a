from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path
from typing import Callable

from flask import url_for

from .demo import make_demo_schematic
from .models import blank_state, make_default_library, now_ts


class Storage:
    def __init__(self, app) -> None:
        self.app = app
        self.root = self._resolve_root()
        self.data_dir = self.root / "instance"
        self.upload_dir = self.data_dir / "uploads"
        self.state_file = self.data_dir / "state.json"
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self._bootstrap()

    def _resolve_root(self) -> Path:
        if getattr(sys, "frozen", False):
            return Path(sys.executable).resolve().parent
        return Path(self.app.root_path).resolve().parent

    def _bootstrap(self) -> None:
        if not self.state_file.exists():
            self.write_state(blank_state())
            return

        state = self.read_state()
        if not state.get("libraries"):
            state["libraries"] = [make_default_library()]
        if not state.get("activeLibraryId"):
            state["activeLibraryId"] = state["libraries"][0]["id"]
        if "catalog" not in state:
            state["catalog"] = []
        if "settings" not in state:
            state["settings"] = {"confidenceThreshold": 85}
        self.write_state(state)

    def read_state(self) -> dict:
        return json.loads(self.state_file.read_text(encoding="utf-8"))

    def write_state(self, state: dict) -> None:
        self.state_file.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")

    def mutate_state(self, mutator: Callable[[dict], dict]) -> dict:
        state = self.read_state()
        updated = mutator(state)
        self.write_state(updated)
        return updated

    def serialize_state(self) -> dict:
        state = self.read_state()
        state["schematics"] = [self.serialize_schematic(schematic) for schematic in state.get("schematics", [])]
        return state

    def serialize_schematic(self, schematic: dict) -> dict:
        payload = dict(schematic)
        if schematic.get("imageKind") == "demo":
            payload["imageUrl"] = url_for("static", filename=schematic["imagePath"])
        else:
            payload["imageUrl"] = url_for("media_file", filename=schematic["imagePath"])
        return payload

    def save_upload(self, file_storage) -> tuple[str, str]:
        timestamp = now_ts()
        suffix = Path(file_storage.filename or "upload.png").suffix.lower() or ".png"
        safe_name = f"upload-{timestamp}{suffix}"
        target = self.upload_dir / safe_name
        file_storage.save(target)
        return safe_name, file_storage.filename or safe_name

    def get_image_path(self, schematic: dict) -> Path:
        if schematic.get("imageKind") == "demo":
            return Path(self.app.static_folder) / schematic["imagePath"]
        return self.upload_dir / schematic["imagePath"]

    def ensure_demo_schematic(self) -> dict:
        def mutator(state: dict) -> dict:
            schematics = [item for item in state.get("schematics", []) if item.get("id") != "demo-schematic-example"]
            schematics.append(make_demo_schematic())
            state["schematics"] = schematics
            return state

        state = self.mutate_state(mutator)
        return next(item for item in state["schematics"] if item["id"] == "demo-schematic-example")

    def reset(self, reset_type: str, active_library_id: str | None = None) -> dict:
        def mutator(state: dict) -> dict:
            if reset_type == "all":
                for file_path in self.upload_dir.glob("*"):
                    if file_path.is_file():
                        file_path.unlink()
                return blank_state()

            if reset_type == "schematics":
                state["schematics"] = []
                state["catalog"] = []
                shutil.rmtree(self.upload_dir, ignore_errors=True)
                self.upload_dir.mkdir(parents=True, exist_ok=True)
                return state

            if reset_type == "library" and active_library_id:
                for library in state.get("libraries", []):
                    if library["id"] == active_library_id and not library.get("isDefault"):
                        library["annotations"] = []
                        library["componentCount"] = 0
                        library["lastModified"] = now_ts()
                return state

            return state

        return self.mutate_state(mutator)
