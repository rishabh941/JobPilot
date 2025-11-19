# JobPilot

A hybrid project combining:
- `demo/`: Spring Boot backend exposing REST APIs to trigger scraping, store, enrich, deduplicate, and serve job data.
- `jobpilot-scraper/`: Python FastAPI microservice that scrapes Naukri using Playwright + BeautifulSoup and returns jobs.

High-level flow:
Client → Spring Boot (`/api/jobs/scrape`) → FastAPI (`/scrape-jobs`) → Playwright fetch + BeautifulSoup parse → JSON → Spring normalization/classification/dedup → DB

## Repository structure
- `demo/`: Spring Boot application
- `jobpilot-scraper/naukri/`: FastAPI service and Playwright scraper
- `docs/`: architecture and technical docs

## Quick start

Prerequisites
- Java 21+ and Maven or Gradle
- Python 3.10+ and pip
- Playwright browsers (installed by Playwright)
- Database (MongoDB recommended, see config)

1) Start the FastAPI scraper (on 127.0.0.1:8000)
```
cd jobpilot-scraper
python -m venv .venv
# Windows PowerShell
. .venv/Scripts/Activate.ps1
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
python -m playwright install
cd naukri
uvicorn app:app --reload --host 127.0.0.1 --port 8000
# Docs: http://127.0.0.1:8000/docs
```

2) Configure Spring Boot
Set the scraper base URL so Spring calls your FastAPI service:
```
# application.properties (or env var)
jobpilot.scraper.base-url=http://127.0.0.1:8000/scrape-jobs
```

Database (MongoDB by default, matches MongoRepository in code):
```
spring.data.mongodb.uri=mongodb://localhost:27017/jobpilot
```

Optional JPA/MySQL (only if you switch repository to JPA):
```
spring.datasource.url=jdbc:mysql://localhost:3306/jobpilot
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASS
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

Other secrets:
```
openai.api.key=YOUR_OPENAI_KEY
server.port=8080
```

3) Run Spring Boot
- Maven
```
cd demo
./mvnw spring-boot:run
```
- Gradle
```
cd demo
./gradlew bootRun
```

## REST API (Spring Boot)

Base: http://localhost:8080

- Trigger scrape and save  
  GET `/api/jobs/scrape`  
  Query:
  - `role` (required)
  - `location` (required)
  - `experience_filter` (optional; e.g., 0-1, 0-2)
  - `posted` (optional; e.g., 7days, 3days)
  - `pages` (optional; default 1)

  Example:
  ```
curl "http://localhost:8080/api/jobs/scrape?role=Software%20Engineer&location=Bangalore&experience_filter=0-2&posted=7days&pages=2"
```

- Get all saved jobs  
  GET `/api/jobs`

- Search by title/company  
  GET `/api/jobs/search?title=java&company=google`

- Add a job manually  
  POST `/api/jobs/add`  
  Body:
  ```
  {
    "title": "software engineer",
    "company": "acme",
    "location": "bangalore",
    "experience": "0-2 years",
    "applyUrl": "https://example.com/job/123"
  }
  ```

- Telegram bridge (stub)  
  POST `/api/telegram/job`
```

## Scheduler
A daily scheduled task runs at 09:00 (server time) and triggers a scrape with preset role/location. Controlled in `JobScheduler` (cron expression). Scheduling is enabled via `@EnableScheduling` in `DemoApplication`.

## Data processing pipeline (Spring)
- Normalization: trims/cases fields and normalizes experience ranges.
- Classification/Enrichment: sets skills, job type, seniority, source, and derived fields.
- Deduplication: MD5 `jobHash` over `title|company|location` prevents duplicates.
- Persistence: uses Spring Data repository (Mongo by default).

## Scraper (FastAPI + Playwright)
Endpoint: `GET /scrape-jobs`  
Query: `role`, `location`, `pages`, `experience_filter`, `posted`  
Returns: `{"jobs": [...]}`

The scraper builds a Naukri search URL, navigates with Playwright, scrolls and waits for content, parses via BeautifulSoup, extracts fields, and returns JSON. It may write page HTML locally (e.g., `naukri_page_1.html`) for debugging.

## Troubleshooting
- Empty jobs: Check `jobpilot.scraper.base-url` and FastAPI port.
- Playwright errors: Ensure browsers are installed (`python -m playwright install`).
- Duplicates skipped: Expected due to `jobHash` dedup.
- DB connectivity: Ensure the correct Spring Data starter matches your configurations.


