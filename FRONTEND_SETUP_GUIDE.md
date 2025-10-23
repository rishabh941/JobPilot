# 🎨 JobPilot Frontend Setup Guide

## ✅ Your Scraper UI is Already Built!

The scraper interface you requested is **already fully implemented** at `http://localhost:5173/scraper`

---

## 🚀 Quick Start (3 Services to Run)

You need to run **3 services** in separate terminals:

### Terminal 1: FastAPI Scraper (Port 5000)
```powershell
cd jobpilot-scraper\naukri
uvicorn app:app --host 0.0.0.0 --port 5000 --reload
```

### Terminal 2: Spring Boot Backend (Port 8080)
```powershell
cd demo
.\mvnw.cmd spring-boot:run
```

### Terminal 3: React Frontend (Port 5173)
```powershell
cd jobpilot-dashboard
npm install
npm run dev
```

---

## 🌐 Access the Application

Once all services are running:

1. **Open your browser**: `http://localhost:5173`
2. **Navigate to Scraper**: Click "Scraper" in the sidebar OR go to `http://localhost:5173/scraper`
3. **Fill the form**:
   - Job Role (required): e.g., "Software Engineer"
   - Location (required): e.g., "Bengaluru", "Mumbai", "Pune"
   - Experience Filter (optional): Select range like "0-1 years"
   - Posted Within (optional): Select "Last 7 days", "Last 15 days", etc.
   - Number of Pages: 1-10 (each page ≈ 20 jobs)
4. **Click "Start Scraping"**
5. **Wait 30-60 seconds** for results
6. **View scraped jobs** in the Jobs page

---

## 📱 Application Features

### 🏠 Dashboard (`/dashboard`)
- Overview of job statistics
- Recent jobs
- Quick actions

### 💼 Jobs (`/jobs`)
- View all scraped jobs
- Filter by type, seniority, location
- Update job status (pending/applied/failed)
- View job details

### 🔍 Scraper (`/scraper`) ⭐ **THIS IS WHAT YOU NEED**
- **Form to configure scraping**:
  - Job Role (required)
  - Location (required)
  - Experience Filter (optional)
  - Posted date filter (optional)
  - Number of pages (1-10)
- **Real-time status updates**
- **Results display**
- **Error handling with helpful messages**

### ⚡ Auto Apply (`/autoapply`)
- Automatically apply to jobs
- Configure application limits
- View application history

### ⚙️ Settings (`/settings`)
- Application configuration
- API settings

---

## 🎯 How to Use the Scraper

### Step 1: Fill the Form

**Required Fields:**
- **Job Role**: The position you're looking for
  - Examples: "Software Engineer", "Full Stack Developer", "React Developer"
  
- **Location**: City where you want to work
  - Examples: "Bengaluru", "Mumbai", "Pune", "Hyderabad", "Delhi"

**Optional Filters:**
- **Experience Filter**: Your experience level
  - Options: "0-1 years", "0-2 years", "2-5 years", "5-10 years", "10-15 years"
  
- **Posted Within**: How recent the jobs should be
  - Options: "Last 24 hours", "Last 3 days", "Last 7 days", "Last 15 days", "Last 30 days"
  
- **Number of Pages**: How many result pages to scrape
  - Range: 1-10 pages
  - Note: Each page contains approximately 20 jobs

### Step 2: Click "Start Scraping"

The button will show:
- 🔍 "Start Scraping" (ready state)
- ⏳ "Scraping in progress..." (loading state)

### Step 3: Wait for Results

You'll see:
- A blue progress indicator while scraping
- "Scraping Naukri.com... This may take 30-60 seconds"
- Success message with number of jobs found
- Or warning if no new jobs match your criteria

### Step 4: View Jobs

- Navigate to the **Jobs** page to see all scraped jobs
- Jobs will have status "pending" initially
- You can update status to "applied" or "failed"

---

## 🐛 Troubleshooting

### Issue 1: "Nothing is showing" at localhost:5173/scraper

**Possible Causes:**
1. ❌ Frontend not running
2. ❌ Wrong URL (typo in URL)
3. ❌ Port 5173 is blocked

**Solutions:**

**Check if frontend is running:**
```powershell
# In jobpilot-dashboard folder
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Correct URLs:**
- ✅ `http://localhost:5173/scraper` (correct)
- ❌ `http://localhost:5173/sccraper` (typo - double 'c')

**If port 5173 is in use:**
```powershell
# Kill the process using port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- --port 3000
```

### Issue 2: "Failed to start scraping: Connection refused"

**Cause:** FastAPI scraper is not running

**Solution:**
```powershell
cd jobpilot-scraper\naukri
uvicorn app:app --host 0.0.0.0 --port 5000 --reload
```

### Issue 3: "Failed to start scraping: 404 Not Found"

**Cause:** Spring Boot backend is not running

**Solution:**
```powershell
cd demo
.\mvnw.cmd spring-boot:run
```

### Issue 4: Scraping takes too long or times out

**Causes:**
- Too many pages selected
- Slow internet connection
- Naukri.com is slow

**Solutions:**
- Start with 1-2 pages
- Check your internet connection
- Try again later

### Issue 5: "No new jobs found"

**Causes:**
- Filters too restrictive
- All matching jobs already in database
- No jobs available for that criteria on Naukri

**Solutions:**
- Broaden your filters (remove experience/posted filters)
- Try different location
- Try different role
- Increase number of pages

---

## 📊 Understanding the Results

### Success Response
```
✅ Successfully scraped 15 new jobs!
Check the Jobs page to view and manage them
```

### No Results
```
⚠️ No new jobs found
```
This means either:
- No jobs match your criteria on Naukri
- All matching jobs are already in your database

### Error Response
```
❌ Scraping failed: [error message]
```
Check the error message for specific issue

---

## 🔗 API Flow

```
Frontend Form (localhost:5173/scraper)
    ↓
    Submits to Spring Boot (localhost:8080/api/jobs/scrape)
    ↓
    Calls FastAPI (localhost:5000/scrape-jobs)
    ↓
    Playwright scrapes Naukri.com
    ↓
    Returns jobs to Spring Boot
    ↓
    Saves to MongoDB
    ↓
    Returns saved jobs to Frontend
    ↓
    Displays results
```

---

## 📁 Frontend File Structure

```
jobpilot-dashboard/
├── src/
│   ├── pages/
│   │   └── Scraper.tsx          # Main scraper page
│   ├── components/
│   │   └── scraper/
│   │       ├── ScraperForm.tsx  # Form component ⭐
│   │       └── ScraperStatus.tsx # Status display
│   ├── hooks/
│   │   └── useJobs.ts           # API hooks
│   ├── lib/
│   │   ├── api.ts               # API client
│   │   └── types.ts             # TypeScript types
│   └── App.tsx                  # Routing
```

---

## 🎨 UI Features

### Form Features
- ✅ Input validation
- ✅ Required field indicators
- ✅ Dropdown selects for filters
- ✅ Number input for pages
- ✅ Disabled state during scraping
- ✅ Loading spinner
- ✅ Real-time feedback

### Status Display
- ✅ Current scraper status
- ✅ Total jobs in database
- ✅ Last update time
- ✅ Recent activity

### Results Display
- ✅ Success message with count
- ✅ Warning for no results
- ✅ Error messages with details
- ✅ Link to view jobs

---

## 🔧 Configuration

### Environment Variables

Create `.env` file in `jobpilot-dashboard/`:
```env
VITE_API_BASE=http://localhost:8080
```

### API Base URL

The frontend automatically connects to:
- Spring Boot: `http://localhost:8080`
- Can be changed in `.env` file

---

## 📝 Example Scraping Scenarios

### Scenario 1: Entry-Level Software Engineer in Bengaluru
```
Role: Software Engineer
Location: Bengaluru
Experience: 0-1 years
Posted: Last 7 days
Pages: 2
```
**Expected:** 20-40 entry-level jobs

### Scenario 2: Full Stack Developer in Mumbai
```
Role: Full Stack Developer
Location: Mumbai
Experience: 2-5 years
Posted: Last 15 days
Pages: 3
```
**Expected:** 40-60 mid-level jobs

### Scenario 3: React Developer (Any Experience)
```
Role: React Developer
Location: Pune
Experience: (leave empty)
Posted: (leave empty)
Pages: 5
```
**Expected:** 80-100 jobs of all levels

---

## 🎉 Summary

Your scraper UI is **fully functional**! Just:

1. ✅ Start all 3 services (FastAPI, Spring Boot, React)
2. ✅ Open `http://localhost:5173/scraper` (note: single 'c' in scraper)
3. ✅ Fill the form with your criteria
4. ✅ Click "Start Scraping"
5. ✅ Wait for results
6. ✅ View jobs in the Jobs page

**Common Mistake:** Make sure you're accessing `/scraper` not `/sccraper` (double 'c')

---

## 🆘 Still Having Issues?

1. **Check all services are running:**
   ```powershell
   # Check FastAPI
   curl http://localhost:5000/docs
   
   # Check Spring Boot
   curl http://localhost:8080/api/jobs
   
   # Check Frontend
   curl http://localhost:5173
   ```

2. **Check browser console** (F12) for errors

3. **Check terminal logs** for all 3 services

4. **Verify the URL** is exactly `http://localhost:5173/scraper`

---

Need help? Check the logs in each terminal window for detailed error messages!