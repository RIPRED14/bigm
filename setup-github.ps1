# Script pour mettre en place le dépôt GitHub pour Burger Staff Sync

Write-Host "Configuration du dépôt GitHub pour Burger Staff Sync" -ForegroundColor Cyan

# Vérifier si git est installé
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git n'est pas installé. Veuillez l'installer avant de continuer." -ForegroundColor Red
    exit 1
}

# Vérifier si nous sommes déjà dans un dépôt git
if (-not (Test-Path .git)) {
    Write-Host "Initialisation du dépôt Git..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit"
} else {
    Write-Host "Le dépôt Git est déjà initialisé." -ForegroundColor Green
}

# Demander l'URL du dépôt GitHub
$githubUrl = Read-Host "Entrez l'URL du dépôt GitHub (ex: https://github.com/votre-nom/burger-staff-sync.git)"

if (-not $githubUrl) {
    Write-Host "URL non fournie. Sortie du script." -ForegroundColor Red
    exit 1
}

# Vérifier si origin existe déjà
$remoteExists = git remote | Where-Object { $_ -eq "origin" }
if ($remoteExists) {
    Write-Host "Le remote 'origin' existe déjà. Mise à jour..." -ForegroundColor Yellow
    git remote set-url origin $githubUrl
} else {
    Write-Host "Ajout du remote 'origin'..." -ForegroundColor Yellow
    git remote add origin $githubUrl
}

# Pousser vers GitHub
Write-Host "Pousser vers GitHub..." -ForegroundColor Cyan
git push -u origin main

Write-Host "Configuration terminée avec succès!" -ForegroundColor Green
Write-Host "Votre code est maintenant disponible sur: $githubUrl" -ForegroundColor Cyan
