from fastapi import FastAPI
from scraper import scrape_jobs

app = FastAPI(
    title="JobPilot Scraper API",
    description="Playwright-powered Naukri job scraper with filtering and debug logging",
    version="1.0"
)

@app.get("/scrape-jobs")
def scrape_jobs_endpoint(
    role: str,
    location: str,
    pages: int = 1,
    experience_filter: str = None,
    posted: str = None
):
    print("🔥 experience_filter received in API:", experience_filter)
    jobs = scrape_jobs(role, location, pages, experience_filter, posted)
    return {"jobs": jobs}
