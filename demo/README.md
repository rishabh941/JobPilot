# JobPilot — Spring Boot service

This module exposes REST endpoints to scrape, enrich, deduplicate, and persist jobs. It delegates scraping to a Python FastAPI microservice, then normalizes and classifies returned jobs before saving.

## Key components

- DemoApplication
  - `@SpringBootApplication`
  - `@EnableScheduling` to support cron-based scraping (09:00 daily by default)

- Controllers
  - JobController
    - GET `/api/jobs/scrape`
      - Query: `role`, `location`
      - Optional: `experience_filter`, `posted`, `pages`
      - Calls `JobService.scrapeJobs(...)` and returns saved jobs
    - POST `/api/jobs/add`
    - GET `/api/jobs`
    - GET `/api/jobs/search?title=...&company=...`
  - TelegramJobController (stub)
    - POST `/api/telegram/job`
  - EmailController (stub)
    - GET `/sendEmail`

- Services
  - JobService
    - Builds the FastAPI URL from `jobpilot.scraper.base-url` plus role/location/filters
    - Calls the scraper API and receives `JobResponse { jobs: [...] }`
    - Normalizes and classifies jobs
    - Deduplicates using `jobHash = MD5(title|company|location)`
    - Saves only unique jobs
  - JobNormalizerService
    - Trims/cases title/company/location
    - Normalizes experience ranges (handles unicode dashes, etc.)
  - JobCategoryService
    - Extracts skills from title
    - Infers jobType (Internship/Contract/Remote/Full-time)
    - Infers seniority (Junior/Mid/Senior)
    - Parses posted date heuristically (if provided)
  - JobClassifier
    - Categorizes roles (frontend, backend, data, devops, mobile) using keyword sets
  - AIService (optional)
    - Calls OpenAI Chat Completions with `openai.api.key`

- Scheduler
  - JobScheduler
    - `@Scheduled(cron = "0 0 9 * * ?")`
    - Example: `jobService.scrapeJobs("Software Engineer", "Bangalore", ...)`

- Persistence
  - JobRepository
    - Spring Data repository for Job entities
    - In code, `MongoRepository` is used by default
    - Includes `Optional<Job> findByJobHash(String jobHash)`

## Configuration

Scraper integration:
```
jobpilot.scraper.base-url=http://127.0.0.1:8000/scrape-jobs
```

Database (choose one; Mongo by default):

- MongoDB
```
spring.data.mongodb.uri=mongodb://localhost:27017/jobpilot
```

- MySQL (JPA) — only if you switch repository to JPA
```
# spring.datasource.url=jdbc:mysql://localhost:3306/jobpilot
# spring.datasource.username=YOUR_DB_USER
# spring.datasource.password=YOUR_DB_PASS
# spring.jpa.hibernate.ddl-auto=update
# spring.jpa.show-sql=true
```

Other:
```
server.port=8080
openai.api.key=YOUR_OPENAI_KEY
```

You can also use environment variables instead of putting secrets in `application.properties`.

## Build and run

- Maven
```
./mvnw clean spring-boot:run
```
- Gradle
```
./gradlew clean bootRun
```

## Example requests

Trigger a targeted scrape with filters:
```
curl "http://localhost:8080/api/jobs/scrape?role=Software%20Engineer&location=Bangalore&experience_filter=0-2&posted=7days&pages=2"
```

List all:
```
curl http://localhost:8080/api/jobs
```

Search:
```
curl "http://localhost:8080/api/jobs/search?title=java&company=google"
```

Add a job:
```
curl -X POST http://localhost:8080/api/jobs/add \
  -H "Content-Type: application/json" \
  -d '{"title":"software engineer","company":"acme","location":"bangalore","experience":"0-2 years","applyUrl":"https://example.com/job/123"}'
```

## Notes
- If using MongoRepository, ensure the `Job` model has an `@Id String` field and Spring Data MongoDB dependency is present.
- If using JPA, ensure `@Entity`, `@Id`, and the correct dialect/driver are configured.
- Deduplication relies on consistent normalization; changes to normalization may affect duplicates.