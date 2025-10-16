# JobPilot Scraper (FastAPI + Playwright)

FastAPI microservice that scrapes Naukri with Playwright and parses HTML with BeautifulSoup. Returns normalized jobs to the Spring Boot service.

## Setup
```
python -m venv .venv
# Windows PowerShell
. .venv/Scripts/Activate.ps1
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
python -m playwright install
```

## Run the API
```
cd naukri
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Docs: http://127.0.0.1:8000/docs

## Endpoint

GET `/scrape-jobs`

Query params:
- `role`: string (required)
- `location`: string (required)
- `pages`: int (optional, default 1)
- `experience_filter`: string (optional, e.g., `0-1`, `0-2`)
- `posted`: string (optional, e.g., `7days`, `3days`)

Response shape:
```
{
  "jobs": [
    {
      "title": "...",
      "company": "...",
      "location": "...",
      "experience": "0-2 years",
      "salary": "...",
      "posted": "...",
      "applyUrl": "..."
    }
  ]
}
```

## How it works
- Builds a Naukri search URL from role/location plus filters (posted/pagination)
- Navigates via Playwright Chromium (headless), scrolls to trigger dynamic content
- Parses DOM via BeautifulSoup to extract job cards and fields
- Writes debug HTML files locally (e.g., `naukri_page_1.html`) for inspection
- Returns a JSON object with jobs to the caller

## Notes
- Keep the service bound to localhost for development. If you expose it, add proper auth/rate limiting.
- If selectors change on Naukri, update the CSS selectors in `scraper.py`.
- Consider adding a polite delay and user agent to reduce the risk of blocks.