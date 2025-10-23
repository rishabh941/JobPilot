# 🔍 JobPilot Scraper - User Guide

## ✅ Your Scraper UI is Ready!

The scraper interface is **already built** and available at:
```
http://localhost:5173/scraper
```

**Note:** Make sure you're typing `/scraper` (single 'c'), not `/sccraper` (double 'c')

---

## 🚀 Quick Start

### 1. Start All Services

You need 3 services running:

**Option A: Use the automated script (Recommended)**
```powershell
.\start-all-services.ps1
```

**Option B: Start manually in 3 separate terminals**

Terminal 1 - FastAPI:
```powershell
cd jobpilot-scraper\naukri
uvicorn app:app --host 0.0.0.0 --port 5000 --reload
```

Terminal 2 - Spring Boot:
```powershell
cd demo
.\mvnw.cmd spring-boot:run
```

Terminal 3 - React:
```powershell
cd jobpilot-dashboard
npm install  # First time only
npm run dev
```

### 2. Access the Scraper

Open your browser and go to:
```
http://localhost:5173/scraper
```

### 3. Fill the Form

**Required:**
- **Job Role**: e.g., "Software Engineer", "Full Stack Developer"
- **Location**: e.g., "Bengaluru", "Mumbai", "Pune"

**Optional:**
- **Experience Filter**: Select your experience range
- **Posted Within**: How recent the jobs should be
- **Number of Pages**: 1-10 (each page ≈ 20 jobs)

### 4. Start Scraping

Click the **"Start Scraping"** button and wait 30-60 seconds.

### 5. View Results

- Success message will show number of jobs found
- Go to **Jobs** page to see all scraped jobs
- Jobs will have "pending" status initially

---

## 📋 Form Fields Explained

### Job Role (Required)
The position you're looking for.

**Examples:**
- Software Engineer
- Full Stack Developer
- Backend Developer
- Frontend Developer
- React Developer
- Java Developer
- Python Developer
- DevOps Engineer

### Location (Required)
The city where you want to work.

**Popular Cities:**
- Bengaluru (Bangalore)
- Mumbai
- Pune
- Hyderabad
- Delhi
- Noida
- Gurgaon
- Chennai
- Kolkata

### Experience Filter (Optional)
Your years of experience.

**Options:**
- All Experience (default)
- 0-1 years (Fresher/Entry-level)
- 0-2 years (Entry-level)
- 2-5 years (Mid-level)
- 5-10 years (Senior)
- 10-15 years (Lead/Principal)

### Posted Within (Optional)
How recently the job was posted.

**Options:**
- Any time (default)
- Last 24 hours
- Last 3 days
- Last 7 days
- Last 15 days
- Last 30 days

### Number of Pages
How many result pages to scrape.

**Range:** 1-10 pages
**Note:** Each page contains approximately 20 jobs

---

## 💡 Example Scenarios

### Scenario 1: Fresh Graduate
```
Role: Software Engineer
Location: Bengaluru
Experience: 0-1 years
Posted: Last 7 days
Pages: 2
```
**Result:** ~40 entry-level jobs posted in the last week

### Scenario 2: Experienced Developer
```
Role: Full Stack Developer
Location: Mumbai
Experience: 2-5 years
Posted: Last 15 days
Pages: 3
```
**Result:** ~60 mid-level jobs posted in the last 2 weeks

### Scenario 3: Specific Technology
```
Role: React Developer
Location: Pune
Experience: (leave empty)
Posted: (leave empty)
Pages: 5
```
**Result:** ~100 React jobs of all experience levels

---

## 🎯 What Happens When You Click "Start Scraping"

1. **Form Validation**
   - Checks if Role and Location are filled
   - Shows error if required fields are missing

2. **API Call**
   - Sends request to Spring Boot backend
   - Backend calls FastAPI scraper
   - Scraper uses Playwright to browse Naukri.com

3. **Scraping Process** (30-60 seconds)
   - Opens headless Chrome browser
   - Navigates to Naukri with your filters
   - Scrolls through pages
   - Extracts job data
   - Filters by experience (if specified)

4. **Data Processing**
   - Normalizes job data
   - Classifies jobs by category
   - Checks for duplicates
   - Saves to MongoDB

5. **Results Display**
   - Shows success message with count
   - Or shows warning if no jobs found
   - Or shows error if something went wrong

---

## 🎨 UI Features

### Loading State
When scraping is in progress, you'll see:
- Button changes to "Scraping in progress..."
- Spinning loader icon
- Blue progress indicator
- Message: "This may take 30-60 seconds"

### Success State
When scraping completes successfully:
- Green success box
- Checkmark icon
- Message: "Successfully scraped X new jobs!"
- Link to view jobs

### No Results State
When no new jobs are found:
- Yellow warning box
- Alert icon
- Message: "No new jobs found"

### Error State
When scraping fails:
- Red error toast notification
- Detailed error message
- Helpful suggestions

---

## 🐛 Troubleshooting

### "Nothing is showing" at the scraper page

**Check the URL:**
- ✅ Correct: `http://localhost:5173/scraper`
- ❌ Wrong: `http://localhost:5173/sccraper` (double 'c')

**Check if frontend is running:**
```powershell
# Should show "VITE ready" message
cd jobpilot-dashboard
npm run dev
```

**Check browser console (F12):**
- Look for any error messages
- Check Network tab for failed requests

### "Connection refused" or "Failed to start scraping"

**Cause:** Backend services not running

**Check FastAPI (Port 5000):**
```powershell
curl http://localhost:5000/docs
```

**Check Spring Boot (Port 8080):**
```powershell
curl http://localhost:8080/api/jobs
```

**Start missing services:**
```powershell
# FastAPI
cd jobpilot-scraper\naukri
uvicorn app:app --host 0.0.0.0 --port 5000 --reload

# Spring Boot
cd demo
.\mvnw.cmd spring-boot:run
```

### Scraping is very slow or times out

**Causes:**
- Too many pages selected
- Slow internet connection
- Naukri.com is slow/down

**Solutions:**
- Start with 1-2 pages
- Check internet connection
- Try again later
- Use fewer filters

### "No new jobs found"

**Causes:**
- All matching jobs already in database
- Filters too restrictive
- No jobs available for that criteria

**Solutions:**
- Remove experience filter
- Remove posted date filter
- Try different location
- Try different role
- Increase number of pages

### Jobs not showing in Jobs page

**Possible causes:**
- Jobs were duplicates (already in database)
- Database connection issue
- Need to refresh the page

**Solutions:**
- Refresh the Jobs page (F5)
- Check if jobs exist: `http://localhost:8080/api/jobs`
- Check MongoDB connection

---

## 📊 Understanding the Results

### Duplicate Handling
The system automatically prevents duplicate jobs using a hash of:
- Job Title
- Company Name
- Location

If a job already exists, it won't be added again.

### Job Status
All newly scraped jobs have status: **"pending"**

You can update status to:
- **"applied"** - After you apply
- **"failed"** - If application failed

### Job Data
Each scraped job contains:
- Title
- Company
- Location
- Experience required
- Skills
- Posted date
- Job URL (link to Naukri)
- Job type (Full-time, Part-time, etc.)
- Seniority level (Entry, Mid, Senior)
- Category (Software Development, etc.)

---

## 🔗 Related Pages

### Jobs Page (`/jobs`)
- View all scraped jobs
- Filter and search
- Update job status
- View job details
- Click job URL to apply on Naukri

### Dashboard (`/dashboard`)
- Overview of all jobs
- Statistics
- Recent activity

### Auto Apply (`/autoapply`)
- Automatically apply to jobs
- Configure limits
- View application history

---

## 📝 Tips for Best Results

1. **Start Small**
   - Begin with 1-2 pages
   - Test with broad filters
   - Gradually increase pages

2. **Use Specific Roles**
   - "Software Engineer" is better than "Engineer"
   - "React Developer" is better than "Developer"

3. **Popular Locations**
   - Use common city names
   - "Bengaluru" or "Bangalore" both work
   - "Mumbai" not "Bombay"

4. **Experience Filters**
   - Use if you want targeted results
   - Leave empty for all levels
   - Fresher? Use "0-1 years"

5. **Posted Date**
   - "Last 7 days" for recent jobs
   - Leave empty for all jobs
   - Older jobs may already be filled

6. **Number of Pages**
   - 1-2 pages for quick test
   - 3-5 pages for good coverage
   - 10 pages for comprehensive search

---

## 🎉 Success Checklist

- ✅ All 3 services running
- ✅ Frontend accessible at `http://localhost:5173`
- ✅ Scraper page loads at `http://localhost:5173/scraper`
- ✅ Form is visible and interactive
- ✅ Can fill all fields
- ✅ "Start Scraping" button works
- ✅ Loading indicator shows during scraping
- ✅ Results display after scraping
- ✅ Jobs appear in Jobs page

---

## 🆘 Still Need Help?

1. **Verify all services:**
   ```powershell
   .\verify-services.ps1
   ```

2. **Check logs:**
   - FastAPI terminal: Look for scraping logs
   - Spring Boot terminal: Look for API calls
   - React terminal: Look for build errors
   - Browser console (F12): Look for JS errors

3. **Test the API directly:**
   ```
   http://localhost:8080/api/jobs/scrape?role=Software%20Engineer&location=Bengaluru&pages=1
   ```

4. **Common mistakes:**
   - Wrong URL (typo in `/scraper`)
   - Services not running
   - Port conflicts
   - Firewall blocking ports

---

## 📚 Additional Resources

- **Frontend Setup:** See `FRONTEND_SETUP_GUIDE.md`
- **Backend Setup:** See `README_SCRAPER_FEATURE.md`
- **API Documentation:** `http://localhost:5000/docs`

---

**Remember:** The correct URL is `http://localhost:5173/scraper` (single 'c')!