# JobPilot Scraper Startup Script for Windows
# This script starts both the FastAPI scraper and Spring Boot backend

Write-Host "🚀 Starting JobPilot Scraper Services..." -ForegroundColor Green
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check if Java is installed
try {
    $javaVersion = java -version 2>&1
    Write-Host "✅ Java found" -ForegroundColor Green
} catch {
    Write-Host "❌ Java not found. Please install Java 17+" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Installing Python dependencies..." -ForegroundColor Yellow
Set-Location -Path "jobpilot-scraper"
pip install -r requirements.txt
Write-Host "📦 Installing Playwright browsers..." -ForegroundColor Yellow
playwright install chromium
Set-Location -Path "naukri"

Write-Host ""
Write-Host "🔧 Starting FastAPI Scraper on port 5000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; uvicorn app:app --host 0.0.0.0 --port 5000 --reload"

Write-Host ""
Write-Host "⏳ Waiting 5 seconds for FastAPI to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🔧 Starting Spring Boot Backend on port 8080..." -ForegroundColor Cyan
Set-Location -Path "..\..\demo"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\mvnw.cmd spring-boot:run"

Write-Host ""
Write-Host "✅ Both services are starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Quick Test:" -ForegroundColor Yellow
Write-Host "   Wait 30 seconds, then visit:" -ForegroundColor White
Write-Host "   http://localhost:8080/api/jobs/scrape?role=Software%20Engineer&location=Bengaluru&pages=1" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 For more details, see docs/SCRAPER_SETUP.md" -ForegroundColor Yellow