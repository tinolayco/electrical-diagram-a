# iSchémateur Flask

Version Flask/Python séparée de l'exemple React présent à la racine du workspace.

## Périmètre couvert

- téléversement d'images de schémas
- chargement de l'exemple intégré
- bibliothèques multiples avec import/export JSON, CSV et XML
- entraînement supervisé par annotations manuelles
- analyse OpenCV par heuristiques et template matching
- catalogue de composants et chemins électriques
- édition de composants et bascule d'état des disjoncteurs
- export CSV du schéma courant et du catalogue
- packaging standalone Windows avec PyInstaller

## Lancement en développement

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run.py
```

Application disponible sur http://127.0.0.1:5055

## Build standalone

```powershell
.\build_standalone.ps1
```

Le binaire est généré dans dist/iSchemateur-Flask/

## Notes techniques

- Les données sont persistées localement dans le dossier instance du projet ou à côté de l'exécutable en mode standalone.
- L'exemple fourni reprend le schéma de démonstration de la version React.
- Pour les schémas personnalisés, la détection par défaut est heuristique. La meilleure précision est obtenue après annotation et entraînement de la bibliothèque active.
