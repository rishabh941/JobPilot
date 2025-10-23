# JobPilot - Start All Services
# This script starts FastAPI Scraper, Spring Boot Backend, and React Frontend

Write-Host "🚀 Starting JobPilot - All Services" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

# Check Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check Java
try {
    $javaVersion = java -version 2>&1 | Select-Object -First 1
    Write-Host "✅ Java found" -ForegroundColor Green
} catch {
    Write-Host "❌ Java not found. Please install Java 17+" -ForegroundColor Red
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Starting services in separate windows..." -ForegroundColor Cyan
Write-Host ""

# Service 1: FastAPI Scraper (Port 5000)
Write-Host "1️⃣ Starting FastAPI Scraper on port 5000..." -ForegroundColor Cyan
$scraperPath = Join-Path $PSScriptRoot "jobpilot-scraper\naukri"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scraperPath'; Write-Host '🐍 FastAPI Scraper' -ForegroundColor Cyan; Write-Host 'Port: 5000' -ForegroundColor Yellow; Write-Host ''; uvicorn app:app --host 0.0.0.0 --port 5000 --reload"

Start-Sleep -Seconds 2

# Service 2: Spring Boot Backend (Port 8080)
Write-Host "2️⃣ Starting Spring Boot Backend on port 8080..." -ForegroundColor Cyan
$backendPath = Join-Path $PSScriptRoot "demo"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '☕ Spring Boot Backend' -ForegroundColor Cyan; Write-Host 'Port: 8080' -ForegroundColor Yellow; Write-Host ''; .\mvnw.cmd spring-boot:run"

Start-Sleep -Seconds 2

# Service 3: React Frontend (Port 5173)
Write-Host "3️⃣ Starting React Frontend on port 5173..." -ForegroundColor Cyan
$frontendPath = Join-Path $PSScriptRoot "jobpilot-dashboard"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '⚛️ React Frontend' -ForegroundColor Cyan; Write-Host 'Port: 5173' -ForegroundColor Yellow; Write-Host ''; npm run dev"

Write-Host ""
Write-Host "✅ All services are starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "⏳ Please wait 30-60 seconds for all services to start..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Service URLs:" -ForegroundColor Cyan
Write-Host "   🐍 FastAPI Docs:    http://localhost:5000/docs" -ForegroundColor White
Write-Host "   ☕ Spring Boot API:  http://localhost:8080/api/jobs" -ForegroundColor White
Write-Host "   ⚛️ React Frontend:   http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "🎯 To use the scraper:" -ForegroundColor Yellow
Write-Host "   1. Wait for all services to start (check the 3 terminal windows)" -ForegroundColor White
Write-Host "   2. Open: http://localhost:5173/scraper" -ForegroundColor Cyan
Write-Host "   3. Fill the form and click 'Start Scraping'" -ForegroundColor White
Write-Host ""
Write-Host "📚 For detailed guide, see: FRONTEND_SETUP_GUIDE.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this window (services will keep running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")