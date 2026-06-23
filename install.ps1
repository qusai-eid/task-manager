# Install all dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\backend"
npm install

Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\frontend"
npm install

Write-Host "Done! Run .\start.ps1 to launch the app." -ForegroundColor Green
Set-Location $PSScriptRoot
