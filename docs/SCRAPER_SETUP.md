# JobPilot Scraper Setup Guide

## Overview
The scraping feature is already implemented! This guide shows you how to use it.

## Architecture
```
┌─────────────────┐      HTTP Request       ┌──────────────────┐
│  Spring Boot    │ ──────────────────────> │  FastAPI         │
│  (Port 8080)    │                         │  (Port 5000)     │
│                 │ <────────────────────── │                  │
│  JobController  │      JSON Response      │  Naukri Scraper  │
│  JobService     │                         │  (Playwright)    │
└─────────────────┘                         └──────────────────┘
```

## Setup Steps

### 1. Start the FastAPI Scraper (Terminal 1)
```bash
cd jobpilot-scraper/naukri
uvicorn app:app --host 0.0.0.0 --port 5000 --reload
```

### 2. Start Spring Boot Backend (Terminal 2)
```bash
cd demo
./mvnw spring-boot:run
```
Or on Windows:
```bash
cd demo
mvnw.cmd spring-boot:run
```

### 3. Trigger Scraping via API

**Basic Request:**
```
GET http://localhost:8080/api/jobs/scrape?role=Software Engineer&location=Bengaluru&pages=2
```

**With All Filters:**
```
GET http://localhost:8080/api/jobs/scrape?role=Software Engineer&location=Bengaluru&experience_filter=0-1&posted=7days&pages=2
```

## API Parameters

| Parameter | Required | Default | Description | Example |
|-----------|----------|---------|-------------|---------|
| `role` | ✅ Yes | - | Job role to search | `Software Engineer` |
| `location` | ✅ Yes | - | City/location | `Bengaluru`, `Mumbai` |
| `pages` | ❌ No | 1 | Number of pages to scrape | `2`, `5` |
| `experience_filter` | ❌ No | All | Experience range in years | `0-1`, `2-5` |
| `posted` | ❌ No | All | Job posting recency | `7days`, `15days`, `30days` |

## Example Requests

### 1. Entry-level jobs in Bengaluru (last 7 days)
```
http://localhost:8080/api/jobs/scrape?role=Software%20Engineer&location=Bengaluru&experience_filter=0-1&posted=7days&pages=2
```

### 2. Mid-level jobs in Mumbai
```
http://localhost:8080/api/jobs/scrape?role=Full%20Stack%20Developer&location=Mumbai&experience_filter=2-5&pages=3
```

### 3. Recent jobs in Pune
```
http://localhost:8080/api/jobs/scrape?role=Backend%20Developer&location=Pune&posted=15days&pages=1
```

## How It Works

1. **Request Flow:**
   - You hit the Spring Boot endpoint with filters
   - JobController receives the request
   - JobService builds a URL with all parameters
   - Calls FastAPI scraper at `http://localhost:5000/scrape-jobs`

2. **Scraping Process:**
   - FastAPI receives the request
   - Playwright browser launches (headless)
   - Navigates to Naukri.com with filters
   - Scrapes job listings from multiple pages
   - Returns JSON data

3. **Data Processing:**
   - JobService normalizes the data
   - Classifies jobs by category
   - Generates unique hash for deduplication
   - Saves to MongoDB
   - Returns saved jobs

## Response Format

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "title": "Software Engineer",
    "company": "Tech Corp",
    "location": "Bengaluru",
    "experience": "0-2 Yrs",
    "skills": "Java, Spring Boot, React",
    "posted": "2 days ago",
    "postedAt": "2025-01-15T10:30:00",
    "url": "https://www.naukri.com/job-listings/...",
    "status": "pending",
    "jobType": "Full-time",
    "seniorityLevel": "Entry Level",
    "category": "Software Development"
  }
]
```

## Troubleshooting

### FastAPI not running
**Error:** `Failed to fetch jobs from scraper API`
**Solution:** Make sure FastAPI is running on port 5000

### No jobs found
**Possible causes:**
- Too restrictive filters
- No matching jobs on Naukri
- Network issues

### Duplicate jobs
The system automatically handles duplicates using job hash (title + company + location)

## Configuration

Edit `demo/src/main/resources/application.properties`:
```properties
# Change scraper URL if needed
jobpilot.scraper.base-url=http://localhost:5000/scrape-jobs
```

## Testing with cURL

```bash
curl "http://localhost:8080/api/jobs/scrape?role=Software%20Engineer&location=Bengaluru&experience_filter=0-1&posted=7days&pages=2"
```

## Testing with Postman

1. Create a new GET request
2. URL: `http://localhost:8080/api/jobs/scrape`
3. Add query parameters:
   - role: `Software Engineer`
   - location: `Bengaluru`
   - experience_filter: `0-1`
   - posted: `7days`
   - pages: `2`
4. Send request

## Notes

- The scraper uses Playwright, so it can handle JavaScript-rendered content
- Jobs are automatically deduplicated before saving
- All scraped jobs start with `status: "pending"`
- Experience filtering happens on the Python side for accuracy
- The system is designed to handle large-scale scraping safely