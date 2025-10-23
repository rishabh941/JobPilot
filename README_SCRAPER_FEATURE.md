# 🎯 JobPilot Scraper Feature - Complete Guide

## ✅ Feature Status: **ALREADY IMPLEMENTED**

Good news! The scraping feature you requested is **already fully implemented** in your codebase. This guide will show you how to use it.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     YOUR REQUEST                                 │
│  http://localhost:8080/api/jobs/scrape?role=...&location=...    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Spring Boot Backend (Port 8080)                     │
│  ┌──────────────┐    ┌──────────────┐    ┌─────────────┐      │
│  │JobController │───▶│  JobService  │───▶│  MongoDB    │      │
│  └──────────────┘    └──────┬───────┘    └─────────────┘      │
└────────────────────────────┼────────────────────────────────────┘
                             │ HTTP Request
                             │ (with all filters)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              FastAPI Scraper (Port 5000)                         │
│  ┌──────────────┐    ┌──────────────┐    ┌─────────────┐      │
│  │   app.py     │───▶│  scraper.py  │───▶│  Naukri.com │      │
│  │  (FastAPI)   │    │ (Playwright) │    │  (Website)  │      │
│  └──────────────┘    └──────────────┘    └─────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies

```powershell
# Install Python packages
cd jobpilot-scraper
pip install -r requirements.txt

# Install Playwright browser
playwright install chromium
```

### Step 2: Start Both Services

**Terminal 1 - Start FastAPI Scraper:**
```powershell
cd jobpilot-scraper\naukri
uvicorn app:app --host 0.0.0.0 --port 5000 --reload
```

**Terminal 2 - Start Spring Boot:**
```powershell
cd demo
.\mvnw.cmd spring-boot:run
```

**OR use the automated script:**
```powershell
.\start-scraper.ps1
```

### Step 3: Test the Feature

Open your browser or use curl:
```
http://localhost:8080/api/jobs/scrape?role=Software%20Engineer&location=Bengaluru&experience_filter=0-1&posted=7days&pages=2
```

---

## 📋 API Reference

### Endpoint
```
GET http://localhost:8080/api/jobs/scrape
```

### Parameters

| Parameter | Type | Required | Default | Description | Example Values |
|-----------|------|----------|---------|-------------|----------------|
| `role` | string | ✅ Yes | - | Job title/role to search | `Software Engineer`, `Full Stack Developer` |
| `location` | string | ✅ Yes | - | City name | `Bengaluru`, `Mumbai`, `Pune`, `Delhi` |
| `experience_filter` | string | ❌ No | All | Experience range (min-max years) | `0-1`, `2-5`, `5-10` |
| `posted` | string | ❌ No | All | How recently posted | `7days`, `15days`, `30days` |
| `pages` | integer | ❌ No | 1 | Number of pages to scrape | `1`, `2`, `5` |

---

## 💡 Example Requests

### 1. Basic Request (Minimum Parameters)
```
http://localhost:8080/api/jobs/scrape?role=Software%20Engineer&location=Bengaluru&pages=1
```

### 2. Entry-Level Jobs (0-1 years experience)
```
http://localhost:8080/api/jobs/scrape?role=Software%20Engineer&location=Bengaluru&experience_filter=0-1&posted=7days&pages=2
```

### 3. Mid-Level Jobs in Mumbai
```
http://localhost:8080/api/jobs/scrape?role=Full%20Stack%20Developer&location=Mumbai&experience_filter=2-5&posted=15days&pages=3
```

### 4. Senior Roles in Pune
```
http://localhost:8080/api/jobs/scrape?role=Senior%20Backend%20Developer&location=Pune&experience_filter=5-10&pages=2
```

### 5. Recent Postings Only
```
http://localhost:8080/api/jobs/scrape?role=React%20Developer&location=Hyderabad&posted=7days&pages=1
```

---

## 📊 Response Format

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "title": "Software Engineer",
    "company": "Tech Solutions Pvt Ltd",
    "location": "Bengaluru",
    "experience": "0-2 Yrs",
    "skills": "Java, Spring Boot, React, MongoDB",
    "posted": "2 days ago",
    "postedAt": "2025-01-15T10:30:00",
    "url": "https://www.naukri.com/job-listings/...",
    "status": "pending",
    "jobType": "Full-time",
    "seniorityLevel": "Entry Level",
    "category": "Software Development",
    "jobHash": "a1b2c3d4e5f6..."
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "title": "Junior Developer",
    "company": "Startup Inc",
    "location": "Bengaluru",
    "experience": "0-1 Yrs",
    "skills": "Python, Django, PostgreSQL",
    "posted": "Today",
    "postedAt": "2025-01-17T08:15:00",
    "url": "https://www.naukri.com/job-listings/...",
    "status": "pending",
    "jobType": "Full-time",
    "seniorityLevel": "Entry Level",
    "category": "Software Development",
    "jobHash": "b2c3d4e5f6g7..."
  }
]
```

---

## 🔍 How It Works (Behind the Scenes)

### 1. Request Flow
```
User Request → JobController → JobService → FastAPI → Scraper → Naukri.com
```

### 2. Scraping Process
1. **Playwright** launches a headless Chrome browser
2. Navigates to Naukri.com with your filters
3. Scrolls through pages to load lazy content
4. Extracts job data using **BeautifulSoup**
5. Filters by experience range
6. Returns JSON data

### 3. Data Processing
1. **Normalization**: Cleans and standardizes data
2. **Classification**: Categorizes jobs (AI-powered)
3. **Deduplication**: Uses hash (title + company + location)
4. **Storage**: Saves to MongoDB
5. **Response**: Returns saved jobs

---

## 🛠️ Configuration

### Spring Boot Configuration
File: `demo/src/main/resources/application.properties`

```properties
# Scraper API URL
jobpilot.scraper.base-url=http://localhost:5000/scrape-jobs

# MongoDB
spring.data.mongodb.uri=mongodb+srv://...
spring.data.mongodb.database=jobpilot

# Server Port
server.port=8080
```

### Change Scraper Port
If you need to run FastAPI on a different port:

1. Update `application.properties`:
```properties
jobpilot.scraper.base-url=http://localhost:6000/scrape-jobs
```

2. Start FastAPI with new port:
```powershell
uvicorn app:app --host 0.0.0.0 --port 6000 --reload
```

---

## 🧪 Testing

### Using PowerShell Script
```powershell
.\test-scraper.ps1
```

### Using cURL
```bash
curl "http://localhost:8080/api/jobs/scrape?role=Software%20Engineer&location=Bengaluru&experience_filter=0-1&posted=7days&pages=2"
```

### Using Postman
1. Create new GET request
2. URL: `http://localhost:8080/api/jobs/scrape`
3. Add query params:
   - `role`: Software Engineer
   - `location`: Bengaluru
   - `experience_filter`: 0-1
   - `posted`: 7days
   - `pages`: 2
4. Send

### Using Browser
Just paste this in your browser:
```
http://localhost:8080/api/jobs/scrape?role=Software%20Engineer&location=Bengaluru&pages=1
```

---

## 🐛 Troubleshooting

### Issue 1: "Failed to fetch jobs from scraper API"
**Cause**: FastAPI is not running

**Solution**:
```powershell
cd jobpilot-scraper\naukri
uvicorn app:app --host 0.0.0.0 --port 5000 --reload
```

### Issue 2: "Connection refused" or timeout
**Cause**: Port 5000 is blocked or in use

**Solution**:
```powershell
# Check if port is in use
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <PID> /F

# Or use different port
uvicorn app:app --host 0.0.0.0 --port 6000 --reload
```

### Issue 3: No jobs returned
**Possible causes**:
- Filters too restrictive
- No matching jobs on Naukri
- Network issues

**Solution**:
- Try broader filters
- Increase `pages` parameter
- Check Naukri.com manually

### Issue 4: Playwright browser not found
**Cause**: Playwright browsers not installed

**Solution**:
```powershell
playwright install chromium
```

### Issue 5: Duplicate jobs
**This is normal!** The system automatically handles duplicates using job hash. Duplicates are not saved twice.

---

## 📁 Code Files Involved

### Backend (Spring Boot)
- `demo/src/main/java/com/example/demo/controller/JobController.java` - API endpoint
- `demo/src/main/java/com/example/demo/service/JobService.java` - Business logic
- `demo/src/main/java/com/example/demo/model/Job.java` - Data model
- `demo/src/main/resources/application.properties` - Configuration

### Scraper (Python)
- `jobpilot-scraper/naukri/app.py` - FastAPI server
- `jobpilot-scraper/naukri/scraper.py` - Scraping logic

---

## 🎯 Key Features

✅ **Dynamic Filtering**: Filter by role, location, experience, posting date
✅ **Multi-page Scraping**: Scrape multiple pages in one request
✅ **Smart Deduplication**: Prevents duplicate jobs using hash
✅ **Experience Filtering**: Accurate filtering on Python side
✅ **Auto-categorization**: AI-powered job classification
✅ **Status Tracking**: All jobs start as "pending"
✅ **Error Handling**: Graceful error handling at all levels
✅ **Logging**: Detailed logs for debugging

---

## 📚 Additional Resources

- **Detailed Setup**: See `docs/SCRAPER_SETUP.md`
- **Architecture**: See `docs/ARCHITECTURE.md`
- **API Docs**: Visit `http://localhost:5000/docs` (FastAPI auto-docs)

---

## 🎉 Summary

Your scraping feature is **fully functional**! Just:

1. ✅ Start FastAPI: `uvicorn app:app --host 0.0.0.0 --port 5000 --reload`
2. ✅ Start Spring Boot: `.\mvnw.cmd spring-boot:run`
3. ✅ Hit the endpoint with your filters

**Example**:
```
http://localhost:8080/api/jobs/scrape?role=Software%20Engineer&location=Bengaluru&experience_filter=0-1&posted=7days&pages=2
```

That's it! 🚀