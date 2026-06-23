# Start both backend and frontend dev servers
Write-Host "Starting TaskFlow..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'backend'; npm run dev" -WorkingDirectory $PSScriptRoot
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'frontend'; npm run dev" -WorkingDirectory $PSScriptRoot

Write-Host "Backend:  http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
