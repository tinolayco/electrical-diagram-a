$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m PyInstaller --noconfirm ischemateur_flask.spec

Write-Host "Build termine. Executable disponible dans dist/iSchemateur-Flask/"
