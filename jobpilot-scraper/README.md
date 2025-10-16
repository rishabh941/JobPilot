# JobPilot Scraper

Python Playwright-based scrapers plus a FastAPI microservice for Naukri.

## Setup
```
python -m venv .venv
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt
python -m playwright install
```

## Run API
```
cd naukri
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

## Environment
- Optional: create a `.env` next to services that need tokens (e.g., Jobpilot-telegram/.env)
- Never commit real secrets; `.env` is gitignored.
