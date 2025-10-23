# ⚡ JobPilot - Quick Start Guide

## 🎯 Your Scraper UI is at: `http://localhost:5173/scraper`

---

## 🚀 Start All Services (Choose One Method)

### Method 1: Automated (Recommended)
```powershell
.\start-all-services.ps1
```

### Method 2: Manual (3 Terminals)

**Terminal 1:**
```powershell
cd jobpilot-scraper\naukri
uvicorn app:app --host 0.0.0.0 --port 5000 --reload
```

**Terminal 2:**
```powershell
cd demo
.\mvnw.cmd spring-boot:run
```

**Terminal 3:**
```powershell
cd jobpilot-dashboard
npm run dev
```

---

## 🌐 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| **React Frontend** | `http://localhost:5173` | Main application |
| **Scraper Page** | `http://localhost:5173/scraper` | ⭐ **USE THIS** |
| Spring Boot API | `http://localhost:8080/api/jobs` | Backend API |
| FastAPI Docs | `http://localhost:5000/docs` | Scraper API |

---

## 📝 How to Use Scraper

1. **Open:** `http://localhost:5173/scraper`
2. **Fill Form:**
   - Role: `Software Engineer` (required)
   - Location: `Bengaluru` (required)
   - Experience: `0-1 years` (optional)
   - Posted: `Last 7 days` (optional)
   - Pages: `2` (optional)
3. **Click:** "Start Scraping"
4. **Wait:** 30-60 seconds
5. **View:** Results on screen, then go to Jobs page

---

## ✅ Verify Services

```powershell
.\verify-services.ps1
```

---

## 🐛 Common Issues

### Issue: "Nothing showing at /scraper"
**Fix:** Check URL is `http://localhost:5173/scraper` (single 'c', not double)

### Issue: "Connection refused"
**Fix:** Make sure all 3 services are running

### Issue: "No jobs found"
**Fix:** Try broader filters or different location

---

## 📚 Detailed Guides

- **Frontend Guide:** `FRONTEND_SETUP_GUIDE.md`
- **Scraper Guide:** `jobpilot-dashboard/README_SCRAPER.md`
- **Backend Guide:** `README_SCRAPER_FEATURE.md`

---

## 🎉 That's It!

Your scraper is ready at: **`http://localhost:5173/scraper`**