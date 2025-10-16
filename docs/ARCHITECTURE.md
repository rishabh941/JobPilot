# JobPilot Architecture

## Overview

JobPilot is composed of:
- Spring Boot backend (`demo/`): REST APIs, scheduling, normalization, classification, deduplication, persistence.
- Python FastAPI microservice (`jobpilot-scraper/naukri/`): Playwright + BeautifulSoup scraper for Naukri.

## Data flow

1) Client requests scraping:
   - `GET /api/jobs/scrape?role=...&location=...&experience_filter=...&posted=...&pages=...`

2) Spring Boot (JobService) calls FastAPI:
   - `GET {jobpilot.scraper.base-url}?role=...&location=...&experience_filter=...&posted=...&pages=...`

3) FastAPI (`app.py`) delegates to `scrape_jobs(...)` in `scraper.py`:
   - Launches headless Chromium
   - Loads search results pages
   - Parses HTML and extracts job tuples
   - Returns `{"jobs": [...]}`

4) Spring Boot post-processing:
   - JobNormalizerService: lowercases, trims, normalizes experience ranges
   - JobClassifier / JobCategoryService: derive skills, seniority, job type, source
   - Deduplication: generate MD5 `jobHash` of `title|company|location`
   - JobRepository: save only new jobs

5) Response:
   - Returns saved jobs (or a message if no new jobs)

6) Scheduling:
   - `JobScheduler` runs daily at 09:00 to trigger a canned scrape (adjust cron as needed)

## Key configuration

Spring Boot:
```
# FastAPI endpoint
jobpilot.scraper.base-url=http://127.0.0.1:8000/scrape-jobs

# Choose one DB option:

# MongoDB
spring.data.mongodb.uri=mongodb://localhost:27017/jobpilot

# MySQL (JPA)
spring.datasource.url=jdbc:mysql://localhost:3306/jobpilot
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASS
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Server and secrets
server.port=8080
openai.api.key=YOUR_OPENAI_KEY
```

FastAPI:
- Host: `127.0.0.1`
- Port: `8000`
- Endpoint: `/scrape-jobs`
- Dependencies: `playwright`, `beautifulsoup4`, `fastapi`, `uvicorn`

## Error handling and resilience
- Spring catches fetch failures from scraper API and logs an error, returning an empty list.
- Duplicate jobs are skipped based on `jobHash` to avoid uniqueness violations.
- Scraper writes page HTML for inspection to debug selector changes.

## Extensibility
- Add additional sources by creating new FastAPI routes or microservices.
- Standardize scraper response shape to `JobResponse` for Spring ingestion.
- Enhance classification with more robust NLP or ML if needed.
- Parameterize scheduler via properties or database-driven tasks.

## Security
- Keep secrets in environment variables or a secrets manager.
- Avoid committing real credentials (DB/OpenAI).
- Rate-limit scraping, comply with target site terms, and be respectful with delays.