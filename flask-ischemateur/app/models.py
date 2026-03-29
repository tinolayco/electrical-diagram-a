from __future__ import annotations

from copy import deepcopy


COMPONENT_TYPES = [
    "breaker",
    "transformer",
    "bus-bar",
    "switch",
    "fuse",
    "relay",
    "meter",
    "capacitor",
    "inductor",
    "generator",
    "motor",
    "load",
    "unknown",
]


COMPONENT_LABELS = {
    "breaker": "Disjoncteur",
    "transformer": "Transformateur",
    "bus-bar": "Barre omnibus",
    "switch": "Interrupteur",
    "fuse": "Fusible",
    "relay": "Relais",
    "meter": "Compteur",
    "capacitor": "Condensateur",
    "inductor": "Inducteur",
    "generator": "Générateur",
    "motor": "Moteur",
    "load": "Charge",
    "unknown": "Inconnu",
}


DEFAULT_LIBRARY = {
    "id": "default-library",
    "name": "Bibliothèque par défaut",
    "description": "Bibliothèque par défaut pour la détection heuristique OpenCV.",
    "isDefault": True,
    "createdAt": 0,
    "lastModified": 0,
    "annotations": [],
    "componentCount": 0,
    "version": "1.0.0",
    "author": "iSchémateur Flask",
    "tags": ["opencv", "default"],
}


def now_ts() -> int:
    import time

    return int(time.time() * 1000)


def make_default_library() -> dict:
    library = deepcopy(DEFAULT_LIBRARY)
    timestamp = now_ts()
    library["createdAt"] = timestamp
    library["lastModified"] = timestamp
    return library


def normalize_box(box: dict) -> dict:
    return {
        "x": max(0.0, min(100.0, float(box.get("x", 0)))),
        "y": max(0.0, min(100.0, float(box.get("y", 0)))),
        "width": max(0.1, min(100.0, float(box.get("width", 0.1)))),
        "height": max(0.1, min(100.0, float(box.get("height", 0.1)))),
    }


def blank_state() -> dict:
    return {
        "libraries": [make_default_library()],
        "activeLibraryId": "default-library",
        "schematics": [],
        "catalog": [],
        "settings": {"confidenceThreshold": 85},
    }
