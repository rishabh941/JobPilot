# Test script to verify JobPilot Scraper is working

Write-Host "🧪 Testing JobPilot Scraper Setup..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if FastAPI is running
Write-Host "1️⃣ Checking FastAPI (port 5000)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/docs" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ FastAPI is running!" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ FastAPI is NOT running on port 5000" -ForegroundColor Red
    Write-Host "   💡 Start it with: cd jobpilot-scraper\naukri; uvicorn app:app --host 0.0.0.0 --port 5000 --reload" -ForegroundColor Yellow
}

Write-Host ""

# Test 2: Check if Spring Boot is running
Write-Host "2️⃣ Checking Spring Boot (port 8080)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/jobs" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Spring Boot is running!" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Spring Boot is NOT running on port 8080" -ForegroundColor Red
    Write-Host "   💡 Start it with: cd demo; .\mvnw.cmd spring-boot:run" -ForegroundColor Yellow
}

Write-Host ""

# Test 3: Try a sample scrape request
Write-Host "3️⃣ Testing scrape endpoint..." -ForegroundColor Yellow
try {
    $url = "http://localhost:8080/api/jobs/scrape?role=Software%20Engineer&location=Bengaluru&pages=1"
    Write-Host "   📡 Sending request to: $url" -ForegroundColor Cyan
    
    $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 60
    
    if ($response) {
        Write-Host "   ✅ Scraping works! Found jobs." -ForegroundColor Green
        Write-Host "   📊 Response preview:" -ForegroundColor Cyan
        $response | ConvertTo-Json -Depth 2 | Write-Host
    }
} catch {
    Write-Host "   ❌ Scraping failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   💡 Make sure both services are running" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🏁 Test complete!" -ForegroundColor Green