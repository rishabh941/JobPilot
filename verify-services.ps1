# JobPilot - Service Verification Script
# Checks if all required services are running

Write-Host "🔍 JobPilot Service Verification" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Test 1: FastAPI Scraper (Port 5000)
Write-Host "1️⃣ Checking FastAPI Scraper (Port 5000)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/docs" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ FastAPI is running!" -ForegroundColor Green
        Write-Host "   📄 Docs: http://localhost:5000/docs" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ FastAPI is NOT running" -ForegroundColor Red
    Write-Host "   💡 Start with: cd jobpilot-scraper\naukri; uvicorn app:app --host 0.0.0.0 --port 5000 --reload" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""

# Test 2: Spring Boot Backend (Port 8080)
Write-Host "2️⃣ Checking Spring Boot Backend (Port 8080)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/jobs" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Spring Boot is running!" -ForegroundColor Green
        Write-Host "   📄 API: http://localhost:8080/api/jobs" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Spring Boot is NOT running" -ForegroundColor Red
    Write-Host "   💡 Start with: cd demo; .\mvnw.cmd spring-boot:run" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""

# Test 3: React Frontend (Port 5173)
Write-Host "3️⃣ Checking React Frontend (Port 5173)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ React Frontend is running!" -ForegroundColor Green
        Write-Host "   📄 App: http://localhost:5173" -ForegroundColor Gray
        Write-Host "   🔍 Scraper: http://localhost:5173/scraper" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ❌ React Frontend is NOT running" -ForegroundColor Red
    Write-Host "   💡 Start with: cd jobpilot-dashboard; npm run dev" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "✅ All services are running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 Ready to use the scraper:" -ForegroundColor Yellow
    Write-Host "   Open: http://localhost:5173/scraper" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📝 Quick Test:" -ForegroundColor Yellow
    Write-Host "   1. Go to http://localhost:5173/scraper" -ForegroundColor White
    Write-Host "   2. Fill: Role='Software Engineer', Location='Bengaluru', Pages=1" -ForegroundColor White
    Write-Host "   3. Click 'Start Scraping'" -ForegroundColor White
    Write-Host "   4. Wait 30-60 seconds for results" -ForegroundColor White
} else {
    Write-Host "❌ Some services are not running" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Quick fix: Run this command to start all services:" -ForegroundColor Yellow
    Write-Host "   .\start-all-services.ps1" -ForegroundColor Cyan
}

Write-Host ""