# JobPilot

A hybrid project combining a Spring Boot backend (demo) with a Python-based Naukri scraper (jobpilot-scraper).

## Projects
- `demo/`: Spring Boot application exposing REST APIs for jobs
- `jobpilot-scraper/`: Python Playwright scrapers and a FastAPI service for Naukri

## Quick start

### Spring Boot (Java 21 recommended)
1. Configure environment variables (never commit secrets):
   - MONGODB_URI
   - MONGODB_DATABASE (default: jobpilot)
   - MAIL_USERNAME
   - MAIL_PASSWORD
   - OPENAI_API_KEY (optional)
   - You can also copy `demo/src/main/resources/application.example.properties` to a local override or set system env vars.
2. Build and run
   - Windows: `demo\mvnw.cmd spring-boot:run`
   - Unix: `./demo/mvnw spring-boot:run`
3. API base: http://localhost:8080

### FastAPI Naukri service
```
cd jobpilot-scraper
python -m venv .venv
. .venv/Scripts/Activate.ps1  # PowerShell on Windows
pip install -r requirements.txt
python -m playwright install
cd naukri
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```
Docs: http://127.0.0.1:8000/docs

### Environment examples
- Copy `jobpilot-scraper/.env.example` to `jobpilot-scraper/.env` and fill values.

## Security
- Secrets are read from environment variables; `.env` files are ignored by git.
- Do not commit real credentials.

## License
MIT