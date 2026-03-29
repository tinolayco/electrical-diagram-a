from __future__ import annotations

from collections import defaultdict
from copy import deepcopy
from itertools import count
from pathlib import Path

import cv2
import numpy as np

from .demo import DEMO_COMPONENTS, DEMO_PATHS
from .models import COMPONENT_LABELS, normalize_box, now_ts


MIN_TEMPLATE_CONFIDENCE = 0.94
MAX_TEMPLATE_MATCHES_PER_ANNOTATION = 8
MAX_COMPONENTS_PER_ANALYSIS = 60
LOCAL_MAX_KERNEL_SIZE = 21


def analyze_schematic(
    schematic: dict,
    image_path: Path,
    library: dict,
    threshold: int,
    source_image_map: dict[str, Path] | None = None,
) -> tuple[list[dict], list[dict]]:
    if schematic.get("id") == "demo-schematic-example":
        return deepcopy(DEMO_COMPONENTS), deepcopy(DEMO_PATHS)

    components: list[dict] = []
    if library.get("annotations"):
        components.extend(match_from_annotations(schematic, image_path, library.get("annotations", []), threshold, source_image_map or {}))

    components = deduplicate_components(components)
    paths = infer_paths(components)
    attach_connections(components, paths)
    return components, paths


def detect_default_components(image_path: Path) -> list[dict]:
    image = load_image(image_path)
    height, width = image.shape[:2]
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 210, 255, cv2.THRESH_BINARY_INV)

    detections: list[dict] = []
    detections.extend(_detect_bus_bars(hsv, width, height))
    detections.extend(_detect_colored_boxes(hsv, width, height, "motor"))
    detections.extend(_detect_colored_boxes(hsv, width, height, "meter"))
    detections.extend(_detect_dark_rectangles(binary, width, height))
    detections.extend(_detect_circular_symbols(binary, width, height))
    detections.extend(_detect_switches(binary, width, height))
    return deduplicate_components(detections)


def match_from_annotations(
    schematic: dict,
    image_path: Path,
    annotations: list[dict],
    threshold: int,
    source_image_map: dict[str, Path],
) -> list[dict]:
    target = load_image(image_path)
    target_gray = cv2.cvtColor(target, cv2.COLOR_BGR2GRAY)
    height, width = target_gray.shape[:2]
    matches: list[dict] = []
    type_counters = defaultdict(count)

    for annotation in annotations:
        source_image_path = source_image_map.get(annotation.get("schematicId", ""))
        if source_image_path is None:
            source_image_path = image_path
        template = crop_box(load_image(source_image_path), annotation["boundingBox"])
        if template.size == 0:
            continue
        template_gray = cv2.cvtColor(template, cv2.COLOR_BGR2GRAY)
        annotated_component = {
            "id": annotation["id"],
            "type": annotation["correctType"],
            "name": f"{annotation['correctType'].upper()}-{next(type_counters[annotation['correctType']]) + 1}",
            "boundingBox": normalize_box(annotation["boundingBox"]),
            "confidence": 100,
            "connections": [],
            "metadata": {"userAnnotated": "true", "source": "training"},
        }
        matches.append(annotated_component)

        for angle in (0, 90, 180, 270):
            rotated = rotate_image(template_gray, angle)
            if rotated.shape[0] >= height or rotated.shape[1] >= width:
                continue
            result = cv2.matchTemplate(target_gray, rotated, cv2.TM_CCOEFF_NORMED)
            score_threshold = max(MIN_TEMPLATE_CONFIDENCE, threshold / 100.0)
            candidate_boxes = extract_template_matches(
                result,
                rotated.shape[1],
                rotated.shape[0],
                width,
                height,
                score_threshold,
                annotation["boundingBox"],
                annotation["correctType"],
                matches,
            )
            for match_box, confidence in candidate_boxes:
                matches.append({
                    "id": f"comp-similar-{now_ts()}-{angle}-{int(match_box['x'] * 10)}-{int(match_box['y'] * 10)}",
                    "type": annotation["correctType"],
                    "name": f"{annotation['correctType'].upper()}-auto",
                    "boundingBox": normalize_box(match_box),
                    "confidence": confidence,
                    "connections": [],
                    "metadata": {"source": "template-matching", "rotation": str(angle)},
                })
                if len(matches) >= MAX_COMPONENTS_PER_ANALYSIS:
                    break
            if len(matches) >= MAX_COMPONENTS_PER_ANALYSIS:
                break
    return deduplicate_components(matches)[:MAX_COMPONENTS_PER_ANALYSIS]


def infer_paths(components: list[dict]) -> list[dict]:
    if not components:
        return []

    bus_bars = sorted([c for c in components if c["type"] == "bus-bar"], key=lambda item: item["boundingBox"]["y"])
    breakers = [c for c in components if c["type"] == "breaker"]
    loads = [c for c in components if c["type"] in {"motor", "load", "meter"}]
    upstream = sorted(
        [c for c in components if c["type"] in {"switch", "transformer", "meter"} and c not in loads],
        key=lambda item: item["boundingBox"]["y"],
    )
    paths: list[dict] = []

    if bus_bars:
        bus = bus_bars[0]
        if upstream:
            chain = [item["id"] for item in upstream if item["boundingBox"]["y"] <= bus["boundingBox"]["y"]]
            if bus["id"] not in chain:
                chain.append(bus["id"])
            paths.append({
                "id": f"path-{now_ts()}-0",
                "components": chain,
                "voltage": bus.get("voltage", "480V"),
                "description": "Alimentation principale jusqu'à la barre omnibus",
            })

        for index, load in enumerate(loads, start=1):
            candidate_breaker = min(
                breakers,
                default=None,
                key=lambda item: abs(center_x(item) - center_x(load)) + abs(item["boundingBox"]["y"] - load["boundingBox"]["y"]),
            )
            chain = [bus["id"]]
            if candidate_breaker and candidate_breaker["boundingBox"]["y"] < load["boundingBox"]["y"]:
                chain.append(candidate_breaker["id"])
            chain.append(load["id"])
            paths.append({
                "id": f"path-{now_ts()}-{index}",
                "components": chain,
                "voltage": load.get("voltage") or bus.get("voltage", "480V"),
                "description": f"Départ vers {load.get('name', COMPONENT_LABELS.get(load['type'], load['type']))}",
            })
    return paths


def attach_connections(components: list[dict], paths: list[dict]) -> None:
    by_id = {component["id"]: component for component in components}
    for component in components:
        component["connections"] = []
    for path in paths:
        chain = path.get("components", [])
        for current, following in zip(chain, chain[1:]):
            if current in by_id and following in by_id:
                if following not in by_id[current]["connections"]:
                    by_id[current]["connections"].append(following)
                if current not in by_id[following]["connections"]:
                    by_id[following]["connections"].append(current)


def update_catalog(catalog: list[dict], components: list[dict]) -> list[dict]:
    catalog_map = {entry["type"]: dict(entry) for entry in catalog}
    counts = defaultdict(int)
    for component in components:
        counts[component["type"]] += 1
    for component_type, component_count in counts.items():
        entry = catalog_map.get(component_type, {
            "id": f"catalog-{component_type}",
            "type": component_type,
            "count": 0,
            "examples": [],
        })
        entry["count"] = component_count
        entry["lastUpdated"] = now_ts()
        catalog_map[component_type] = entry
    return sorted(catalog_map.values(), key=lambda item: item["type"])


def deduplicate_components(components: list[dict]) -> list[dict]:
    deduped: list[dict] = []
    for component in sorted(components, key=lambda item: item.get("confidence", 0), reverse=True):
        if any(
            component["type"] == existing["type"]
            and (
                iou(component["boundingBox"], existing["boundingBox"]) > 0.35
                or center_distance(component["boundingBox"], existing["boundingBox"]) < 2.2
            )
            for existing in deduped
        ):
            continue
        deduped.append(component)
    return deduped[:MAX_COMPONENTS_PER_ANALYSIS]


def extract_template_matches(
    result: np.ndarray,
    template_width: int,
    template_height: int,
    image_width: int,
    image_height: int,
    score_threshold: float,
    annotation_box: dict,
    component_type: str,
    existing_matches: list[dict],
) -> list[tuple[dict, float]]:
    kernel = np.ones((LOCAL_MAX_KERNEL_SIZE, LOCAL_MAX_KERNEL_SIZE), np.uint8)
    dilated = cv2.dilate(result, kernel)
    local_maxima = result == dilated
    candidate_positions = np.argwhere((result >= score_threshold) & local_maxima)
    if candidate_positions.size == 0:
        return []

    candidates: list[tuple[dict, float]] = []
    sorted_positions = sorted(
        candidate_positions.tolist(),
        key=lambda pos: float(result[pos[0], pos[1]]),
        reverse=True,
    )
    for y, x in sorted_positions:
        box = normalize_box({
            "x": (x / image_width) * 100,
            "y": (y / image_height) * 100,
            "width": (template_width / image_width) * 100,
            "height": (template_height / image_height) * 100,
        })
        if iou(box, annotation_box) > 0.45:
            continue
        if any(
            match.get("type") == component_type
            and (
                iou(box, match["boundingBox"]) > 0.28
                or center_distance(box, match["boundingBox"]) < 2.6
            )
            for match in existing_matches
        ):
            continue
        if any(iou(box, existing_box) > 0.28 or center_distance(box, existing_box) < 2.6 for existing_box, _ in candidates):
            continue
        candidates.append((box, round(float(result[y, x]) * 100, 1)))
        if len(candidates) >= MAX_TEMPLATE_MATCHES_PER_ANNOTATION:
            break
    return candidates


def load_image(image_path: Path) -> np.ndarray:
    if image_path.suffix.lower() == ".svg":
        raise ValueError("Les SVG personnalisés ne sont pas analysables par OpenCV dans cette version.")
    image = cv2.imread(str(image_path))
    if image is None:
        raise ValueError(f"Impossible de lire l'image: {image_path}")
    return image


def crop_box(image: np.ndarray, bounding_box: dict) -> np.ndarray:
    height, width = image.shape[:2]
    x = int((bounding_box["x"] / 100) * width)
    y = int((bounding_box["y"] / 100) * height)
    w = int((bounding_box["width"] / 100) * width)
    h = int((bounding_box["height"] / 100) * height)
    x = max(0, min(width - 1, x))
    y = max(0, min(height - 1, y))
    w = max(1, min(width - x, w))
    h = max(1, min(height - y, h))
    return image[y:y + h, x:x + w]


def rotate_image(image: np.ndarray, angle: int) -> np.ndarray:
    if angle == 0:
        return image
    if angle == 90:
        return cv2.rotate(image, cv2.ROTATE_90_CLOCKWISE)
    if angle == 180:
        return cv2.rotate(image, cv2.ROTATE_180)
    if angle == 270:
        return cv2.rotate(image, cv2.ROTATE_90_COUNTERCLOCKWISE)
    return image


def _detect_bus_bars(hsv: np.ndarray, width: int, height: int) -> list[dict]:
    mask1 = cv2.inRange(hsv, np.array([0, 90, 90]), np.array([10, 255, 255]))
    mask2 = cv2.inRange(hsv, np.array([160, 90, 90]), np.array([180, 255, 255]))
    mask = cv2.bitwise_or(mask1, mask2)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    detections = []
    counter = 1
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        if w < width * 0.18 or h > height * 0.2 or w / max(h, 1) < 4:
            continue
        detections.append({
            "id": f"comp-bus-{counter}",
            "type": "bus-bar",
            "name": f"BB{counter}",
            "boundingBox": to_percent_box(x, y, w, h, width, height),
            "confidence": 92,
            "connections": [],
            "voltage": "480V",
            "metadata": {"source": "opencv", "color": "red"},
        })
        counter += 1
    return detections


def _detect_colored_boxes(hsv: np.ndarray, width: int, height: int, kind: str) -> list[dict]:
    if kind == "motor":
        mask = cv2.inRange(hsv, np.array([95, 60, 50]), np.array([125, 255, 255]))
        confidence = 88
    else:
        mask = cv2.inRange(hsv, np.array([18, 60, 140]), np.array([40, 255, 255]))
        confidence = 85
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    detections = []
    counter = 1
    component_type = kind if kind != "motor" else "motor"
    prefix = "M" if kind == "motor" else "PM"
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        if w < 20 or h < 16:
            continue
        detections.append({
            "id": f"comp-{kind}-{counter}",
            "type": component_type,
            "name": f"{prefix}{counter}",
            "boundingBox": to_percent_box(x, y, w, h, width, height),
            "confidence": confidence,
            "connections": [],
            "metadata": {"source": "opencv", "color": kind},
        })
        counter += 1
    return detections


def _detect_dark_rectangles(binary: np.ndarray, width: int, height: int) -> list[dict]:
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    detections = []
    counter = 1
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        area = cv2.contourArea(contour)
        if area < 100 or w < 8 or h < 8:
            continue
        aspect = w / max(h, 1)
        if 0.5 <= aspect <= 1.8 and 15 <= h <= 80 and 10 <= w <= 80 and y > height * 0.45:
            detections.append({
                "id": f"comp-breaker-{counter}",
                "type": "breaker",
                "name": f"CB-{counter}",
                "boundingBox": to_percent_box(x, y, w, h, width, height),
                "confidence": 84 + min(14, area / 100),
                "connections": [],
                "metadata": {"source": "opencv", "shape": "dark-rectangle"},
            })
            counter += 1
    return detections


def _detect_circular_symbols(binary: np.ndarray, width: int, height: int) -> list[dict]:
    circles = cv2.HoughCircles(binary, cv2.HOUGH_GRADIENT, dp=1.2, minDist=40, param1=120, param2=12, minRadius=12, maxRadius=80)
    detections = []
    if circles is None:
        return detections
    transformer_count = 1
    for circle in np.round(circles[0, :]).astype(int):
        x, y, radius = circle
        component_type = "transformer" if y < height * 0.6 else "motor"
        name = f"T{transformer_count}" if component_type == "transformer" else f"M{transformer_count}"
        detections.append({
            "id": f"comp-circle-{transformer_count}-{component_type}",
            "type": component_type,
            "name": name,
            "boundingBox": to_percent_box(x - radius, y - radius, radius * 2, radius * 2, width, height),
            "confidence": 90 if component_type == "transformer" else 82,
            "connections": [],
            "metadata": {"source": "opencv", "shape": "circle"},
        })
        transformer_count += 1
    return detections


def _detect_switches(binary: np.ndarray, width: int, height: int) -> list[dict]:
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    detections = []
    counter = 1
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        if y > height * 0.35 or w < 10 or h < 10 or w > 60 or h > 60:
            continue
        aspect = w / max(h, 1)
        if 0.6 <= aspect <= 1.5:
            detections.append({
                "id": f"comp-switch-{counter}",
                "type": "switch",
                "name": f"SW{counter}",
                "boundingBox": to_percent_box(x, y, w, h, width, height),
                "confidence": 80,
                "connections": [],
                "metadata": {"source": "opencv", "position": "top"},
            })
            counter += 1
    return detections


def to_percent_box(x: int, y: int, w: int, h: int, width: int, height: int) -> dict:
    return normalize_box({
        "x": (x / width) * 100,
        "y": (y / height) * 100,
        "width": (w / width) * 100,
        "height": (h / height) * 100,
    })


def iou(first: dict, second: dict) -> float:
    ax1, ay1, ax2, ay2 = first["x"], first["y"], first["x"] + first["width"], first["y"] + first["height"]
    bx1, by1, bx2, by2 = second["x"], second["y"], second["x"] + second["width"], second["y"] + second["height"]
    inter_x1 = max(ax1, bx1)
    inter_y1 = max(ay1, by1)
    inter_x2 = min(ax2, bx2)
    inter_y2 = min(ay2, by2)
    inter_w = max(0.0, inter_x2 - inter_x1)
    inter_h = max(0.0, inter_y2 - inter_y1)
    inter = inter_w * inter_h
    area_a = first["width"] * first["height"]
    area_b = second["width"] * second["height"]
    union = area_a + area_b - inter
    return inter / union if union else 0.0


def center_distance(first: dict, second: dict) -> float:
    first_center_x = first["x"] + first["width"] / 2
    first_center_y = first["y"] + first["height"] / 2
    second_center_x = second["x"] + second["width"] / 2
    second_center_y = second["y"] + second["height"] / 2
    return ((first_center_x - second_center_x) ** 2 + (first_center_y - second_center_y) ** 2) ** 0.5


def center_x(component: dict) -> float:
    box = component["boundingBox"]
    return box["x"] + box["width"] / 2
